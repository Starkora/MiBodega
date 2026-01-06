import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  precio: number;
  stock: number;
}

interface DetalleVenta {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  producto?: Producto;
}

export default function VentasList() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [detalles, setDetalles] = useState<DetalleVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [descuento, setDescuento] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      // Convertir valores numéricos y filtrar productos con stock
      const productosConvertidos = data.map((p: any) => ({
        ...p,
        precio: Number(p.precio),
        stock: Number(p.stock)
      })).filter((p: Producto) => p.stock > 0);
      setProductos(productosConvertidos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    const producto = productos.find((p) => p.id === parseInt(productoSeleccionado));
    if (!producto) return;

    if (cantidad > producto.stock) {
      alert('No hay suficiente stock disponible');
      return;
    }

    const existente = detalles.find((d) => d.productoId === producto.id);
    if (existente) {
      const nuevaCantidad = existente.cantidad + cantidad;
      if (nuevaCantidad > producto.stock) {
        alert('No hay suficiente stock disponible');
        return;
      }

      setDetalles(
        detalles.map((d) =>
          d.productoId === producto.id
            ? {
                ...d,
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * producto.precio,
              }
            : d
        )
      );
    } else {
      setDetalles([
        ...detalles,
        {
          productoId: producto.id,
          cantidad,
          precioUnitario: producto.precio,
          subtotal: cantidad * producto.precio,
          producto,
        },
      ]);
    }

    setProductoSeleccionado('');
    setCantidad(1);
  };

  const eliminarDetalle = (productoId: number) => {
    setDetalles(detalles.filter((d) => d.productoId !== productoId));
  };

  const calcularSubtotal = () => {
    return detalles.reduce((sum, d) => sum + d.subtotal, 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal() - descuento;
  };

  const finalizarVenta = async () => {
    if (detalles.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    try {
      const response = await fetch('/api/ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtotal: calcularSubtotal(),
          descuento,
          total: calcularTotal(),
          metodoPago,
          clienteNombre: clienteNombre || null,
          clienteTelefono: clienteTelefono || null,
          detalles: detalles.map((d) => ({
            productoId: d.productoId,
            cantidad: d.cantidad,
            precioUnitario: d.precioUnitario,
            subtotal: d.subtotal,
          })),
        }),
      });

      if (response.ok) {
        alert('Venta registrada exitosamente');
        // Limpiar formulario
        setDetalles([]);
        setClienteNombre('');
        setClienteTelefono('');
        setDescuento(0);
        setMetodoPago('efectivo');
        fetchProductos(); // Actualizar stock
      }
    } catch (error) {
      console.error('Error al registrar venta:', error);
      showToast('error', 'Error al registrar venta');
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>
          <i className="bi bi-cart-check me-2"></i>
          Registrar Venta
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Dashboard</a>
            </li>
            <li className="breadcrumb-item active">Ventas</li>
          </ol>
        </nav>
      </div>

      <div className="row">
        {/* Formulario de venta */}
        <div className="col-md-8">
          <div className="card mb-4">
            <div className="card-header">
              <i className="bi bi-bag-plus me-2"></i>
              Agregar Productos
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-7">
                  <label className="form-label">Producto</label>
                  <select
                    className="form-select"
                    value={productoSeleccionado}
                    onChange={(e) => setProductoSeleccionado(e.target.value)}
                  >
                    <option value="">Seleccionar producto...</option>
                    {productos.map((producto) => (
                      <option key={producto.id} value={producto.id}>
                        {producto.nombre} - S/ {producto.precio.toFixed(2)} (Stock: {producto.stock})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Cantidad</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <button
                    className="btn btn-primary w-100"
                    onClick={agregarProducto}
                  >
                    <i className="bi bi-plus-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detalles de la venta */}
          <div className="card">
            <div className="card-header">
              <i className="bi bi-list-check me-2"></i>
              Detalle de la Venta
            </div>
            <div className="card-body">
              {detalles.length === 0 ? (
                <p className="text-muted text-center py-4">
                  No hay productos agregados
                </p>
              ) : (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {detalles.map((detalle) => (
                        <tr key={detalle.productoId}>
                          <td>{detalle.producto?.nombre}</td>
                          <td>S/ {detalle.precioUnitario.toFixed(2)}</td>
                          <td>{detalle.cantidad}</td>
                          <td>
                            <strong>S/ {detalle.subtotal.toFixed(2)}</strong>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => eliminarDetalle(detalle.productoId)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen y pago */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <i className="bi bi-person me-2"></i>
              Datos del Cliente
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="tel"
                  className="form-control"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="bi bi-cash-coin me-2"></i>
              Resumen de Pago
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Método de Pago</label>
                <select
                  className="form-select"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta</option>
                  <option value="transferencia">Transferencia</option>
                  <option value="yape">Yape</option>
                  <option value="plin">Plin</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Descuento</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  value={descuento}
                  onChange={(e) => setDescuento(parseFloat(e.target.value) || 0)}
                />
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal:</span>
                <strong>S/ {calcularSubtotal().toFixed(2)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Descuento:</span>
                <strong className="text-danger">
                  -S/ {descuento.toFixed(2)}
                </strong>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <h5>Total:</h5>
                <h5 className="text-success">S/ {calcularTotal().toFixed(2)}</h5>
              </div>

              <button
                className="btn btn-success w-100 btn-icon"
                onClick={finalizarVenta}
                disabled={detalles.length === 0}
              >
                <i className="bi bi-check-circle"></i>
                Finalizar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Toast Notification */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show align-items-center text-white border-0 ${toast.type === 'success' ? 'bg-success' : 'bg-danger'}`}>
            <div className="d-flex">
              <div className="toast-body">{toast.message}</div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast(null)}
              ></button>
            </div>
          </div>
        </div>
      )}    </>
  );
}
