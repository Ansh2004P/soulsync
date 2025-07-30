const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
    try {
        // Delete all rows from the Category table
        await db.category.deleteMany();

        console.log("✅ Category table emptied successfully");
    } catch (error) {
        console.error("❌ Error emptying the Category table:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
