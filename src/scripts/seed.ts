const { PrismaClient } = require('@prisma/client');

const db = new PrismaClient();

async function main() {
    try {
        await db.category.createMany({
            data: [
                { name: "Cardiologist" },         // Heart & blood vessels
                { name: "Neurologist" },          // Brain & nerves
                { name: "Dermatologist" },        // Skin, hair, nails
                { name: "Endocrinologist" },      // Hormones & metabolism
                { name: "Gastroenterologist" },   // Digestive system
                { name: "Pulmonologist" },        // Lungs & breathing
                { name: "Psychiatrist" },         // Mental health
                { name: "Orthopedic Doctor" }     // Bones, joints, muscles
            ],
            skipDuplicates: true, // avoids errors if already seeded
        });
        console.log("Medical categories seeded successfully!");
    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        await db.$disconnect();
    }
}

main();
