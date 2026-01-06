import { useState, useEffect } from 'react';

interface Configuracion {
  [key: string]: {
    valor: string;
    descripcion: string | null;
  };
}

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function ConfiguracionForm() {
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [config, setConfig] = useState<Configuracion>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const [formData, setFormData] = useState({
    nombre_negocio: '',
    direccion: '',
    telefono: '',
    email: '',
    ruc: '',
    moneda: 'PEN',
    simbolo_moneda: 'S/',
    igv: '0.18',
    stock_critico: '5'
  });

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchConfiguracion = async () => {
    try {
      const response = await fetch('/api/configuracion');
      const data = await response.json();
      setConfig(data);
      
      // Llenar el formulario con los datos existentes
      const newFormData: any = {};
      Object.keys(formData).forEach(key => {
        newFormData[key] = data[key]?.valor || formData[key as keyof typeof formData];
      });
      setFormData(newFormData);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      const response = await fetch('/api/configuracion', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configuraciones: formData }),
      });

      if (response.ok) {
        showToast('success', 'Configuración guardada exitosamente');
        await fetchConfiguracion();
      } else {
        const error = await response.json();
        showToast('error', 'Error: ' + (error.error || 'No se pudo guardar la configuración'));
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al guardar la configuración');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
          <i className="bi bi-gear me-2"></i>
          Configuración
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
            <li className="breadcrumb-item active">Configuración</li>
          </ol>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* Información del Negocio */}
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <i className="bi bi-shop me-2"></i>
                Información del Negocio
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label">Nombre del Negocio *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="nombre_negocio"
                    value={formData.nombre_negocio}
                    onChange={handleChange}
                    required
                  />
                  <small className="form-text text-muted">
                    Nombre que aparecerá en los documentos
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">RUC / NIT</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ruc"
                    value={formData.ruc}
                    onChange={handleChange}
                    placeholder="20123456789"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Dirección *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="direccion"
                    value={formData.direccion}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Teléfono *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      required
                      placeholder="51987654321"
                    />
                    <small className="text-muted">
                      Número de WhatsApp con código país sin + (ej: 51987654321 para Perú)
                    </small>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración del Sistema */}
          <div className="col-md-6 mb-4">
            <div className="card">
              <div className="card-header">
                <i className="bi bi-sliders me-2"></i>
                Configuración del Sistema
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Moneda</label>
                    <select
                      className="form-select"
                      name="moneda"
                      value={formData.moneda}
                      onChange={handleChange}
                    >
                      <option value="PEN">Soles Peruanos (PEN)</option>
                      <option value="USD">Dólares Americanos (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                      <option value="MXN">Pesos Mexicanos (MXN)</option>
                      <option value="COP">Pesos Colombianos (COP)</option>
                      <option value="ARS">Pesos Argentinos (ARS)</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Símbolo de Moneda</label>
                    <input
                      type="text"
                      className="form-control"
                      name="simbolo_moneda"
                      value={formData.simbolo_moneda}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">IGV / IVA (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control"
                    name="igv"
                    value={formData.igv}
                    onChange={handleChange}
                  />
                  <small className="form-text text-muted">
                    Valor decimal (0.18 = 18%)
                  </small>
                </div>

                <div className="mb-3">
                  <label className="form-label">Stock Crítico por Defecto</label>
                  <input
                    type="number"
                    className="form-control"
                    name="stock_critico"
                    value={formData.stock_critico}
                    onChange={handleChange}
                  />
                  <small className="form-text text-muted">
                    Cantidad mínima que activa alertas de stock bajo
                  </small>
                </div>

                <div className="alert alert-info mb-0">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Nota:</strong> Los cambios se aplicarán inmediatamente en todo el sistema
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información del Sistema */}
        <div className="row">
          <div className="col-12 mb-4">
            <div className="card">
              <div className="card-header">
                <i className="bi bi-info-circle me-2"></i>
                Información del Sistema
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-code-square" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
                      <h5 className="mt-2 mb-0">MiBodega</h5>
                      <small className="text-muted">v1.0.0</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-database" style={{ fontSize: '2rem', color: '#198754' }}></i>
                      <h5 className="mt-2 mb-0">TiDB Cloud</h5>
                      <small className="text-muted">MySQL Compatible</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-rocket-takeoff" style={{ fontSize: '2rem', color: '#dc3545' }}></i>
                      <h5 className="mt-2 mb-0">Astro</h5>
                      <small className="text-muted">Web Framework</small>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="text-center p-3 bg-light rounded">
                      <i className="bi bi-layers" style={{ fontSize: '2rem', color: '#0dcaf0' }}></i>
                      <h5 className="mt-2 mb-0">React</h5>
                      <small className="text-muted">UI Components</small>
                    </div>
                  </div>
                </div>

                <hr className="my-4" />

                <div className="row text-center">
                  <div className="col-md-4">
                    <h6 className="text-muted">Framework</h6>
                    <p className="mb-0"><strong>Astro 5.16 + React 19</strong></p>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-muted">Base de Datos</h6>
                    <p className="mb-0"><strong>TiDB Cloud + Prisma</strong></p>
                  </div>
                  <div className="col-md-4">
                    <h6 className="text-muted">UI Framework</h6>
                    <p className="mb-0"><strong>Bootstrap 5.3</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0">¿Listo para guardar los cambios?</h6>
                    <small className="text-muted">Los cambios se aplicarán inmediatamente</small>
                  </div>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={fetchConfiguracion}
                      disabled={guardando}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Recargar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={guardando}
                    >
                      {guardando ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Guardando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Guardar Configuración
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      {/* Toast Container */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3" style={{ zIndex: 9999 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`toast show align-items-center text-white border-0 ${
              toast.type === 'success' ? 'bg-success' :
              toast.type === 'error' ? 'bg-danger' : 'bg-info'
            }`}
            role="alert"
          >
            <div className="d-flex">
              <div className="toast-body">
                {toast.message}
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              ></button>
            </div>
          </div>
        ))}
      </div>    </>
  );
}
