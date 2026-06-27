const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const links = await prisma.actionLink.findMany();
    console.log("LINKS VIA ORM:");
    for (const link of links) {
        console.log(`- ${link.label}: imageUrl = ${link.imageUrl}`);
    }
}
main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
