import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding MEM database...');

  // --- CATEGORÍAS ---
  const sillones = await prisma.category.upsert({
    where: { id: 1 },
    update: { name: 'Sillones', description: 'Sistema modular de sillones MEM' },
    create: { id: 1, name: 'Sillones', description: 'Sistema modular de sillones MEM' },
  });
  const camas = await prisma.category.upsert({
    where: { id: 2 },
    update: { name: 'Camas', description: 'Camas plataforma de diseño MEM' },
    create: { id: 2, name: 'Camas', description: 'Camas plataforma de diseño MEM' },
  });
  const mesas = await prisma.category.upsert({
    where: { id: 3 },
    update: { name: 'Mesas', description: 'Mesas, aparadores y recibidores MEM' },
    create: { id: 3, name: 'Mesas', description: 'Mesas, aparadores y recibidores MEM' },
  });
  const almohadones = await prisma.category.upsert({
    where: { id: 4 },
    update: { name: 'Almohadones', description: 'Almohadones Patchwork MEM' },
    create: { id: 4, name: 'Almohadones', description: 'Almohadones Patchwork MEM' },
  });
  const modulos = await prisma.category.upsert({
    where: { id: 5 },
    update: { name: 'Módulos Gráfico', description: 'Muebles modulares de la línea Gráfico' },
    create: { id: 5, name: 'Módulos Gráfico', description: 'Muebles modulares de la línea Gráfico' },
  });

  // --- PRODUCTOS ---
  // Las imageUrl son placeholders. Reemplazá con las fotos reales desde el panel admin.
  await prisma.product.createMany({
    skipDuplicates: true,
    data: [
      // ── SILLONES ────────────────────────────────────────────────────────────
      {
        id: 1,
        categoryId: sillones.id,
        name: 'Sillón Sonia 1 cuerpo modular',
        description: 'El sillón Sonia de un cuerpo es el módulo base del sistema. De líneas simples y formas que parecen flotar, está pensado para armar distintas configuraciones según el espacio. Tapizado removible con funda intercambiable. Estructura de MDF con terminación laqueada. 100% personalizable en colores y telas.',
        price: 280000,
        productionCost: 130000,
        stock: 20,
        minStock: 5,
        minWidth: 80,
        maxWidth: 100,
        minHeight: 65,
        maxHeight: 75,
        minDepth: 80,
        maxDepth: 100,
        material: 'MDF laqueado / Tapizado intercambiable',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      },
      {
        id: 2,
        categoryId: sillones.id,
        name: 'Sillón Sonia 2 cuerpos',
        description: 'El sillón Sonia de 2 cuerpos está pensado para compartir. Mismo sistema modular que el de 1 cuerpo: estructura laqueada y funda intercambiable. Se puede combinar con otros módulos para armar el sofá que más te guste. Personalizable en colores, telas y terminaciones.',
        price: 490000,
        productionCost: 240000,
        stock: 15,
        minStock: 4,
        minWidth: 160,
        maxWidth: 210,
        minHeight: 65,
        maxHeight: 75,
        minDepth: 80,
        maxDepth: 100,
        material: 'MDF laqueado / Tapizado intercambiable',
        imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80',
      },
      {
        id: 3,
        categoryId: sillones.id,
        name: 'Sillón Sonia 3 cuerpos',
        description: 'El sillón Sonia de 3 cuerpos incluye tres módulos unidos. La pieza central del living. Diseño gráfico de líneas simples con estructura laqueada y tapizado con funda intercambiable. Armá la configuración que mejor se adapte a tu espacio y estilo.',
        price: 680000,
        productionCost: 330000,
        stock: 10,
        minStock: 3,
        minWidth: 230,
        maxWidth: 290,
        minHeight: 65,
        maxHeight: 75,
        minDepth: 80,
        maxDepth: 100,
        material: 'MDF laqueado / Tapizado intercambiable',
        imageUrl: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800&q=80',
      },
      // ── MÓDULOS GRÁFICO ──────────────────────────────────────────────────────
      {
        id: 4,
        categoryId: modulos.id,
        name: 'Módulos Gráfico',
        description: 'Muebles modulares Gráfico. De líneas simples y formas que parecen flotar, nace este sistema de módulos pensado para armar distintas configuraciones. Estructura con borde gráfico definido, tapizado intercambiable. Se arma sin herramientas. 100% personalizable en colores y tamaños.',
        price: 320000,
        productionCost: 150000,
        stock: 12,
        minStock: 3,
        minWidth: 80,
        maxWidth: 300,
        minHeight: 60,
        maxHeight: 75,
        minDepth: 80,
        maxDepth: 100,
        material: 'MDF laqueado con borde gráfico / Tapizado intercambiable',
        imageUrl: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80',
      },
      // ── CAMAS ────────────────────────────────────────────────────────────────
      {
        id: 5,
        categoryId: camas.id,
        name: 'Cama Dora',
        description: 'La cama Dora es una plataforma baja hecha de encastres. Las medidas de salientes son SIEMPRE de 20cm a los laterales y 15cm en los pies de plataforma útil. Se fabrica a la medida de tu colchón. De fácil y rápido armado, sin herramientas. Disponible en madera natural y distintas terminaciones laqueadas.',
        price: 420000,
        productionCost: 200000,
        stock: 15,
        minStock: 4,
        minWidth: 108,
        maxWidth: 200,
        minHeight: 25,
        maxHeight: 35,
        minDepth: 193,
        maxDepth: 230,
        material: 'Madera maciza / MDF laqueado',
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80',
      },
      // ── MESAS ────────────────────────────────────────────────────────────────
      {
        id: 6,
        categoryId: mesas.id,
        name: 'Mesa Oval',
        description: 'La tapa ovalada le otorga las ventajas de una mesa rectangular con la circulación de una redonda. Misma estructura y sistema que la Mesa Rectangular. Base en T de madera maciza, tapa intercambiable en madera natural o laqueada en todos los colores de la paleta MEM.',
        price: 420000,
        productionCost: 200000,
        stock: 6,
        minStock: 2,
        minWidth: 130,
        maxWidth: 200,
        minHeight: 72,
        maxHeight: 78,
        minDepth: 80,
        maxDepth: 110,
        material: 'Madera maciza / MDF laqueado',
        imageUrl: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=800&q=80',
      },
      {
        id: 7,
        categoryId: mesas.id,
        name: 'Mesa Rectangular',
        description: 'Misma estructura y sistema que nuestra mesa oval, pero con tapa rectangular para una versión clásica, robusta y simple. Patas en T de madera maciza. Tapa disponible en madera natural o laqueada en todos los colores MEM. Fabricada a la medida que necesités.',
        price: 380000,
        productionCost: 180000,
        stock: 8,
        minStock: 2,
        minWidth: 140,
        maxWidth: 240,
        minHeight: 72,
        maxHeight: 78,
        minDepth: 80,
        maxDepth: 100,
        material: 'Madera maciza / MDF laqueado',
        imageUrl: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&q=80',
      },
      {
        id: 8,
        categoryId: mesas.id,
        name: 'Aparador Alto (barra)',
        description: 'Es ideal como barra de desayuno, escritorio de pie, mesa de trabajo o barra de bar. Estructura de madera con tapa a la altura de barra. Disponible en madera natural o laqueado en todos los colores. Medidas personalizables en largo y profundidad.',
        price: 290000,
        productionCost: 138000,
        stock: 8,
        minStock: 2,
        minWidth: 100,
        maxWidth: 200,
        minHeight: 90,
        maxHeight: 105,
        minDepth: 35,
        maxDepth: 55,
        material: 'Madera maciza / MDF laqueado',
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
      },
      {
        id: 9,
        categoryId: mesas.id,
        name: 'Aparador Bajo (rack - mesa ratona)',
        description: 'Es un mueble súper versátil: funciona como barra para música, TV, mesa ratona, banco o superficie de apoyo en cualquier ambiente. Estructura laqueada en todos los colores. Patas en T de madera maciza. Medidas a elección.',
        price: 220000,
        productionCost: 105000,
        stock: 10,
        minStock: 3,
        minWidth: 80,
        maxWidth: 180,
        minHeight: 35,
        maxHeight: 50,
        minDepth: 35,
        maxDepth: 55,
        material: 'MDF laqueado / Madera maciza',
        imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80',
      },
      {
        id: 10,
        categoryId: mesas.id,
        name: 'Recibidor',
        description: 'Es perfecto como mesa de llaves, recibidor de entrada o consola. Diseño de líneas simples que no ocupa espacio. Disponible en madera natural y en todos los colores laqueados de la paleta MEM. Medidas personalizables en largo.',
        price: 185000,
        productionCost: 88000,
        stock: 12,
        minStock: 3,
        minWidth: 80,
        maxWidth: 160,
        minHeight: 75,
        maxHeight: 90,
        minDepth: 25,
        maxDepth: 40,
        material: 'MDF laqueado / Madera maciza',
        imageUrl: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      },
      // ── ALMOHADONES ──────────────────────────────────────────────────────────
      {
        id: 11,
        categoryId: almohadones.id,
        name: 'Almohadones Patchwork',
        description: 'A partir de los sobrantes de las telas que usamos en los muebles, hacemos almohadones únicos. Cada pieza es irrepetible: combinaciones de retazos y colores que dan vida a los módulos y a cualquier espacio. Medidas estándar 50×50cm.',
        price: 28000,
        productionCost: 12000,
        stock: 50,
        minStock: 15,
        material: 'Retazos de telas MEM seleccionadas',
        imageUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800&q=80',
      },
    ],
  });

  // --- USUARIO ADMIN ---
  const adminPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@mem.ar' },
    update: {},
    create: {
      name: 'Administrador MEM',
      email: 'admin@mem.ar',
      password: adminPassword,
      role: 'ADMIN',
      phone: '+54 11 0000-0000',
    },
  });

  // --- USUARIO DE PRUEBA ---
  const customerPassword = await bcrypt.hash('cliente123', 12);
  await prisma.user.upsert({
    where: { email: 'cliente@test.ar' },
    update: {},
    create: {
      name: 'Laura Martínez',
      email: 'cliente@test.ar',
      password: customerPassword,
      role: 'CUSTOMER',
      phone: '+54 11 2345-6789',
      address: 'Av. Corrientes 1500, CABA',
    },
  });

  // --- PROVEEDORES ---
  await prisma.supplier.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Maderas del Río',
      email: 'ventas@maderasdelrio.com.ar',
      phone: '+54 11 4321-0000',
      address: 'Parque Industrial La Matanza, Buenos Aires',
    },
  });
  await prisma.supplier.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Textiles Porteños',
      email: 'pedidos@textilespor.com.ar',
      phone: '+54 11 5555-1234',
      address: 'Av. Avellaneda 2400, CABA',
    },
  });

  console.log('✅ Seed completado!');
  console.log('👤 Admin:   admin@mem.ar / admin123');
  console.log('👤 Cliente: cliente@test.ar / cliente123');
  console.log('📦 11 productos cargados');
  console.log('💡 Para agregar fotos reales: entrá al panel admin y editá cada producto');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
