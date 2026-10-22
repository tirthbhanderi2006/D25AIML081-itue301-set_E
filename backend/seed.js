require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');
const Vehicle = require('./models/Vehicle');
const Booking = require('./models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/driveeasy_db';

const initialUsers = [
  {
    name: 'Tirth Patel',
    email: 'tirth@example.com',
    phone: '+91 98765 43210',
    licenseNumber: 'GJ01-2023-0098765',
    role: 'Customer'
  },
  {
    name: 'Vikram Mehta (Fleet Manager)',
    email: 'manager@driveeasy.com',
    phone: '+91 91234 56789',
    licenseNumber: 'GJ01-2021-MGR001',
    role: 'Fleet Manager'
  },
  {
    name: 'Devraj Joshi (Admin)',
    email: 'admin@driveeasy.com',
    phone: '+91 99999 88888',
    licenseNumber: 'GJ01-2020-ADM999',
    role: 'Admin'
  }
];

const initialVehicles = [
  {
    model: 'Hyundai i20 Asta',
    type: 'Hatchback',
    pricePerDay: 1800,
    available: true,
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Manual',
    imageUrl: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Maruti Suzuki Swift ZXi',
    type: 'Hatchback',
    pricePerDay: 1500,
    available: true,
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Manual',
    imageUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Volkswagen Polo GT',
    type: 'Hatchback',
    pricePerDay: 2200,
    available: false, // Seeded unavailable for Task 1 badge & Task 5 validation test
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Honda City ZX',
    type: 'Sedan',
    pricePerDay: 2800,
    available: true,
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'CVT',
    imageUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Hyundai Verna Turbo',
    type: 'Sedan',
    pricePerDay: 3000,
    available: true,
    seats: 5,
    fuelType: 'Turbo Petrol',
    transmission: 'DCT Automatic',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Skoda Slavia Style',
    type: 'Sedan',
    pricePerDay: 3200,
    available: false, // Seeded unavailable
    seats: 5,
    fuelType: 'Petrol',
    transmission: 'Automatic',
    imageUrl: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Hyundai Creta SX(O)',
    type: 'SUV',
    pricePerDay: 3500,
    available: true,
    seats: 5,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Mahindra Thar 4x4',
    type: 'SUV',
    pricePerDay: 4200,
    available: true,
    seats: 4,
    fuelType: 'Diesel',
    transmission: 'Manual',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80'
  },
  {
    model: 'Toyota Fortuner Legender',
    type: 'SUV',
    pricePerDay: 6500,
    available: false, // Seeded unavailable
    seats: 7,
    fuelType: 'Diesel',
    transmission: 'Automatic',
    imageUrl: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Booking.deleteMany({});
    await Vehicle.deleteMany({});
    await Customer.deleteMany({});
    console.log('Cleared existing database records.');

    // Seed users with roles
    const createdUsers = await Customer.insertMany(initialUsers);
    console.log(`Seeded ${createdUsers.length} users (Customer, Fleet Manager, Admin).`);

    // Seed vehicles
    const createdVehicles = await Vehicle.insertMany(initialVehicles);
    console.log(`Seeded ${createdVehicles.length} vehicles.`);

    // Seed initial booking for customer
    const demoBooking = await Booking.create({
      customerId: createdUsers[0]._id, // Tirth Patel
      vehicleId: createdVehicles[2]._id, // Polo GT
      pickupDate: new Date('2026-09-01'),
      returnDate: new Date('2026-09-05'),
      status: 'reserved',
      totalDays: 4,
      totalAmount: 4 * 2200
    });
    console.log(`Seeded sample booking: ${demoBooking._id}`);

    console.log('\n Database seeding complete with RBAC users!');
    console.log('1. Customer:      tirth@example.com (Role: Customer)');
    console.log('2. Fleet Manager: manager@driveeasy.com (Role: Fleet Manager)');
    console.log('3. Admin:          admin@driveeasy.com (Role: Admin)');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
