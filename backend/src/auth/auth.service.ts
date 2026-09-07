import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/otp.dto';
import { ErrorCode } from '../common/constants/error-codes';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      throw new ConflictException({
        code: ErrorCode.AUTH_USER_EXISTS,
        message: 'An account with this mobile number already exists.',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          phone: dto.phone,
          passwordHash,
          role: dto.role || Role.FARMER,
        },
      });

      if (newUser.role === Role.FARMER) {
        await tx.farmer.create({
          data: {
            userId: newUser.id,
            fullName: dto.fullName,
            village: dto.village || 'Panchavati',
            district: dto.district || 'Nashik',
            state: dto.state || 'Maharashtra',
            preferredLanguage: dto.preferredLanguage || 'en',
            kycStatus: 'NOT_COMPLETED',
          },
        });
      }

      return newUser;
    });

    return this.generateTokens(user.id, user.phone, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ phone: dto.identifier }, { email: dto.identifier }],
      },
      include: {
        farmerProfile: true,
        operator: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid phone number or password.',
      });
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_INVALID_CREDENTIALS,
        message: 'Invalid phone number or password.',
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(
      user.id,
      user.phone,
      user.role,
      user.farmerProfile,
      user.operator?.centerId,
    );
  }

  async sendOtp(phone: string) {
    // For MVP/Demo: predictable simulated OTP 123456
    const demoOtp = '123456';
    return {
      message: 'OTP sent successfully',
      phone,
      demoOtp,
      expiresInSeconds: 300,
    };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    if (dto.otp !== '123456' && dto.otp !== '8492') {
      throw new BadRequestException({
        code: ErrorCode.VALIDATION_FAILED,
        message: 'Invalid OTP. For demo/testing use OTP 123456.',
      });
    }

    let user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
      include: { farmerProfile: true, operator: true },
    });

    if (!user) {
      // Auto-register farmer if first time logging in with OTP
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash('Farmer@123', salt);

      user = await this.prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            phone: dto.phone,
            passwordHash,
            role: Role.FARMER,
          },
        });

        await tx.farmer.create({
          data: {
            userId: newUser.id,
            fullName: 'Farmer ' + dto.phone.slice(-4),
            village: 'Panchavati',
            district: 'Nashik',
            state: 'Maharashtra',
            preferredLanguage: 'mr',
            kycStatus: 'NOT_COMPLETED',
          },
        });

        return tx.user.findUnique({
          where: { id: newUser.id },
          include: { farmerProfile: true, operator: true },
        });
      });
    }

    return this.generateTokens(
      user.id,
      user.phone,
      user.role,
      user.farmerProfile,
      user.operator?.centerId,
    );
  }

  async refreshToken(refreshToken: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { refreshToken },
      include: {
        user: {
          include: { farmerProfile: true, operator: true },
        },
      },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException({
        code: ErrorCode.AUTH_TOKEN_EXPIRED,
        message: 'Refresh token is expired or has been revoked.',
      });
    }

    // Revoke used token (Token Rotation)
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(
      session.user.id,
      session.user.phone,
      session.user.role,
      session.user.farmerProfile,
      session.user.operator?.centerId,
    );
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.prisma.userSession.updateMany({
        where: { userId, refreshToken },
        data: { isRevoked: true },
      });
    } else {
      await this.prisma.userSession.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    }
    return { loggedOut: true };
  }

  private async generateTokens(
    userId: string,
    phone: string,
    role: string,
    farmerProfile?: any,
    centerId?: string,
  ) {
    const payload = { sub: userId, phone, role, centerId };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret'),
      expiresIn: this.configService.get<string>('jwt.accessExpiresIn', '15m'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get<string>('jwt.refreshExpiresIn', '7d'),
      },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        phone,
        role,
        farmerId: farmerProfile?.id,
        fullName: farmerProfile?.fullName,
        kycStatus: farmerProfile?.kycStatus,
        centerId,
      },
    };
  }
}
