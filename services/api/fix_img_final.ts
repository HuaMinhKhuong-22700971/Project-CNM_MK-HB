import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { name: { contains: 'Dell' } },
    include: { ProductSku: true, ProductVariant: true }
  });

  for (const p of products) {
    console.log(`Product: ${p.name}`);
    let imgVal = null;
    if (p.name.includes("Alienware")) {
        imgVal = '/media/dell_alienware_new.png';
    } else if (p.name.includes("XPS")) {
        imgVal = '/media/dell_xps.png';
    }

    if (imgVal) {
        if (p.ProductSku.length > 0) {
            await prisma.productSku.update({ where: { id: p.ProductSku[0].id }, data: { image_url: imgVal } });
            console.log(`Updated Sku for ${p.name}`);
        } else {
            console.log(`No SKU found for ${p.name}, creating one...`);
            await prisma.productSku.create({
                data: {
                    product_id: p.id,
                    sku: `SKU-${p.id}`,
                    price: p.price || 1000000,
                    stock: 10,
                    image_url: imgVal,
                    status: 'ACTIVE',
                    is_active: true
                }
            });
        }
        
        if (p.ProductVariant.length > 0) {
             await prisma.productVariant.update({ where: { id: p.ProductVariant[0].id }, data: { image_url: imgVal } });
             console.log(`Updated Variant for ${p.name}`);
        } else {
             console.log(`No Variant found for ${p.name}, creating one...`);
             await prisma.productVariant.create({
                data: {
                    product_id: p.id,
                    sku: `VAR-${p.id}`,
                    price: p.price || 1000000,
                    stock_quantity: 10,
                    image_url: imgVal,
                    status: 'ACTIVE',
                    is_active: true
                }
             })
        }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
