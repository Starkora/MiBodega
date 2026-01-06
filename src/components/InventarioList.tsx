import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  stock: number;
  categoria?: {
    nombre: string;
  };
}

interface Movimiento {
  id: number;
  productoId: number;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string;
  notas?: string;
  fecha: string;
  producto: Producto;
}

export default function InventarioList() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');
  
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    productoId: '',
    tipo: 'entrada',
    cantidad: 0,
    motivo: '',
    notas: ''
  });

  useEffect(() => {
    fetchMovimientos();
    fetchProductos();
  }, []);

  useEffect(() => {
    fetchMovimientos();
  }, [filtroTipo, filtroProducto]);

  const fetchMovimientos = async () => {
    try {
      const params = new URLSearchParams();
      if (filtroProducto) params.append('productoId', filtroProducto);
      if (filtroTipo) params.append('tipo', filtroTipo);
      
      const response = await fetch(`/api/inventario?${params}`);
      const data = await response.json();
      
      // Convertir valores numéricos
      const movimientosConvertidos = data.map((m: any) => ({
        ...m,
        cantidad: Number(m.cantidad),
        stockAnterior: Number(m.stockAnterior),
        stockNuevo: Number(m.stockNuevo),
        producto: {
          ...m.producto,
          stock: Number(m.producto.stock)
        }
      }));
      
      setMovimientos(movimientosConvertidos);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      const productosConvertidos = data.map((p: any) => ({
        ...p,
        stock: Number(p.stock)
      }));
      setProductos(productosConvertidos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/inventario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevoMovimiento),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        await fetchMovimientos();
        await fetchProductos();
        alert('Movimiento registrado exitosamente');
      } else {
        const error = await response.json();
        alert('Error: ' + (error.error || 'No se pudo registrar el movimiento'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al registrar el movimiento');
    }
  };

  const resetForm = () => {
    setNuevoMovimiento({
      productoId: '',
      tipo: 'entrada',
      cantidad: 0,
      motivo: '',
      notas: ''
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-success';
      case 'salida':
        return 'bg-danger';
      case 'ajuste':
        return 'bg-warning';
      default:
        return 'bg-secondary';
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bi-arrow-down-circle';
      case 'salida':
        return 'bi-arrow-up-circle';
      case 'ajuste':
        return 'bi-pencil-square';
      default:
        return 'bi-circle';
    }
  };

  const getTipoTexto = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'Entrada';
      case 'salida':
        return 'Salida';
      case 'ajuste':
        return 'Ajuste';
      default:
        return tipo;
    }
  };

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <i className="bi bi-clipboard-data me-2"></i>
          Inventario
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
            <li className="breadcrumb-item active">Inventario</li>
          </ol>
        </nav>
      </div>

      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <span>
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </span>
          <button className="btn btn-primary btn-sm" onClick={handleOpenModal}>
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Movimiento
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Producto</label>
              <select
                className="form-select"
                value={filtroProducto}
                onChange={(e) => {
                  setFiltroProducto(e.target.value);
                  setLoading(true);
                }}
              >
                <option value="">Todos los productos</option>
                {productos.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Tipo de Movimiento</label>
              <select
                className="form-select"
                value={filtroTipo}
                onChange={(e) => {
                  setFiltroTipo(e.target.value);
                  setLoading(true);
                }}
              >
                <option value="">Todos los tipos</option>
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={fetchMovimientos}>
                <i className="bi bi-search me-2"></i>
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <i className="bi bi-list-ul me-2"></i>
          Historial de Movimientos
        </div>
        <div className="card-body">
          {movimientos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox" style={{ fontSize: '3rem', color: '#ccc' }}></i>
              <p className="text-muted mt-3">No hay movimientos registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Producto</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Stock Anterior</th>
                    <th>Stock Nuevo</th>
                    <th>Motivo</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map((movimiento) => (
                    <tr key={movimiento.id}>
                      <td>{formatFecha(movimiento.fecha)}</td>
                      <td>
                        <strong>{movimiento.producto.nombre}</strong>
                        <br />
                        <small className="text-muted">{movimiento.producto.codigo}</small>
                      </td>
                      <td>
                        <span className={`badge ${getTipoBadge(movimiento.tipo)}`}>
                          <i className={`bi ${getTipoIcon(movimiento.tipo)} me-1`}></i>
                          {getTipoTexto(movimiento.tipo)}
                        </span>
                      </td>
                      <td>
                        <strong className={movimiento.tipo === 'entrada' ? 'text-success' : 'text-danger'}>
                          {movimiento.tipo === 'entrada' ? '+' : '-'}
                          {movimiento.cantidad}
                        </strong>
                      </td>
                      <td>{movimiento.stockAnterior}</td>
                      <td>
                        <strong>{movimiento.stockNuevo}</strong>
                      </td>
                      <td>
                        {movimiento.motivo}
                        {movimiento.notas && (
                          <div className="text-muted small">{movimiento.notas}</div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para nuevo movimiento */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-plus-circle me-2"></i>
                  Registrar Movimiento de Inventario
                </h5>
                <button type="button" className="btn-close" onClick={handleCloseModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Producto *</label>
                      <select
                        className="form-select"
                        value={nuevoMovimiento.productoId}
                        onChange={(e) =>
                          setNuevoMovimiento({
                            ...nuevoMovimiento,
                            productoId: e.target.value
                          })
                        }
                        required
                      >
                        <option value="">Seleccionar producto...</option>
                        {productos.map((producto) => (
                          <option key={producto.id} value={producto.id}>
                            {producto.nombre} (Stock actual: {producto.stock})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tipo de Movimiento *</label>
                      <select
                        className="form-select"
                        value={nuevoMovimiento.tipo}
                        onChange={(e) =>
                          setNuevoMovimiento({
                            ...nuevoMovimiento,
                            tipo: e.target.value
                          })
                        }
                        required
                      >
                        <option value="entrada">Entrada (Aumentar stock)</option>
                        <option value="salida">Salida (Disminuir stock)</option>
                        <option value="ajuste">Ajuste (Establecer stock exacto)</option>
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">
                        {nuevoMovimiento.tipo === 'ajuste' ? 'Nuevo Stock *' : 'Cantidad *'}
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={nuevoMovimiento.cantidad}
                        onChange={(e) =>
                          setNuevoMovimiento({
                            ...nuevoMovimiento,
                            cantidad: parseInt(e.target.value)
                          })
                        }
                        min="0"
                        required
                      />
                      <small className="form-text text-muted">
                        {nuevoMovimiento.tipo === 'entrada' && 'Se sumará esta cantidad al stock actual'}
                        {nuevoMovimiento.tipo === 'salida' && 'Se restará esta cantidad del stock actual'}
                        {nuevoMovimiento.tipo === 'ajuste' && 'Se establecerá este valor como stock total'}
                      </small>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Motivo *</label>
                      <select
                        className="form-select"
                        value={nuevoMovimiento.motivo}
                        onChange={(e) =>
                          setNuevoMovimiento({
                            ...nuevoMovimiento,
                            motivo: e.target.value
                          })
                        }
                        required
                      >
                        <option value="">Seleccionar motivo...</option>
                        {nuevoMovimiento.tipo === 'entrada' && (
                          <>
                            <option value="Compra a proveedor">Compra a proveedor</option>
                            <option value="Devolución de cliente">Devolución de cliente</option>
                            <option value="Traslado desde otra sucursal">Traslado desde otra sucursal</option>
                            <option value="Producción">Producción</option>
                            <option value="Otro">Otro</option>
                          </>
                        )}
                        {nuevoMovimiento.tipo === 'salida' && (
                          <>
                            <option value="Venta">Venta</option>
                            <option value="Merma">Merma</option>
                            <option value="Producto vencido">Producto vencido</option>
                            <option value="Traslado a otra sucursal">Traslado a otra sucursal</option>
                            <option value="Devolución a proveedor">Devolución a proveedor</option>
                            <option value="Otro">Otro</option>
                          </>
                        )}
                        {nuevoMovimiento.tipo === 'ajuste' && (
                          <>
                            <option value="Inventario físico">Inventario físico</option>
                            <option value="Corrección de error">Corrección de error</option>
                            <option value="Ajuste por diferencia">Ajuste por diferencia</option>
                            <option value="Otro">Otro</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label">Notas (opcional)</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={nuevoMovimiento.notas}
                        onChange={(e) =>
                          setNuevoMovimiento({
                            ...nuevoMovimiento,
                            notas: e.target.value
                          })
                        }
                        placeholder="Información adicional sobre este movimiento..."
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-check-circle me-2"></i>
                    Registrar Movimiento
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showModal && <div className="modal-backdrop show"></div>}
    </>
  );
}
