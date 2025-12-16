import bcrypt from "bcryptjs";
import { connectDB } from "./config/database.js";
import User from "./models/user.model.js";
import dotenv from "dotenv";

dotenv.config();

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = "admin@eyls.com";
    const adminPassword = "Faith_Admin$321"; // Initial password
    const adminPhone = "+971500000000";

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      // Hash password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      await existingAdmin.update({
        password: hashedPassword,
        isActive: true,
        phoneVerified: true,
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorConfirmedAt: null,
        twoFactorFailedAttempts: 0,
        twoFactorLockUntil: null,
      });

      console.log("\n✅ Super Admin password reset successfully!");
      console.log("-----------------------------------");
      console.log(`📧 Email:    ${adminEmail}`);
      console.log(`🔑 Password: ${adminPassword}`);
      console.log("-----------------------------------");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create Super Admin
    const newAdmin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      phone: adminPhone,
      role: "super_admin",
      isActive: true,
      phoneVerified: true,
    });

    console.log("\n✅ Super Admin created successfully!");
    console.log("-----------------------------------");
    console.log(`👤 Name:     ${newAdmin.name}`);
    console.log(`📧 Email:    ${newAdmin.email}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`📱 Phone:    ${newAdmin.phone}`);
    console.log("-----------------------------------");
    console.log(
      "👉 You can now login with these credentials via Postman or the Frontend."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error);
    process.exit(1);
  }
};

seedAdmin();
