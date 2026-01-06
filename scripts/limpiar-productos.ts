import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function limpiarProductos() {
  try {
    console.log('🗑️ Eliminando todos los productos...');
    
    // Eliminar detalles de pedidos primero (por restricciones de FK)
    await prisma.pedidoDetalle.deleteMany({});
    console.log('✅ Detalles de pedidos eliminados');
    
    // Eliminar pedidos
    await prisma.pedido.deleteMany({});
    console.log('✅ Pedidos eliminados');
    
    // Eliminar detalles de ventas
    await prisma.ventaDetalle.deleteMany({});
    console.log('✅ Detalles de ventas eliminados');
    
    // Eliminar ventas
    await prisma.venta.deleteMany({});
    console.log('✅ Ventas eliminadas');
    
    // Eliminar movimientos de inventario
    await prisma.movimientoInventario.deleteMany({});
    console.log('✅ Movimientos de inventario eliminados');
    
    // Eliminar productos
    const { count } = await prisma.producto.deleteMany({});
    console.log(`✅ ${count} productos eliminados`);
    
    // Eliminar categorías
    const { count: catCount } = await prisma.categoria.deleteMany({});
    console.log(`✅ ${catCount} categorías eliminadas`);
    
    console.log('\n✨ Base de datos limpiada exitosamente');
  } catch (error) {
    console.error('❌ Error al limpiar la base de datos:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

limpiarProductos();
