import { FastifyInstance } from 'fastify';
import * as argon2 from 'argon2';
import { prisma } from '../../lib/prisma.js';
import { generateJoinCode } from '../../lib/utils.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { config } from '../../lib/config.js';

export class AuthService {
  constructor(private fastify: FastifyInstance) {}

  async register(input: RegisterInput) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });
    if (existingUser) {
      return { error: 'email_exists' };
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(input.password, {
      type: argon2.argon2id,
    });

    if (input.mode === 'create_tenant') {
      // Check if group name already exists (case-insensitive)
      const existingTenant = await prisma.tenant.findFirst({
        where: {
          groupName: {
            equals: input.groupName!,
            mode: 'insensitive',
          },
        },
      });
      if (existingTenant) {
        return { error: 'group_name_exists' };
      }

      // Create user, tenant, and membership in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: input.email.toLowerCase(),
            passwordHash,
            fullName: input.fullName,
            city: input.city,
          },
        });

        const tenant = await tx.tenant.create({
          data: {
            groupName: input.groupName!,
            joinCode: generateJoinCode(),
          },
        });

        const membership = await tx.membership.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            role: 'OWNER',
            isCurrent: true,
          },
        });

        return { user, tenant, membership };
      });

      const tokens = this.generateTokens(result.user.id, result.tenant.id, result.membership.role);
      return { ...result, tokens };
    } else {
      // Join by code
      const tenant = await prisma.tenant.findUnique({
        where: { joinCode: input.joinCode! },
      });
      if (!tenant) {
        return { error: 'invalid_join_code' };
      }

      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: input.email.toLowerCase(),
            passwordHash,
            fullName: input.fullName,
            city: input.city,
          },
        });

        const membership = await tx.membership.create({
          data: {
            userId: user.id,
            tenantId: tenant.id,
            role: 'MEMBER',
            isCurrent: true,
          },
        });

        return { user, membership };
      });

      const tokens = this.generateTokens(result.user.id, tenant.id, result.membership.role);
      return { user: result.user, tenant, membership: result.membership, tokens };
    }
  }

  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: {
        memberships: {
          where: { isCurrent: true },
          include: { tenant: true },
        },
      },
    });

    if (!user) {
      return { error: 'invalid_credentials' };
    }

    const validPassword = await argon2.verify(user.passwordHash, input.password);
    if (!validPassword) {
      return { error: 'invalid_credentials' };
    }

    const currentMembership = user.memberships[0];
    if (!currentMembership) {
      return { error: 'no_membership' };
    }

    const tokens = this.generateTokens(user.id, currentMembership.tenantId, currentMembership.role);
    return { user, membership: currentMembership, tenant: currentMembership.tenant, tokens };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = this.fastify.jwt.verify<{
        userId: string;
        tenantId: string;
        role: string;
        type: string;
      }>(refreshToken);

      if (decoded.type !== 'refresh') {
        return { error: 'invalid_token' };
      }

      // Verify user and membership still exist
      const membership = await prisma.membership.findFirst({
        where: {
          userId: decoded.userId,
          tenantId: decoded.tenantId,
        },
      });

      if (!membership) {
        return { error: 'invalid_token' };
      }

      const tokens = this.generateTokens(decoded.userId, decoded.tenantId, membership.role);
      return { tokens };
    } catch {
      return { error: 'invalid_token' };
    }
  }

  private generateTokens(userId: string, tenantId: string, role: string) {
    const accessToken = this.fastify.jwt.sign(
      { userId, tenantId, role },
      { expiresIn: config.JWT_ACCESS_EXPIRES_IN }
    );

    const refreshToken = this.fastify.jwt.sign(
      { userId, tenantId, role, type: 'refresh' },
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );

    return { access: accessToken, refresh: refreshToken };
  }
}

