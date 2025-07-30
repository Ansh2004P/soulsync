const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();
async function main() {
    try {
        await db.category.createMany({
            data: [
                { name: " Famous Personality" },
                { name: " Games" },
                { name: " Scientist" },
                { name: " Animals" },
                { name: " Philosophy" },
                { name: " Movies and TV" },
                { name: " Musicians" },

            ]
        })
    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        await db.$disconnect();
    }
}

main();