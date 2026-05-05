import { PrismaClient } from './services/api/src/generated/client';

const prisma = new PrismaClient();

async function checkCart() {
  try {
    const user = await prisma.user.findFirst({
      where: { fullName: { contains: 'Hứa Minh Khương' } }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Found User:', user.id, user.fullName);
    
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            productVariant: {
              include: { product: true }
            }
          }
        }
      }
    });
    
    if (!cart) {
      console.log('Cart not found for user');
      return;
    }
    
    console.log('Cart ID:', cart.id);
    console.log('Items:', cart.items.length);
    cart.items.forEach(item => {
      console.log(`- Item ID: ${item.id}, Product: ${item.productVariant.product.name}, Qty: ${item.quantity}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCart();
