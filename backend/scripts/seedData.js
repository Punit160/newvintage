const bcrypt = require('bcryptjs');
const User = require('../models/User');


const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL ;

    const adminExists = await User.findOne({
      email: adminEmail,
      role: 'admin',
    });

    if (adminExists) {
      console.log('✅ Admin already exists');
      return;
    }

    // const hashedPassword = await bcrypt.hash(
    //   process.env.ADMIN_PASSWORD || 'Admin@123456',
    //   12
    // );

    await User.create({
      name: 'Super Admin',
      email: adminEmail,
      password:process.env.ADMIN_PASSWORD,
      role: 'admin',
      isActive: true,
    });

    console.log('🔥 Admin user created successfully');
  } catch (error) {
    console.error('❌ Admin seeding failed:', error.message);
  }
};

module.exports = seedAdmin;
