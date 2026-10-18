import mongoose from '../server/node_modules/mongoose/index.js';
import bcrypt from '../server/node_modules/bcryptjs/index.js';
import dotenv from '../server/node_modules/dotenv/lib/main.js';
dotenv.config({ path: './server/.env' });

import { User } from '../server/src/models/User.model.js';
import { Parking } from '../server/src/models/Parking.model.js';
import { Booking } from '../server/src/models/Booking.model.js';
import { ParkingReport } from '../server/src/models/ParkingReport.model.js';
import { generateBookingToken, generateQrDataUrl } from '../server/src/utils/qr.utils.js';

const seedDatabase = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartpark_dev';

  try {
    await mongoose.connect(uri);
    console.log('[Seed] Connected to MongoDB');

    // Clean existing data
    await User.deleteMany({});
    await Parking.deleteMany({});
    await Booking.deleteMany({});
    await ParkingReport.deleteMany({});
    console.log('[Seed] Existing data cleared');

    // 1. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPass = await bcrypt.hash('AdminSecurePass#2026', salt);
    const ownerPass = await bcrypt.hash('OwnerPass#2026', salt);
    const userPass = await bcrypt.hash('UserPass#2026', salt);

    const admin = await User.create({
      name: 'SmartPark System Administrator',
      email: 'admin@smartpark.hyderabad.gov',
      passwordHash: adminPass,
      role: 'ADMIN',
      phone: '+91 40 2320 2834',
      status: 'ACTIVE'
    });

    const owner = await User.create({
      name: 'Hyderabad Transit & Parking Services',
      email: 'owner@hyderabadmetro.org',
      passwordHash: ownerPass,
      role: 'OWNER',
      phone: '+91 98480 12345',
      status: 'ACTIVE'
    });

    const commuter = await User.create({
      name: 'Rahul Sharma',
      email: 'commuter@gmail.com',
      passwordHash: userPass,
      role: 'USER',
      phone: '+91 99887 76655',
      vehicleInfo: {
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09EA1234'
      },
      status: 'ACTIVE'
    });

    console.log('[Seed] Created default users: Admin, Owner, Commuter');

    // 2. Realistic Hyderabad Parking Directory
    const parkingFacilities = [
      {
        name: 'Hitec City Metro Station Parking',
        description: 'Designated multi-modal transit commuter parking adjacent to Hitec City Metro Station. Covered two-wheeler and open four-wheeler bays.',
        category: 'TRANSPORT',
        facilityType: 'Metro station parking',
        address: 'Hitec City Metro Station, Cyber Towers Road, Madhapur',
        locality: 'Hitec City',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        location: {
          type: 'Point',
          coordinates: [78.3762, 17.4475] // [lng, lat]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        accessInstructions: 'Direct entry via Cyber Towers underpass service lane. Scan ticket or online QR at entry boom barrier.',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 15,
          fourWheelerHourlyRate: 35,
          dailyPassRate: 180,
          currency: 'INR',
          notes: 'First 15 minutes free for pick-and-drop'
        },
        totalCapacity: { twoWheeler: 250, fourWheeler: 120, total: 370 },
        availableSlots: { twoWheeler: 85, fourWheeler: 28, total: 113 },
        openingHours: {
          is24x7: false,
          opensAt: '05:30',
          closesAt: '23:30',
          daysOpen: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        bookingSupported: true,
        dataSource: 'Hyderabad Metro Rail Official Directory',
        sourceReference: 'HMR-PARK-HT-01',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-01-10'),
        operationalStatus: 'OPEN',
        lastAvailabilityUpdate: new Date(),
        availabilityUpdatedBy: owner._id,
        createdBy: owner._id
      },
      {
        name: 'Secunderabad Railway Station Multi-Level Car Parking',
        description: 'Multi-level parking facility constructed by South Central Railway catering to platform 1 and platform 10 passengers.',
        category: 'TRANSPORT',
        facilityType: 'Railway station parking',
        address: 'Station Road, Platform 1 Side, Secunderabad',
        locality: 'Secunderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500003',
        location: {
          type: 'Point',
          coordinates: [78.5015, 17.4344]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        accessInstructions: 'Access ramp from main entrance road near booking office.',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 20,
          fourWheelerHourlyRate: 40,
          dailyPassRate: 250,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 400, fourWheeler: 200, total: 600 },
        availableSlots: { twoWheeler: 120, fourWheeler: 45, total: 165 },
        openingHours: { is24x7: true },
        bookingSupported: true,
        dataSource: 'South Central Railway Gazette',
        sourceReference: 'SCR-SEC-MLP-2025',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-01-15'),
        operationalStatus: 'OPEN',
        lastAvailabilityUpdate: new Date(),
        availabilityUpdatedBy: owner._id,
        createdBy: owner._id
      },
      {
        name: 'GHMC Multi-Level Car Parking Abids',
        description: 'Automated puzzle and ramp parking facility established by Greater Hyderabad Municipal Corporation to relieve congested shopping corridor.',
        category: 'GHMC',
        facilityType: 'GHMC parking grounds',
        address: 'Opposite G. Pulla Reddy Sweets, Abids Road, Gunfoundry',
        locality: 'Abids',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500001',
        location: {
          type: 'Point',
          coordinates: [78.4735, 17.3912]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        accessInstructions: 'Drive onto lift platform. Automated vehicle elevator system operates on token/QR.',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 0,
          fourWheelerHourlyRate: 30,
          dailyPassRate: 150,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 0, fourWheeler: 160, total: 160 },
        availableSlots: { twoWheeler: 0, fourWheeler: 54, total: 54 },
        openingHours: {
          is24x7: false,
          opensAt: '08:00',
          closesAt: '22:30'
        },
        bookingSupported: true,
        dataSource: 'GHMC Smart Infrastructure Directory',
        sourceReference: 'GHMC-CZ-ABD-03',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-02-01'),
        operationalStatus: 'OPEN',
        lastAvailabilityUpdate: new Date(),
        availabilityUpdatedBy: owner._id,
        createdBy: owner._id
      },
      {
        name: 'Inorbit Mall Basement & Multi-Tier Parking',
        description: 'Spacious 3-level basement and dedicated ramp parking for retail visitors, diners and cinema patrons.',
        category: 'COMMERCIAL',
        facilityType: 'Shopping mall parking',
        address: 'Inorbit Mall, Mindspace, APIIC Software Layout, Madhapur',
        locality: 'Madhapur',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500081',
        location: {
          type: 'Point',
          coordinates: [78.3867, 17.4349]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'CUSTOMERS_ONLY',
        accessInstructions: 'Security check at entry gate. FASTag or SmartPark QR scan available at entrance.',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 20,
          fourWheelerHourlyRate: 50,
          dailyPassRate: null,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 500, fourWheeler: 600, total: 1100 },
        availableSlots: { twoWheeler: 210, fourWheeler: 180, total: 390 },
        openingHours: {
          is24x7: false,
          opensAt: '10:00',
          closesAt: '23:30'
        },
        bookingSupported: true,
        dataSource: 'Commercial Mall Operator Registry',
        sourceReference: 'INORBIT-HYD-01',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-01-20'),
        operationalStatus: 'OPEN',
        lastAvailabilityUpdate: new Date(),
        availabilityUpdatedBy: owner._id,
        createdBy: owner._id
      },
      {
        name: 'KBR National Park Visitors Parking Area',
        description: 'Designated outdoor gravel parking area for morning walkers, joggers and botanical sanctuary visitors.',
        category: 'PUBLIC',
        facilityType: 'Stadiums, playgrounds and event parking',
        address: 'Opposite TDP Office, Road No 2, Banjara Hills / Jubilee Hills Checkpost',
        locality: 'Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500034',
        location: {
          type: 'Point',
          coordinates: [78.4234, 17.4239]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        pricingModel: 'FREE',
        pricing: {
          twoWheelerHourlyRate: 0,
          fourWheelerHourlyRate: 0,
          currency: 'INR',
          notes: 'Complimentary parking for park visitors'
        },
        totalCapacity: { twoWheeler: 80, fourWheeler: 45, total: 125 },
        availableSlots: { twoWheeler: 40, fourWheeler: 15, total: 55 },
        openingHours: {
          is24x7: false,
          opensAt: '05:30',
          closesAt: '20:00'
        },
        bookingSupported: false, // Walk-in public discovery only
        dataSource: 'Telangana Forest Department',
        sourceReference: 'TFD-KBR-02',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-01-05'),
        operationalStatus: 'OPEN',
        createdBy: admin._id
      },
      {
        name: 'Charminar Bus Stand & Heritage Zone Parking',
        description: 'Designated traffic police monitored parking lot outside pedestrian heritage perimeter.',
        category: 'PUBLIC',
        facilityType: 'Street and public parking',
        address: 'Near Old Bus Terminal, Sardar Mahal Road, Charminar',
        locality: 'Charminar',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500002',
        location: {
          type: 'Point',
          coordinates: [78.4747, 17.3616]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 10,
          fourWheelerHourlyRate: 25,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 200, fourWheeler: 50, total: 250 },
        availableSlots: { twoWheeler: 60, fourWheeler: 12, total: 72 },
        openingHours: { is24x7: false, opensAt: '07:00', closesAt: '23:00' },
        bookingSupported: false,
        dataSource: 'Hyderabad Traffic Police Directory',
        sourceReference: 'HTP-SZ-CH-09',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-02-12'),
        operationalStatus: 'OPEN',
        createdBy: admin._id
      },
      {
        name: 'Gachibowli Athletic Stadium West Gate Parking Ground',
        description: 'Large surface open asphalt parking for sporting events, marathons and corporate functions.',
        category: 'GOVERNMENT',
        facilityType: 'Stadiums, playgrounds and event parking',
        address: 'Old Mumbai Highway, Near IIIT Junction, Gachibowli',
        locality: 'Gachibowli',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500032',
        location: {
          type: 'Point',
          coordinates: [78.3482, 17.4455]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER', 'HEAVY_VEHICLE'],
        publicAccess: 'PUBLIC',
        pricingModel: 'VARIABLE',
        pricing: {
          twoWheelerHourlyRate: 15,
          fourWheelerHourlyRate: 30,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 600, fourWheeler: 350, total: 950 },
        availableSlots: { twoWheeler: 300, fourWheeler: 180, total: 480 },
        openingHours: { is24x7: false, opensAt: '06:00', closesAt: '21:00' },
        bookingSupported: true,
        dataSource: 'Sports Authority of Telangana State',
        sourceReference: 'SATS-GAC-01',
        verificationStatus: 'VERIFIED',
        verifiedBy: admin._id,
        verifiedAt: new Date('2026-02-15'),
        operationalStatus: 'OPEN',
        lastAvailabilityUpdate: new Date(),
        availabilityUpdatedBy: owner._id,
        createdBy: owner._id
      },
      {
        name: 'Ameerpet Metro Hub Commercial Parking Complex',
        description: 'Private managed multi-deck parking lot catering to coaching centers, computer hardware markets and metro commuters.',
        category: 'COMMERCIAL',
        facilityType: 'Markets and commercial complexes',
        address: 'Opposite Big Bazaar, Ameerpet Main Road',
        locality: 'Ameerpet',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500016',
        location: {
          type: 'Point',
          coordinates: [78.4483, 17.4375]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 20,
          fourWheelerHourlyRate: 40,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 180, fourWheeler: 70, total: 250 },
        availableSlots: { twoWheeler: 40, fourWheeler: 15, total: 55 },
        openingHours: { is24x7: false, opensAt: '07:00', closesAt: '22:00' },
        bookingSupported: true,
        dataSource: 'Owner Submitted',
        sourceReference: 'SUBMITTED-BY-METRO-PARK',
        verificationStatus: 'PENDING', // PENDING verification demonstration
        operationalStatus: 'OPEN',
        createdBy: owner._id
      },
      {
        name: 'Dilsukhnagar Market Public Ground Parking',
        description: 'Open municipal ground designated for shoppers visiting fruit and textile markets.',
        category: 'PUBLIC',
        facilityType: 'Markets and commercial complexes',
        address: 'Near Dilsukhnagar Bus Depot, Gaddiannaram Road',
        locality: 'Dilsukhnagar',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500060',
        location: {
          type: 'Point',
          coordinates: [78.5247, 17.3688]
        },
        hasCoordinates: true,
        supportedVehicleTypes: ['TWO_WHEELER', 'FOUR_WHEELER'],
        publicAccess: 'PUBLIC',
        pricingModel: 'PAID',
        pricing: {
          twoWheelerHourlyRate: 15,
          fourWheelerHourlyRate: 30,
          currency: 'INR'
        },
        totalCapacity: { twoWheeler: 150, fourWheeler: 40, total: 190 },
        availableSlots: { twoWheeler: 50, fourWheeler: 10, total: 60 },
        openingHours: { is24x7: false, opensAt: '08:00', closesAt: '22:00' },
        bookingSupported: false,
        dataSource: 'CSV Directory Import',
        sourceReference: 'IMPORT-2026-ROW-14',
        verificationStatus: 'UNVERIFIED', // Demonstrates imported unverified record
        operationalStatus: 'OPEN',
        createdBy: admin._id
      },
      {
        name: 'Secunderabad Clock Tower Heritage Open Lot',
        description: 'Historic open parking space maintained for visitors to surrounding post office and municipal offices.',
        category: 'GOVERNMENT',
        facilityType: 'Street and public parking',
        address: 'Clock Tower Road, Shivaji Nagar, Secunderabad',
        locality: 'Secunderabad',
        city: 'Hyderabad',
        state: 'Telangana',
        postalCode: '500003',
        // Incomplete coordinates to test coverage filter & missing coordinates indicator!
        hasCoordinates: false,
        supportedVehicleTypes: ['TWO_WHEELER'],
        publicAccess: 'PUBLIC',
        pricingModel: 'UNKNOWN',
        totalCapacity: { twoWheeler: 50, fourWheeler: 0, total: 50 },
        availableSlots: { twoWheeler: 20, fourWheeler: 0, total: 20 },
        openingHours: { is24x7: false, opensAt: '08:00', closesAt: '20:00' },
        bookingSupported: false,
        dataSource: 'GHMC Ward 14 Survey',
        verificationStatus: 'UNVERIFIED',
        operationalStatus: 'OPEN',
        createdBy: admin._id
      }
    ];

    const insertedParkings = await Parking.insertMany(parkingFacilities);
    console.log(`[Seed] Seeded ${insertedParkings.length} realistic Hyderabad parking facilities`);

    // 3. Create Sample Real Bookings
    const hitecParking = insertedParkings.find((p) => p.name.includes('Hitec City'));
    const scrParking = insertedParkings.find((p) => p.name.includes('Secunderabad Railway'));

    if (hitecParking && scrParking) {
      // Completed booking with revenue
      const compRef = 'SP-20260215-COMP';
      const compToken = generateBookingToken();
      const compQr = await generateQrDataUrl({ ref: compRef, token: compToken });

      await Booking.create({
        bookingReference: compRef,
        userId: commuter._id,
        parkingId: hitecParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09EA1234',
        startTime: new Date(Date.now() - 48 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 44 * 60 * 60 * 1000),
        bookingStatus: 'COMPLETED',
        qrToken: compToken,
        qrDataUrl: compQr,
        checkInAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        checkOutAt: new Date(Date.now() - 44 * 60 * 60 * 1000),
        priceSnapshot: {
          ratePerHour: 35,
          durationHours: 4,
          totalEstimatedAmount: 140,
          currency: 'INR',
          isFree: false
        }
      });

      // Active confirmed booking
      const actRef = 'SP-20261018-ACTV';
      const actToken = generateBookingToken();
      const actQr = await generateQrDataUrl({ ref: actRef, token: actToken });

      await Booking.create({
        bookingReference: actRef,
        userId: commuter._id,
        parkingId: scrParking._id,
        vehicleType: 'FOUR_WHEELER',
        vehicleNumber: 'TS09EA1234',
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        bookingStatus: 'CONFIRMED',
        qrToken: actToken,
        qrDataUrl: actQr,
        priceSnapshot: {
          ratePerHour: 40,
          durationHours: 4,
          totalEstimatedAmount: 160,
          currency: 'INR',
          isFree: false
        }
      });

      console.log('[Seed] Created sample completed and upcoming bookings');
    }

    // 4. Sample Report
    await ParkingReport.create({
      parkingId: insertedParkings[8]._id, // Dilsukhnagar
      userId: commuter._id,
      issueType: 'INCORRECT_PRICE',
      explanation: 'Two-wheeler parking fee was changed locally to Rs 20 during evening rush hours instead of listed Rs 15.',
      status: 'OPEN'
    });
    console.log('[Seed] Created sample crowd-sourced user report');

    await mongoose.connection.close();
    console.log('[Seed] Database seeding completed successfully.');
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
