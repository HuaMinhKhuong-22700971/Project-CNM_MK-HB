import { prisma } from "../../config/prisma";

export async function getOrCreateCartByUserId(userId: string) {
  let cart = await prisma.cart.findUnique({ where: { userId } });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId }
    });
  }

  return cart;
}

export async function getCartDetailByUserId(userId: string) {
  const cart = await getOrCreateCartByUserId(userId);

  return prisma.cart.findUnique({
    where: { id: cart.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, slug: true }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });
}

export function findCartItemById(id: string) {
  return prisma.cartItem.findUnique({
    where: { id },
    include: { cart: true }
  });
}

export function findCartItemByCartAndProduct(cartId: string, productId: string) {
  return prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId,
        productId
      }
    }
  });
}

export function addCartItem(data: { cartId: string; productId: string; quantity: number }) {
  return prisma.cartItem.create({ data });
}

export function updateCartItem(id: string, quantity: number) {
  return prisma.cartItem.update({
    where: { id },
    data: { quantity }
  });
}

export function deleteCartItem(id: string) {
  return prisma.cartItem.delete({
    where: { id }
  });
}

export function clearCart(cartId: string) {
  return prisma.cartItem.deleteMany({
    where: { cartId }
  });
}
