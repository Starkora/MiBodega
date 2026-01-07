import { useState, useEffect } from 'react';

interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
  _count?: {
    productos: number;
  };
}

export default function CategoriasList() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState(false);
  const [categoriaActual, setCategoriaActual] = useState<Partial<Categoria>>({
    nombre: '',
    descripcion: '',
  });
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<number | null>(null);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias');
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editando ? `/api/categorias/${categoriaActual.id}` : '/api/categorias';
      const method = editando ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaActual),
      });

      if (response.ok) {
        fetchCategorias();
        handleCloseModal();
        showToast('success', editando ? 'Categoría actualizada' : 'Categoría creada');
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      showToast('error', 'Error al guardar categoría');
    }
  };

  const handleEdit = (categoria: Categoria) => {
    setEditando(true);
    setCategoriaActual(categoria);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    setCategoriaAEliminar(id);
    setShowConfirmModal(true);
  };

  const confirmarEliminacion = async () => {
    if (!categoriaAEliminar) return;

    try {
      const response = await fetch(`/api/categorias/${categoriaAEliminar}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchCategorias();
        showToast('success', 'Categoría eliminada');
      } else {
        const data = await response.json();
        showToast('error', data.error || 'Error al eliminar categoría');
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      showToast('error', 'Error al eliminar categoría');
    } finally {
      setShowConfirmModal(false);
      setCategoriaAEliminar(null);
    }
  };

  const cancelarEliminacion = () => {
    setShowConfirmModal(false);
    setCategoriaAEliminar(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditando(false);
    setCategoriaActual({
      nombre: '',
      descripcion: '',
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
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1>
              <i className="bi bi-tag me-2"></i>
              Categorías
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/">Dashboard</a>
                </li>
                <li className="breadcrumb-item active">Categorías</li>
              </ol>
            </nav>
          </div>
          <button
            className="btn btn-primary btn-icon"
            onClick={() => setShowModal(true)}
          >
            <i className="bi bi-plus-circle"></i>
            Nueva Categoría
          </button>
        </div>
      </div>

      <div className="row">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">
                  <i className="bi bi-tag-fill me-2 text-primary"></i>
                  {categoria.nombre}
                </h5>
                <p className="card-text text-muted">
                  {categoria.descripcion || 'Sin descripción'}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="badge bg-secondary">
                    {categoria._count?.productos || 0} productos
                  </span>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(categoria)}
                      title="Editar"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(categoria.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal para crear categoría */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editando ? 'Editar Categoría' : 'Nueva Categoría'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={categoriaActual.nombre}
                      onChange={(e) =>
                        setCategoriaActual({
                          ...categoriaActual,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descripción</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={categoriaActual.descripcion}
                      onChange={(e) =>
                        setCategoriaActual({
                          ...categoriaActual,
                          descripcion: e.target.value,
                        })
                      }
                    ></textarea>
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
                    {editando ? 'Actualizar' : 'Crear'} Categoría
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showConfirmModal && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={cancelarEliminacion}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de que deseas eliminar esta categoría?</p>
                <p className="text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Si la categoría tiene productos asociados, no podrá ser eliminada.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEliminacion}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={confirmarEliminacion}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && <div className="modal-backdrop show"></div>}
      {showConfirmModal && <div className="modal-backdrop show"></div>}

      {/* Toast de notificación */}
      {toast && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 11 }}>
          <div className={`toast show align-items-center text-white bg-${toast.type === 'success' ? 'success' : 'danger'} border-0`}>
            <div className="d-flex">
              <div className="toast-body">
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
