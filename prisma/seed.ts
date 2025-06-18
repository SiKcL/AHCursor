import { PrismaClient } from '@prisma/client/extension'

const prisma = new PrismaClient()

async function main() {
  await prisma.product.createMany({
    data: [
      {
        nombre: 'Lechuga Española',
        descripcion: 'Fresca y crujiente, ideal para ensaladas.',
        precio: 1200,
        imageUrl: 'Prod1.jpg',
      },
      {
        nombre: 'Lechuga Hoja de Roble',
        descripcion: 'Suave y tierna, con un toque de dulzura.',
        precio: 1500,
        imageUrl: 'Prod2.jpg',
      },
      {
        nombre: 'Lechuga Francesa',
        descripcion: 'Perfecta para wraps y sándwiches, con un sabor delicado.',
        precio: 1000,
        imageUrl: 'Prod3.jpg',
      },
    ],
  })
}

main()
  .then(() => {
    console.log('🌱 Productos insertados correctamente')
  })
  .catch((e) => {
    console.error('❌ Error al insertar productos', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
