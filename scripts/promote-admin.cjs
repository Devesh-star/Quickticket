/**
 * Promote a user to admin role.
 * Usage: node scripts/promote-admin.cjs <email>
 * Example: node scripts/promote-admin.cjs admin@example.com
 */

const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

const email = process.argv[2];
if (!email) {
  console.error("❌ Usage: node scripts/promote-admin.cjs <email>");
  process.exit(1);
}

async function promote() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: { type: String, enum: ["user", "admin"], default: "user" },
    });
    const User = mongoose.models.User || mongoose.model("User", UserSchema);

    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { $set: { role: "admin" } },
      { new: true }
    );

    if (!user) {
      console.error(`❌ No user found with email: ${email}`);
    } else {
      console.log(`✅ ${user.name} (${user.email}) is now an admin!`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

promote();
