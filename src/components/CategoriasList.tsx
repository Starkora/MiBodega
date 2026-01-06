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
      const response = await fetch('/api/categorias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categoriaActual),
      });

      if (response.ok) {
        fetchCategorias();
        handleCloseModal();
        showToast('success', 'Categoría creada');
      }
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      showToast('error', 'Error al guardar categoría');
    }
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
                <h5 className="modal-title">Nueva Categoría</h5>
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
                    Crear Categoría
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
