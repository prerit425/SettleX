/**
 * Development-only demo data. Never run against production.
 * Usage: npm run db:seed
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (process.env.NODE_ENV === "production") {
  throw new Error("Refusing to seed a production database. Run only in development.");
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const aditi = await prisma.user.upsert({
    where: { email: "aditi.test@example.com" },
    update: { name: "Aditi Test", passwordHash },
    create: { name: "Aditi Test", email: "aditi.test@example.com", passwordHash },
  });
  const rohan = await prisma.user.upsert({
    where: { email: "rohan.test@example.com" },
    update: { name: "Rohan Test", passwordHash },
    create: { name: "Rohan Test", email: "rohan.test@example.com", passwordHash },
  });

  let group = await prisma.group.findFirst({
    where: { name: "Goa Trip", createdBy: aditi.id },
  });
  if (!group) {
    group = await prisma.group.create({
      data: {
        name: "Goa Trip",
        description: "Three days of sun, sand and seafood",
        createdBy: aditi.id,
        members: {
          create: [{ userId: aditi.id }, { userId: rohan.id }],
        },
      },
    });
  } else {
    for (const userId of [aditi.id, rohan.id]) {
      await prisma.groupMember.upsert({
        where: { groupId_userId: { groupId: group.id, userId } },
        update: {},
        create: { groupId: group.id, userId },
      });
    }
  }

  const existingExpense = await prisma.expense.findFirst({
    where: { groupId: group.id, description: "Dinner by the beach" },
  });
  if (!existingExpense) {
    await prisma.expense.create({
      data: {
        groupId: group.id,
        description: "Dinner by the beach",
        amount: "1000.00",
        paidBy: aditi.id,
        participants: {
          create: [
            { userId: aditi.id, shareAmount: "500.00" },
            { userId: rohan.id, shareAmount: "500.00" },
          ],
        },
      },
    });
  }

  console.log("Seed complete. Demo logins:");
  console.log("  aditi.test@example.com / password123");
  console.log("  rohan.test@example.com / password123");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
