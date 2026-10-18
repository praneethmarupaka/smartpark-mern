import mongoose from '../server/node_modules/mongoose/index.js';
import bcrypt from '../server/node_modules/bcryptjs/index.js';
import dotenv from '../server/node_modules/dotenv/lib/main.js';
dotenv.config({ path: './server/.env' });

import { User } from '../server/src/models/User.model.js';

const createAdmin = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartpark_dev';
  const email = (process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@smartpark.hyderabad.gov').toLowerCase().trim();
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD || 'AdminSecurePass#2026';
  const name = process.env.ADMIN_BOOTSTRAP_NAME || 'SmartPark System Administrator';

  try {
    await mongoose.connect(uri);
    console.log('[Bootstrap] Connected to MongoDB');

    let admin = await User.findOne({ email });
    if (admin) {
      console.log(`[Bootstrap] Admin user already exists with email: ${email}`);
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(password, salt);
      admin.role = 'ADMIN';
      admin.status = 'ACTIVE';
      await admin.save();
      console.log(`[Bootstrap] Admin credentials verified/updated.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      admin = await User.create({
        name,
        email,
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      console.log(`[Bootstrap] Admin account successfully created: ${email}`);
    }

    await mongoose.connection.close();
    console.log('[Bootstrap] Done.');
  } catch (error) {
    console.error('[Bootstrap Error]:', error.message);
    process.exit(1);
  }
};

createAdmin();
