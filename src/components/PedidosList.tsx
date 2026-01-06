import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
  imagenUrl?: string;
}

interface PedidoDetalle {
  id: number;
  pedidoId: number;
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto: Producto;
}

interface Pedido {
  id: number;
  numeroPedido: string;
  token: string;
  estado: string;
  total: number;
  clienteNombre?: string;
  clienteTelefono?: string;
  notas?: string;
  createdAt: string;
  detalles: PedidoDetalle[];
}

interface Toast {
  tipo: 'success' | 'error' | 'warning';
  mensaje: string;
}

export default function PedidosList() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [pedidoEditado, setPedidoEditado] = useState<Pedido | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pedidoAConfirmar, setPedidoAConfirmar] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState<number | null>(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (tipo: 'success' | 'error' | 'warning', mensaje: string) => {
    setToast({ tipo, mensaje });
  };

  const cargarPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos?estado=pendiente');
      if (!response.ok) throw new Error('Error al cargar pedidos');
      const data = await response.json();
      setPedidos(data);
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al cargar pedidos');
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (pedido: Pedido) => {
    setEditando(pedido.id);
    setPedidoEditado(JSON.parse(JSON.stringify(pedido))); // Deep copy
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setPedidoEditado(null);
  };

  const actualizarCantidad = (detalleId: number, nuevaCantidad: number) => {
    if (!pedidoEditado || nuevaCantidad < 1) return;

    const nuevosDetalles = pedidoEditado.detalles.map(detalle => {
      if (detalle.id === detalleId) {
        const subtotal = nuevaCantidad * detalle.precioUnitario;
        return { ...detalle, cantidad: nuevaCantidad, subtotal };
      }
      return detalle;
    });

    const nuevoTotal = nuevosDetalles.reduce((sum, d) => sum + d.subtotal, 0);
    setPedidoEditado({ ...pedidoEditado, detalles: nuevosDetalles, total: nuevoTotal });
  };

  const eliminarDetalle = (detalleId: number) => {
    if (!pedidoEditado || pedidoEditado.detalles.length <= 1) {
      showToast('warning', 'El pedido debe tener al menos un producto');
      return;
    }

    const nuevosDetalles = pedidoEditado.detalles.filter(d => d.id !== detalleId);
    const nuevoTotal = nuevosDetalles.reduce((sum, d) => sum + d.subtotal, 0);
    setPedidoEditado({ ...pedidoEditado, detalles: nuevosDetalles, total: nuevoTotal });
  };

  const guardarCambios = async () => {
    if (!pedidoEditado) return;

    try {
      const detallesParaEnviar = pedidoEditado.detalles.map(d => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        precioUnitario: d.precioUnitario
      }));

      const response = await fetch(`/api/pedidos/${pedidoEditado.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          detalles: detallesParaEnviar,
          clienteNombre: pedidoEditado.clienteNombre,
          clienteTelefono: pedidoEditado.clienteTelefono,
          notas: pedidoEditado.notas
        })
      });

      if (!response.ok) throw new Error('Error al actualizar pedido');

      showToast('success', 'Pedido actualizado correctamente');
      setEditando(null);
      setPedidoEditado(null);
      cargarPedidos();
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al actualizar pedido');
    }
  };

  const confirmarPedidoModal = (pedidoId: number) => {
    setPedidoAConfirmar(pedidoId);
    setShowConfirmModal(true);
  };

  const confirmarPedido = async () => {
    if (!pedidoAConfirmar) return;

    try {
      // Obtener datos del pedido antes de confirmar
      const pedidoResponse = await fetch(`/api/pedidos/${pedidoAConfirmar}`);
      const pedidoData = await pedidoResponse.json();

      const response = await fetch(`/api/pedidos/${pedidoAConfirmar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'confirmado' })
      });

      if (!response.ok) throw new Error('Error al confirmar pedido');

      // Notificar confirmación (opcional - puedes notificar al cliente)
      fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'confirmacion',
          pedido: {
            numeroPedido: pedidoData.numeroPedido,
            total: pedidoData.total
          }
        })
      }).catch(err => console.error('Error notificación:', err));

      showToast('success', 'Pedido confirmado. Se ha registrado la venta.');
      setShowConfirmModal(false);
      setPedidoAConfirmar(null);
      cargarPedidos();
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al confirmar pedido');
      setShowConfirmModal(false);
      setPedidoAConfirmar(null);
    }
  };

  const cancelarPedidoModal = (pedidoId: number) => {
    setPedidoACancelar(pedidoId);
    setShowCancelModal(true);
  };

  const cancelarPedido = async () => {
    if (!pedidoACancelar) return;

    try {
      const response = await fetch(`/api/pedidos/${pedidoACancelar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelado' })
      });

      if (!response.ok) throw new Error('Error al cancelar pedido');

      showToast('success', 'Pedido cancelado');
      setShowCancelModal(false);
      setPedidoACancelar(null);
      cargarPedidos();
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al cancelar pedido');
      setShowCancelModal(false);
      setPedidoACancelar(null);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (cargando) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-clipboard-check me-2"></i>
          Pedidos Pendientes
        </h2>
        <button onClick={cargarPedidos} className="btn btn-outline-primary">
          <i className="bi bi-arrow-clockwise me-2"></i>
          Actualizar
        </button>
      </div>

      {pedidos.length === 0 ? (
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          No hay pedidos pendientes
        </div>
      ) : (
        <div className="row g-4">
          {pedidos.map(pedido => (
            <div key={pedido.id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      <i className="bi bi-receipt me-2"></i>
                      {pedido.numeroPedido}
                    </h5>
                    <small>{formatearFecha(pedido.createdAt)}</small>
                  </div>
                  <div>
                    {editando === pedido.id ? (
                      <>
                        <button onClick={guardarCambios} className="btn btn-success btn-sm me-2">
                          <i className="bi bi-check-lg me-1"></i>
                          Guardar
                        </button>
                        <button onClick={cancelarEdicion} className="btn btn-secondary btn-sm">
                          <i className="bi bi-x-lg me-1"></i>
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => iniciarEdicion(pedido)} className="btn btn-light btn-sm me-2">
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </button>
                        <button onClick={() => confirmarPedidoModal(pedido.id)} className="btn btn-success btn-sm me-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Confirmar
                        </button>
                        <button onClick={() => cancelarPedidoModal(pedido.id)} className="btn btn-danger btn-sm">
                          <i className="bi bi-x-circle me-1"></i>
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="card-body">
                  {pedido.clienteNombre && (
                    <div className="mb-2">
                      <strong><i className="bi bi-person me-2"></i>Cliente:</strong> {pedido.clienteNombre}
                    </div>
                  )}
                  {pedido.clienteTelefono && (
                    <div className="mb-2">
                      <strong><i className="bi bi-telephone me-2"></i>Teléfono:</strong> {pedido.clienteTelefono}
                    </div>
                  )}
                  
                  <div className="table-responsive mt-3">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Código</th>
                          <th className="text-center">Cantidad</th>
                          <th className="text-end">Precio Unit.</th>
                          <th className="text-end">Subtotal</th>
                          {editando === pedido.id && <th></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {(editando === pedido.id && pedidoEditado ? pedidoEditado.detalles : pedido.detalles).map(detalle => (
                          <tr key={detalle.id}>
                            <td>{detalle.producto.nombre}</td>
                            <td>{detalle.producto.codigo}</td>
                            <td className="text-center">
                              {editando === pedido.id && pedidoEditado ? (
                                <input
                                  type="number"
                                  min="1"
                                  value={detalle.cantidad}
                                  onChange={(e) => actualizarCantidad(detalle.id, parseInt(e.target.value) || 1)}
                                  className="form-control form-control-sm text-center"
                                  style={{ width: '80px', display: 'inline-block' }}
                                />
                              ) : (
                                detalle.cantidad
                              )}
                            </td>
                            <td className="text-end">S/ {Number(detalle.precioUnitario).toFixed(2)}</td>
                            <td className="text-end">S/ {Number(detalle.subtotal).toFixed(2)}</td>
                            {editando === pedido.id && pedidoEditado && (
                              <td className="text-center">
                                <button
                                  onClick={() => eliminarDetalle(detalle.id)}
                                  className="btn btn-danger btn-sm"
                                  disabled={pedidoEditado.detalles.length <= 1}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={editando === pedido.id ? 4 : 4} className="text-end"><strong>Total:</strong></td>
                          <td className="text-end">
                            <strong>S/ {Number(editando === pedido.id && pedidoEditado ? pedidoEditado.total : pedido.total).toFixed(2)}</strong>
                          </td>
                          {editando === pedido.id && <td></td>}
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {pedido.notas && (
                    <div className="mt-3 alert alert-secondary">
                      <strong><i className="bi bi-sticky me-2"></i>Notas:</strong> {pedido.notas}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Confirmación */}
      {showConfirmModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <i className="bi bi-check-circle me-2"></i>
                  Confirmar Pedido
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowConfirmModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de confirmar este pedido?</p>
                <p className="text-muted mb-0">
                  <small>Se creará una venta y se actualizará el inventario automáticamente.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-success" onClick={confirmarPedido}>
                  <i className="bi bi-check-lg me-2"></i>
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelación */}
      {showCancelModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title">
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar Pedido
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowCancelModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de cancelar este pedido?</p>
                <p className="text-muted mb-0">
                  <small>Esta acción no se puede deshacer.</small>
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCancelModal(false)}>
                  No, volver
                </button>
                <button type="button" className="btn btn-danger" onClick={cancelarPedido}>
                  <i className="bi bi-x-lg me-2"></i>
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <div className={`toast show align-items-center text-white bg-${toast.tipo === 'success' ? 'success' : toast.tipo === 'error' ? 'danger' : 'warning'} border-0`}>
            <div className="d-flex">
              <div className="toast-body">
                <i className={`bi bi-${toast.tipo === 'success' ? 'check-circle' : toast.tipo === 'error' ? 'x-circle' : 'exclamation-triangle'} me-2`}></i>
                {toast.mensaje}
              </div>
              <button type="button" className="btn-close btn-close-white me-2 m-auto" onClick={() => setToast(null)}></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
