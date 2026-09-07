import { PrismaClient, Role, CenterStatus, SlotStatus, ProcurementStatus, QualityGrade, QualityStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Intelligent Agricultural Procurement Platform...');

  const passwordHash = await bcrypt.hash('Farmer@123', 10);
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const operatorHash = await bcrypt.hash('Operator@123', 10);

  // 1. Seed Admin User
  const adminUser = await prisma.user.upsert({
    where: { phone: '9999999999' },
    update: {},
    create: {
      phone: '9999999999',
      email: 'admin@agriprocure.gov.in',
      passwordHash: adminHash,
      role: Role.ADMIN,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Admin user seeded: ${adminUser.email} (Phone: ${adminUser.phone})`);

  // 2. Seed Five Procurement Centers
  const centersData = [
    {
      code: 'MH-NSK-01',
      name: 'APMC Nashik Main Yard',
      address: 'Panchavati Mandi Complex, Nashik',
      village: 'Panchavati',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.011,
      longitude: 73.791,
      dailyCapacityQuintals: 1500,
      contactPhone: '+91 253 251 4488',
      status: CenterStatus.OPEN,
    },
    {
      code: 'MH-NSK-02',
      name: 'Pimpalgaon Baswant Grain Hub',
      address: 'Highway Sub-Mandi, Pimpalgaon',
      village: 'Pimpalgaon',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.174,
      longitude: 73.987,
      dailyCapacityQuintals: 1200,
      contactPhone: '+91 253 278 1122',
      status: CenterStatus.OPEN,
    },
    {
      code: 'MH-NSK-03',
      name: 'Dindori Sub-Mandi Yard',
      address: 'Dindori APMC Market Yard',
      village: 'Dindori',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.198,
      longitude: 73.834,
      dailyCapacityQuintals: 800,
      contactPhone: '+91 2557 221 044',
      status: CenterStatus.OPEN,
    },
    {
      code: 'MH-NSK-04',
      name: 'Malegaon Agriculture Yard',
      address: 'Camp Road Mandi Yard, Malegaon',
      village: 'Malegaon',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.554,
      longitude: 74.529,
      dailyCapacityQuintals: 1000,
      contactPhone: '+91 2554 233 100',
      status: CenterStatus.OPEN,
    },
    {
      code: 'MH-NSK-05',
      name: 'Lasalgaon APMC Market',
      address: 'Station Road, Lasalgaon',
      village: 'Lasalgaon',
      district: 'Nashik',
      state: 'Maharashtra',
      latitude: 20.147,
      longitude: 74.228,
      dailyCapacityQuintals: 1800,
      contactPhone: '+91 2550 266 011',
      status: CenterStatus.OPEN,
    },
  ];

  const centers = [];
  for (const c of centersData) {
    const center = await prisma.procurementCenter.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
    centers.push(center);

    // Seed 4 counters per center
    for (let i = 1; i <= 4; i++) {
      await prisma.counter.upsert({
        where: {
          centerId_counterNumber: {
            centerId: center.id,
            counterNumber: i,
          },
        },
        update: {},
        create: {
          centerId: center.id,
          counterNumber: i,
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log(`✅ Seeded ${centers.length} Procurement Centers with active counters`);

  // 3. Seed Operators
  const operatorUsers = [];
  for (let i = 0; i < centers.length; i++) {
    const phone = `982000000${i + 1}`;
    const opUser = await prisma.user.upsert({
      where: { phone },
      update: {},
      create: {
        phone,
        email: `operator.nsk${i + 1}@agriprocure.gov.in`,
        passwordHash: operatorHash,
        role: Role.CENTER_OPERATOR,
        status: 'ACTIVE',
      },
    });

    await prisma.centerOperator.upsert({
      where: { userId: opUser.id },
      update: { centerId: centers[i].id },
      create: {
        userId: opUser.id,
        centerId: centers[i].id,
      },
    });

    operatorUsers.push(opUser);
  }
  console.log(`✅ Seeded ${operatorUsers.length} Center Operators assigned to centers`);

  // 4. Seed Five Crops with official MSP rates
  const cropsData = [
    {
      code: 'WHEAT',
      name: 'Wheat (गेहूं)',
      nameHi: 'गेहूं (Sharbati & Lokwan)',
      category: 'CEREALS',
      mspRatePerQuintal: 2275.0,
      unit: 'Quintal',
      isActive: true,
    },
    {
      code: 'SOYBEAN',
      name: 'Soybean (सोयाबीन)',
      nameHi: 'सोयाबीन (Yellow)',
      category: 'OILSEEDS',
      mspRatePerQuintal: 4892.0,
      unit: 'Quintal',
      isActive: true,
    },
    {
      code: 'CHANA',
      name: 'Chana / Gram (चना)',
      nameHi: 'चना (Desi & Kabuli)',
      category: 'PULSES',
      mspRatePerQuintal: 5440.0,
      unit: 'Quintal',
      isActive: true,
    },
    {
      code: 'MAIZE',
      name: 'Maize (मक्का)',
      nameHi: 'मक्का (Hybrid Yellow)',
      category: 'CEREALS',
      mspRatePerQuintal: 2090.0,
      unit: 'Quintal',
      isActive: true,
    },
    {
      code: 'PADDY',
      name: 'Paddy / Rice (धान)',
      nameHi: 'धान (Common)',
      category: 'CEREALS',
      mspRatePerQuintal: 2300.0,
      unit: 'Quintal',
      isActive: true,
    },
  ];

  const crops = [];
  for (const crop of cropsData) {
    const cr = await prisma.crop.upsert({
      where: { code: crop.code },
      update: crop,
      create: crop,
    });
    crops.push(cr);
  }
  console.log(`✅ Seeded ${crops.length} MSP Crops`);

  // 5. Seed Schedules and Slots for current date and upcoming days
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
  const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const mainCenter = centers[0]; // APMC Nashik Main Yard
  const mainCrop = crops[0];     // Wheat

  const schedule = await prisma.procurementSchedule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      centerId: mainCenter.id,
      cropId: mainCrop.id,
      startDate,
      endDate,
      dailyCapacity: 500,
      status: 'ACTIVE',
    },
  });

  // Additional schedule for Soybean
  await prisma.procurementSchedule.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      centerId: mainCenter.id,
      cropId: crops[1].id, // Soybean
      startDate,
      endDate,
      dailyCapacity: 400,
      status: 'ACTIVE',
    },
  });

  const timeWindows = [
    { start: '09:00', end: '10:00' },
    { start: '10:00', end: '11:00' },
    { start: '11:00', end: '12:00' },
    { start: '12:00', end: '13:00' },
    { start: '14:00', end: '15:00' },
    { start: '15:00', end: '16:00' },
    { start: '16:00', end: '17:00' },
  ];

  const targetDates = [
    new Date(today.getFullYear(), today.getMonth(), today.getDate()),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
  ];

  const slots = [];
  for (const d of targetDates) {
    for (const tw of timeWindows) {
      const slot = await prisma.slot.upsert({
        where: {
          scheduleId_slotDate_startTime: {
            scheduleId: schedule.id,
            slotDate: d,
            startTime: tw.start,
          },
        },
        update: {},
        create: {
          scheduleId: schedule.id,
          slotDate: d,
          startTime: tw.start,
          endTime: tw.end,
          capacity: 20,
          bookedCount: 0,
          status: SlotStatus.AVAILABLE,
        },
      });
      slots.push(slot);
    }
  }
  console.log(`✅ Seeded ${slots.length} Time Slots across next 3 days`);

  // 6. Seed Primary Demo Farmer (matches mobile app defaults!)
  const farmerUser = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      passwordHash,
      role: Role.FARMER,
      status: 'ACTIVE',
    },
  });

  const demoFarmer = await prisma.farmer.upsert({
    where: { userId: farmerUser.id },
    update: {},
    create: {
      userId: farmerUser.id,
      fullName: 'Ramesh Kisan Patil',
      village: 'Panchavati',
      district: 'Nashik',
      state: 'Maharashtra',
      preferredLanguage: 'mr',
      landSizeAcres: 4.5,
      registeredCrops: ['WHEAT', 'SOYBEAN', 'CHANA'],
      kycStatus: 'COMPLETED',
      bankAccountHolder: 'Ramesh Kisan Patil',
      bankName: 'State Bank of India',
      bankAccountNumber: '123456789012',
      bankAccountMasked: '•••• •••• •••• 9012',
      ifscCode: 'SBIN0001234',
      bankVerifiedAt: new Date(),
    },
  });
  console.log(`✅ Seeded Demo Farmer: ${demoFarmer.fullName} (${farmerUser.phone}) with completed Bank KYC`);

  // 7. Seed active booking for demo farmer
  const demoSlot = slots[1]; // 10:00 - 11:00 slot
  const bookingToken = 'A105';

  const demoBooking = await prisma.booking.upsert({
    where: {
      centerId_slotId_tokenNumber: {
        centerId: mainCenter.id,
        slotId: demoSlot.id,
        tokenNumber: bookingToken,
      },
    },
    update: {},
    create: {
      farmerId: demoFarmer.id,
      centerId: mainCenter.id,
      cropId: mainCrop.id,
      slotId: demoSlot.id,
      estimatedQuantityQuintals: 40.0,
      vehicleType: 'tractor',
      tokenNumber: bookingToken,
      status: ProcurementStatus.PROCESSING,
      qrPayload: `AGRI-PROC-TOKEN|${bookingToken}|${mainCenter.code}|${mainCrop.code}|40Q|${demoFarmer.fullName}`,
      arrivalAt: new Date(Date.now() - 30 * 60 * 1000), // arrived 30 mins ago
      processingStartedAt: new Date(Date.now() - 5 * 60 * 1000),
    },
  });

  // Increment slot booked count
  await prisma.slot.update({
    where: { id: demoSlot.id },
    data: { bookedCount: { increment: 1 } },
  });

  // Create Procurement with Quality Check and Weighment
  const demoProcurement = await prisma.procurement.upsert({
    where: { bookingId: demoBooking.id },
    update: {},
    create: {
      bookingId: demoBooking.id,
      farmerId: demoFarmer.id,
      centerId: mainCenter.id,
      status: ProcurementStatus.PROCESSING,
      acceptedQuantity: 40.0,
    },
  });

  await prisma.qualityCheck.upsert({
    where: { procurementId: demoProcurement.id },
    update: {},
    create: {
      procurementId: demoProcurement.id,
      moisturePercentage: 10.4,
      moistureStandardMax: 12.0,
      foreignMatterPercentage: 0.3,
      qualityGrade: QualityGrade.GRADE_A,
      qualityStatus: QualityStatus.PASSED,
      remarks: 'Grade A Sharbati wheat, verified low moisture and clean grain.',
      checkedById: operatorUsers[0].id,
    },
  });

  await prisma.weighment.upsert({
    where: { procurementId: demoProcurement.id },
    update: {},
    create: {
      procurementId: demoProcurement.id,
      grossWeightKg: 5200.0,
      tareWeightKg: 1200.0,
      netWeightKg: 4000.0,
      netQuintals: 40.0,
      weighbridgeId: 'WB-01',
      weighedById: operatorUsers[0].id,
    },
  });

  await prisma.payment.upsert({
    where: { procurementId: demoProcurement.id },
    update: {},
    create: {
      procurementId: demoProcurement.id,
      amount: 40.0 * 2275.0, // 40 Q * ₹2,275 = ₹91,000
      mspRate: 2275.0,
      quantityQuintals: 40.0,
      currency: 'INR',
      status: PaymentStatus.PAYMENT_PROCESSING,
      dbtReferenceNumber: 'DBT-IN-20260906-84920',
      bankName: 'State Bank of India',
      accountMasked: '•••• •••• •••• 9012',
      initiatedAt: new Date(),
    },
  });

  // Seed demo notifications for the demo farmer
  await prisma.notification.createMany({
    data: [
      {
        userId: farmerUser.id,
        type: 'TOKEN_CALLED',
        title: '🚀 Your Token is Called: A105',
        message: 'Please proceed to Counter #1 immediately.',
        channel: 'IN_APP',
        isRead: false,
      },
      {
        userId: farmerUser.id,
        type: 'STATUS_CHANGE',
        title: 'Weighment Completed: 40.0 Quintals',
        message: 'Gross: 5200kg, Tare: 1200kg. Net: 4000kg (40 Q).',
        channel: 'IN_APP',
        isRead: true,
      },
      {
        userId: farmerUser.id,
        type: 'REMINDER',
        title: 'Slot Booked: Token A105',
        message: 'Wheat at APMC Nashik Main Yard (10:00 - 11:00 AM).',
        channel: 'IN_APP',
        isRead: true,
      },
    ],
  });

  console.log('✅ Seeded demo booking, quality check, weighment, and notifications for Ramesh Patil');
  console.log('✨ Database seeding successfully completed! Ready for immediate production & demo execution.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
