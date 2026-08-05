import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Translate Tickets
  await prisma.ticket.updateMany({
    where: { title: 'LBSOD when playing Cyberpunk 2077' },
    data: { title: 'Lỗi màn hình xanh (BSOD) khi chơi Cyberpunk 2077' }
  });
  await prisma.ticket.updateMany({
    where: { title: 'Smoke ticket' },
    data: { title: 'Ticket kiểm thử hệ thống' }
  });
  await prisma.ticket.updateMany({
    where: { title: 'Smoke Customer Ticket' },
    data: { title: 'Yêu cầu hỗ trợ khách hàng' }
  });
  await prisma.ticket.updateMany({
    where: { title: 'Smoke support ticket' },
    data: { title: 'Yêu cầu tư vấn kỹ thuật' }
  });

  // Translate Messages
  await prisma.ticketMessage.updateMany({
    where: { message: 'Checking logs. Done. Issue resolved.' },
    data: { message: 'Đã kiểm tra log hệ thống. Đã xử lý xong lỗi.' }
  });
  await prisma.ticketMessage.updateMany({
    where: { message: 'Issue resolved.' },
    data: { message: 'Vấn đề đã được giải quyết.' }
  });

  console.log('Localization completed.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
