import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioCompra: number;
  stock: number;
  stockMinimo: number;
  unidad: string;
  categoriaId?: number;
  categoria?: {
    id: number;
    nombre: string;
  };
  imagen?: string;
  activo: boolean;
}

interface Categoria {
  id: number;
  nombre: string;
}

export default function ProductosList() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [productoActual, setProductoActual] = useState<Partial<Producto>>({
    codigo: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    precioCompra: 0,
    stock: 0,
    stockMinimo: 5,
    unidad: 'unidad',
    categoriaId: undefined,
    activo: true,
  });
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    
    fetchProductos();
    fetchCategorias();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      // Convertir valores numéricos de string a number
      const productosConvertidos = data.map((p: any) => ({
        ...p,
        precio: Number(p.precio),
        precioCompra: Number(p.precioCompra),
        stock: Number(p.stock),
        stockMinimo: Number(p.stockMinimo)
      }));
      setProductos(productosConvertidos);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editando ? `/api/productos/${productoActual.id}` : '/api/productos';
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productoActual),
      });

      if (response.ok) {
        fetchProductos();
        handleCloseModal();
        showToast('success', editando ? 'Producto actualizado' : 'Producto creado');
      }
    } catch (error) {
      console.error('Error al guardar producto:', error);
      showToast('error', 'Error al guardar producto');
    }
  };

  const handleDelete = async (id: number) => {
    setProductoAEliminar(id);
    setShowConfirmModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!productoAEliminar) return;

    try {
      const response = await fetch(`/api/productos/${productoAEliminar}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchProductos();
        showToast('success', 'Producto eliminado');
      } else {
        showToast('error', 'Error al eliminar el producto');
      }
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showToast('error', 'Error al eliminar el producto');
    } finally {
      setShowConfirmModal(false);
      setProductoAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setShowConfirmModal(false);
    setProductoAEliminar(null);
  };

  const handleActivar = async (id: number) => {
    try {
      const response = await fetch(`/api/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: true }),
      });

      if (response.ok) {
        fetchProductos();
        showToast('success', 'Producto activado');
      } else {
        showToast('error', 'Error al activar el producto');
      }
    } catch (error) {
      console.error('Error al activar producto:', error);
      showToast('error', 'Error al activar el producto');
    }
  };

  const handleEdit = (producto: Producto) => {
    setEditando(true);
    setProductoActual(producto);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(false);
    setProductoActual({
      codigo: '',
      nombre: '',
      descripcion: '',
      precio: 0,
      precioCompra: 0,
      stock: 0,
      stockMinimo: 5,
      unidad: 'unidad',
      categoriaId: undefined,
      activo: true,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor selecciona un archivo de imagen');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'La imagen no debe superar los 5MB');
      return;
    }

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProductoActual({
          ...productoActual,
          imagen: data.url,
        });
        showToast('success', 'Imagen subida correctamente');
      } else {
        const error = await response.json();
        showToast('error', error.error || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      showToast('error', 'Error al subir imagen');
    } finally {
      setUploadingImage(false);
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );

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
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>
              <i className="bi bi-box-seam me-2"></i>
              Productos
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Productos</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-primary btn-icon"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-circle"></i>
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre o código..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-end">
              <span className="badge bg-secondary fs-6">
                {productosFiltrados.length} productos
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Código</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio (S/)</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto) => {
                  const stockLevel = producto.stock / producto.stockMinimo;
                  let stockBadge = 'badge-stock-alto';
                  if (stockLevel <= 1) stockBadge = 'badge-stock-bajo';
                  else if (stockLevel <= 2) stockBadge = 'badge-stock-medio';

                  return (
                    <tr key={producto.id}>
                      <td>
                        {producto.imagen ? (
                          <img
                            src={producto.imagen}
                            alt={producto.nombre}
                            style={{
                              width: '50px',
                              height: '50px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6'
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: '#f8f9fa',
                              borderRadius: '8px',
                              border: '1px solid #dee2e6',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <code>{producto.codigo}</code>
                      </td>
                      <td>
                        <strong>{producto.nombre}</strong>
                        {producto.descripcion && (
                          <small className="d-block text-muted">
                            {producto.descripcion}
                          </small>
                        )}
                      </td>
                      <td>{producto.categoria?.nombre || 'Sin categoría'}</td>
                      <td>
                        <strong>S/ {producto.precio.toFixed(2)}</strong>
                      </td>
                      <td>
                        <span className={`badge ${stockBadge}`}>
                          {producto.stock} {producto.unidad}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            producto.activo ? 'bg-success' : 'bg-secondary'
                          }`}
                        >
                          {producto.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => handleEdit(producto)}
                          title="Editar"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        {producto.activo ? (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(producto.id)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleActivar(producto.id)}
                            title="Activar"
                          >
                            <i className="bi bi-arrow-counterclockwise"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para crear/editar producto */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editando ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Código *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={productoActual.codigo}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            codigo: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nombre *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={productoActual.nombre}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            nombre: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={productoActual.descripcion}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            descripcion: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Precio de Compra (S/) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={productoActual.precioCompra}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            precioCompra: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Precio de Venta (S/) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={productoActual.precio}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            precio: parseFloat(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría</label>
                      <select
                        className="form-select"
                        value={productoActual.categoriaId || ''}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            categoriaId: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                      >
                        <option value="">Sin categoría</option>
                        {categorias.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">
                        {editando ? 'Stock Actual' : 'Stock Inicial'} *
                      </label>
                      <input
                        type="number"
                        className="form-control"
                        value={productoActual.stock}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            stock: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                      {editando && (
                        <small className="text-warning d-flex align-items-center gap-1 mt-1">
                          <i className="bi bi-exclamation-triangle-fill"></i>
                          Se recomienda usar el módulo de Inventario para cambios de stock
                        </small>
                      )}
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Stock Mínimo *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={productoActual.stockMinimo}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            stockMinimo: parseInt(e.target.value),
                          })
                        }
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Unidad *</label>
                      <select
                        className="form-select"
                        value={productoActual.unidad}
                        onChange={(e) =>
                          setProductoActual({
                            ...productoActual,
                            unidad: e.target.value,
                          })
                        }
                      >
                        <option value="unidad">Unidad</option>
                        <option value="kg">Kilogramo</option>
                        <option value="litro">Litro</option>
                        <option value="caja">Caja</option>
                        <option value="paquete">Paquete</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Imagen del Producto</label>
                      <div className="d-flex align-items-center gap-3">
                        {productoActual.imagen && (
                          <div className="position-relative">
                            <img
                              src={productoActual.imagen}
                              alt="Preview"
                              style={{
                                width: '100px',
                                height: '100px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                border: '2px solid #dee2e6'
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{ transform: 'translate(50%, -50%)' }}
                              onClick={() => setProductoActual({ ...productoActual, imagen: undefined })}
                            >
                              <i className="bi bi-x"></i>
                            </button>
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <input
                            type="file"
                            className="form-control"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                          />
                          <small className="text-muted">
                            {uploadingImage ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Subiendo imagen...
                              </>
                            ) : (
                              'Formatos: JPG, PNG, GIF, WebP. Máximo 5MB'
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={productoActual.activo}
                          onChange={(e) =>
                            setProductoActual({
                              ...productoActual,
                              activo: e.target.checked,
                            })
                          }
                        />
                        <label className="form-check-label">
                          Producto activo
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editando ? 'Actualizar' : 'Crear'} Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showModal && <div className="modal-backdrop show"></div>}

      {/* Modal de Confirmación de Eliminación */}
      {showConfirmModal && (
        <>
          <div className="modal show d-block" tabIndex={-1} style={{ zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header border-0 pb-0">
                  <div className="d-flex align-items-center gap-3 w-100">
                    <div className="rounded-circle bg-danger bg-opacity-10 p-3">
                      <i className="bi bi-exclamation-triangle-fill text-danger" style={{ fontSize: '2rem' }}></i>
                    </div>
                    <div>
                      <h5 className="modal-title mb-1 fw-bold">Confirmar eliminación</h5>
                      <p className="text-muted mb-0 small">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={cancelarEliminacion}
                  ></button>
                </div>
                <div className="modal-body py-4">
                  <p className="mb-0 fs-6">
                    ¿Estás seguro de que deseas eliminar este producto? 
                    Esta acción eliminará permanentemente el producto del sistema.
                  </p>
                </div>
                <div className="modal-footer border-0 gap-2">
                  <button
                    type="button"
                    className="btn btn-light px-4"
                    onClick={cancelarEliminacion}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger px-4"
                    onClick={confirmarEliminacion}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Eliminar producto
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show" style={{ zIndex: 1055 }}></div>
        </>
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
          <div className={`toast show align-items-center text-white border-0 ${
            toast.type === 'success' ? 'bg-success' : 'bg-danger'
          }`}>
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`}></i>
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToast(null)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
