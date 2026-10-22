
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_STAFF_EMAIL;
  const name = process.env.SEED_STAFF_NAME;
  const password = process.env.SEED_STAFF_PASSWORD;

  if (!email || !name || !password) {
    throw new Error(
      "Set SEED_STAFF_EMAIL, SEED_STAFF_NAME, and SEED_STAFF_PASSWORD in .env",
    );
  }

  if (password.length < 8) {
    throw new Error("The seed password must contain at least 8 characters.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const staff = await prisma.staff.upsert({
    where: { email: email.trim().toLowerCase() },
    update: {
      name: name.trim(),
      passwordHash,
    },
    create: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    },
  });

  console.log(`Seed staff account ready: ${staff.email}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed staff account:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
