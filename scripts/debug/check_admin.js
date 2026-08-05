const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../services/api/.env') });

const prisma = new PrismaClient();

(async () => {
    try {
        const users = await prisma.user.findMany({
            include: { Role: true }
        });

        console.log('\n=== Danh sách Users trong PostgreSQL ===');
        for (const u of users) {
            console.log(`- ID: ${u.id} | Email: ${u.email} | Name: ${u.full_name} | Role: ${u.Role?.name || 'N/A'}`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
})();
