import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo user
    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.user.upsert({
        where: { email: 'demo@exemplo.com' },
        update: {},
        create: {
            email: 'demo@exemplo.com',
            password: hashedPassword,
            name: 'Usuário Demo',
        },
    });

    console.log('✅ Created demo user:', user.email);

    // Create sample sales
    const sales = await prisma.sale.createMany({
        data: [
            {
                userId: user.id,
                clientName: 'João Silva',
                itemSold: 'Notebook Dell',
                value: 2500.00,
                date: '2025-12-01',
                status: 'paid',
            },
            {
                userId: user.id,
                clientName: 'Maria Santos',
                itemSold: 'Mouse Logitech',
                value: 150.00,
                date: '2025-12-05',
                status: 'pending',
            },
            {
                userId: user.id,
                clientName: 'João Silva',
                itemSold: 'Teclado Mecânico',
                value: 450.00,
                date: '2025-12-08',
                status: 'pending',
            },
        ],
    });

    console.log(`✅ Created ${sales.count} sample sales`);
    console.log('\n🎉 Seeding completed!');
    console.log('\n📝 Demo credentials:');
    console.log('   Email: demo@exemplo.com');
    console.log('   Password: 123456');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
