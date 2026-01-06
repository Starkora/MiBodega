import type { APIRoute } from 'astro';
import prisma from '../../../lib/prisma';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    if (!pedido) {
      return new Response(
        JSON.stringify({ error: 'Pedido no encontrado' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(pedido), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    return new Response(JSON.stringify({ error: 'Error al obtener pedido' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const id = parseInt(params.id!);
    const data = await request.json();
    const { estado, detalles, clienteNombre, clienteTelefono, notas } = data;

    // Si se está confirmando el pedido, crear venta y actualizar inventario
    if (estado === 'confirmado') {
      // Obtener el pedido actual con sus detalles
      const pedidoActual = await prisma.pedido.findUnique({
        where: { id },
        include: {
          detalles: {
            include: {
              producto: true
            }
          }
        }
      });

      if (!pedidoActual) {
        return new Response(
          JSON.stringify({ error: 'Pedido no encontrado' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Verificar stock disponible
      for (const detalle of pedidoActual.detalles) {
        if (detalle.producto.stock < detalle.cantidad) {
          return new Response(
            JSON.stringify({ 
              error: `Stock insuficiente para ${detalle.producto.nombre}. Disponible: ${detalle.producto.stock}, Solicitado: ${detalle.cantidad}` 
            }),
            { status: 400, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }

      // Transacción para crear venta, actualizar inventario y marcar pedido como confirmado
      const resultado = await prisma.$transaction(async (tx: any) => {
        // 1. Crear venta
        const numeroVenta = 'V' + Date.now().toString().slice(-8);
        const venta = await tx.venta.create({
          data: {
            numeroVenta,
            total: pedidoActual.total,
            subtotal: pedidoActual.total,
            descuento: 0,
            metodoPago: 'efectivo',
            clienteNombre: pedidoActual.clienteNombre,
            clienteTelefono: pedidoActual.clienteTelefono,
            notas: pedidoActual.notas,
            detalles: {
              create: pedidoActual.detalles.map((d: any) => ({
                productoId: d.productoId,
                cantidad: d.cantidad,
                precioUnitario: d.precioUnitario,
                subtotal: d.subtotal
              }))
            }
          },
          include: {
            detalles: {
              include: {
                producto: true
              }
            }
          }
        });

        // 2. Actualizar stock de productos y crear movimientos de inventario
        for (const detalle of pedidoActual.detalles) {
          // Obtener stock actual antes de actualizar
          const productoActual = await tx.producto.findUnique({
            where: { id: detalle.productoId }
          });

          // Actualizar stock
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: {
              stock: {
                decrement: detalle.cantidad
              }
            }
          });

          // Registrar movimiento de inventario
          await tx.movimientoInventario.create({
            data: {
              productoId: detalle.productoId,
              tipo: 'salida',
              cantidad: detalle.cantidad,
              stockAnterior: productoActual?.stock || 0,
              stockNuevo: (productoActual?.stock || 0) - detalle.cantidad,
              motivo: `Venta #${venta.id} - Confirmación de pedido ${pedidoActual.numeroPedido}`
            }
          });
        }

        // 3. Marcar pedido como confirmado
        const pedidoActualizado = await tx.pedido.update({
          where: { id },
          data: {
            estado: 'confirmado'
          },
          include: {
            detalles: {
              include: {
                producto: true
              }
            }
          }
        });

        return { pedido: pedidoActualizado, venta };
      });

      return new Response(JSON.stringify(resultado.pedido), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Si no es confirmación, solo actualizar datos del pedido
    const pedido = await prisma.pedido.update({
      where: { id },
      data: {
        estado: estado || undefined,
        clienteNombre: clienteNombre !== undefined ? clienteNombre : undefined,
        clienteTelefono: clienteTelefono !== undefined ? clienteTelefono : undefined,
        notas: notas !== undefined ? notas : undefined,
        detalles: detalles ? {
          deleteMany: {},
          create: detalles.map((d: any) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.precioUnitario * d.cantidad
          }))
        } : undefined,
        total: detalles ? detalles.reduce((sum: number, d: any) => sum + (d.precioUnitario * d.cantidad), 0) : undefined
      },
      include: {
        detalles: {
          include: {
            producto: true
          }
        }
      }
    });

    return new Response(JSON.stringify(pedido), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error al actualizar pedido:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar pedido' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    const id = parseInt(params.id!);

    await prisma.pedido.delete({
      where: { id }
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    return new Response(JSON.stringify({ error: 'Error al eliminar pedido' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};
