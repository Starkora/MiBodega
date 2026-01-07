import { useState, useEffect } from 'react';
import AuthGuard from './AuthGuard';

interface Stats {
  resumen: {
    totalProductos: number;
    productosActivos: number;
    productosStockBajo: number;
    ventasHoy: number;
    totalVentasHoy: number;
    ventasMes: number;
    totalVentasMes: number;
  };
  productosTop: any[];
  productosAlerta: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      // Convertir valores numéricos de string a number
      const statsConvertidas = {
        ...data,
        resumen: {
          ...data.resumen,
          totalProductos: Number(data.resumen.totalProductos),
          productosActivos: Number(data.resumen.productosActivos),
          productosStockBajo: Number(data.resumen.productosStockBajo),
          ventasHoy: Number(data.resumen.ventasHoy),
          totalVentasHoy: Number(data.resumen.totalVentasHoy),
          ventasMes: Number(data.resumen.ventasMes),
          totalVentasMes: Number(data.resumen.totalVentasMes)
        },
        productosTop: data.productosTop.map((p: any) => ({
          ...p,
          totalVendido: Number(p.totalVendido),
          ingresos: Number(p.ingresos)
        })),
        productosAlerta: data.productosAlerta.map((p: any) => ({
          ...p,
          stock: Number(p.stock),
          stockMinimo: Number(p.stockMinimo)
        }))
      };
      setStats(statsConvertidas);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
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

  if (!stats) {
    return (
      <div className="alert alert-danger" role="alert">
        Error al cargar las estadísticas
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <h1>
          <i className="bi bi-speedometer2 me-2"></i>
          Dashboard
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item active">Dashboard</li>
          </ol>
        </nav>
      </div>

      {/* Estadísticas principales */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="stats-card">
            <div className="icon text-primary">
              <i className="bi bi-box-seam"></i>
            </div>
            <div className="value">{stats.resumen.productosActivos}</div>
            <div className="label">Productos Activos</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="icon text-warning">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div className="value">{stats.resumen.productosStockBajo}</div>
            <div className="label">Stock Bajo</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="icon text-success">
              <i className="bi bi-cart-check"></i>
            </div>
            <div className="value">{stats.resumen.ventasHoy}</div>
            <div className="label">Ventas Hoy</div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="stats-card">
            <div className="icon text-info">
              <i className="bi bi-currency-dollar"></i>
            </div>
            <div className="value">
              S/ {stats.resumen.totalVentasHoy.toFixed(2)}
            </div>
            <div className="label">Total Hoy</div>
          </div>
        </div>
      </div>

      {/* Resumen del mes */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <i className="bi bi-calendar-month me-2"></i>
              Resumen del Mes
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-6 text-center">
                  <h3 className="text-primary">{stats.resumen.ventasMes}</h3>
                  <p className="text-muted mb-0">Ventas Realizadas</p>
                </div>
                <div className="col-6 text-center">
                  <h3 className="text-success">
                    S/ {stats.resumen.totalVentasMes.toFixed(2)}
                  </h3>
                  <p className="text-muted mb-0">Total Facturado</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <i className="bi bi-graph-up me-2"></i>
              Productos Más Vendidos
            </div>
            <div className="card-body">
              {stats.productosTop.length === 0 ? (
                <p className="text-muted mb-0">No hay datos disponibles</p>
              ) : (
                <ul className="list-unstyled mb-0">
                  {stats.productosTop.map((item, index) => (
                    <li key={index} className="d-flex justify-content-between align-items-center mb-2">
                      <span>
                        <strong>{index + 1}.</strong> {item.producto?.nombre}
                      </span>
                      <span className="badge bg-primary rounded-pill">
                        {item.cantidadVendida} unidades
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {stats.productosAlerta.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-warning">
              <div className="card-header bg-warning text-dark">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                Alertas de Stock Bajo
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Stock Actual</th>
                        <th>Stock Mínimo</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.productosAlerta.map((producto) => {
                        const stockLevel = producto.stock / producto.stockMinimo;
                        let badgeClass = 'badge-stock-bajo';
                        if (stockLevel > 0.5) badgeClass = 'badge-stock-medio';
                        
                        return (
                          <tr key={producto.id}>
                            <td><code>{producto.codigo}</code></td>
                            <td>{producto.nombre}</td>
                            <td>{producto.categoria?.nombre || 'Sin categoría'}</td>
                            <td><strong>{producto.stock}</strong></td>
                            <td>{producto.stockMinimo}</td>
                            <td>
                              <span className={`badge ${badgeClass}`}>
                                {producto.stock === 0 ? 'Agotado' : 'Stock Bajo'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <i className="bi bi-lightning-charge me-2"></i>
              Acciones Rápidas
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <a href="/productos" className="btn btn-primary w-100 btn-icon">
                    <i className="bi bi-plus-circle"></i>
                    Nuevo Producto
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/ventas" className="btn btn-success w-100 btn-icon">
                    <i className="bi bi-cart-plus"></i>
                    Registrar Venta
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/inventario" className="btn btn-info w-100 btn-icon">
                    <i className="bi bi-clipboard-data"></i>
                    Ver Inventario
                  </a>
                </div>
                <div className="col-md-3">
                  <a href="/reportes" className="btn btn-secondary w-100 btn-icon">
                    <i className="bi bi-file-earmark-bar-graph"></i>
                    Ver Reportes
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Exportar con AuthGuard
export default function Dashboard() {
