import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'Dell XPS 15 9530' } },
    include: { images: true }
  });

  if (products.length > 0) {
    const product = products[0];
    const imgUrl = '/media/dell_product_image_1779198165519.png';

    console.log(`Found product ${product.id}`);
    
    // Create image
    await prisma.productImage.create({
      data: {
        productId: product.id,
        imageUrl: imgUrl,
        isPrimary: true
      }
    });
    console.log('Successfully added image to product.');
  } else {
    console.log('Product not found.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
