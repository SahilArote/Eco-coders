import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateFarmerProfileDto } from './dto/update-profile.dto';
import { BankKycDto } from './dto/bank-kyc.dto';
import { ErrorCode } from '../common/constants/error-codes';

@Injectable()
export class FarmersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfileByUserId(userId: string) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
      include: {
        user: {
          select: { id: true, phone: true, email: true, role: true, status: true },
        },
      },
    });

    if (!farmer) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Farmer profile not found for this user.',
      });
    }

    return {
      id: farmer.id,
      userId: farmer.userId,
      phone: farmer.user.phone,
      fullName: farmer.fullName,
      village: farmer.village,
      district: farmer.district,
      state: farmer.state,
      preferredLanguage: farmer.preferredLanguage,
      landSizeAcres: Number(farmer.landSizeAcres),
      registeredCrops: farmer.registeredCrops,
      kycStatus: farmer.kycStatus,
      bankDetails: farmer.bankAccountHolder
        ? {
            accountHolderName: farmer.bankAccountHolder,
            bankName: farmer.bankName,
            accountNumberMasked: farmer.bankAccountMasked,
            ifscCode: farmer.ifscCode,
            verifiedAt: farmer.bankVerifiedAt,
          }
        : null,
    };
  }

  async updateProfile(userId: string, dto: UpdateFarmerProfileDto) {
    const farmer = await this.prisma.farmer.findUnique({
      where: { userId },
    });

    if (!farmer) {
      throw new NotFoundException({
        code: ErrorCode.RESOURCE_NOT_FOUND,
        message: 'Farmer profile not found.',
      });
    }

    const updated = await this.prisma.farmer.update({
      where: { userId },
      data: {
        ...(dto.fullName && { fullName: dto.fullName }),
        ...(dto.village && { village: dto.village }),
        ...(dto.district && { district: dto.district }),
        ...(dto.state && { state: dto.state }),
        ...(dto.preferredLanguage && { preferredLanguage: dto.preferredLanguage }),
        ...(dto.landSizeAcres !== undefined && { landSizeAcres: dto.landSizeAcres }),
        ...(dto.registeredCrops && { registeredCrops: dto.registeredCrops }),
      },
    });

    return updated;
  }

  async submitBankKyc(userId: string, dto: BankKycDto) {
    const masked = '•••• •••• •••• ' + dto.accountNumber.slice(-4);

    const updated = await this.prisma.farmer.update({
      where: { userId },
      data: {
        bankAccountHolder: dto.accountHolderName,
        bankName: dto.bankName,
        bankAccountNumber: dto.accountNumber,
        bankAccountMasked: masked,
        ifscCode: dto.ifscCode.toUpperCase(),
        bankVerifiedAt: new Date(),
        kycStatus: 'COMPLETED',
      },
    });

    return {
      kycStatus: updated.kycStatus,
      bankDetails: {
        accountHolderName: updated.bankAccountHolder,
        bankName: updated.bankName,
        accountNumberMasked: updated.bankAccountMasked,
        ifscCode: updated.ifscCode,
        verifiedAt: updated.bankVerifiedAt,
      },
    };
  }
}
