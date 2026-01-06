import { useState, useEffect } from 'react';

interface ReporteResumen {
  resumen: {
    totalVentas: number;
    totalIngresos: number;
    totalDescuentos: number;
    subtotalGeneral: number;
    ticketPromedio: number;
  };
  ventasPorMetodo: any;
  ventasPorDia: any;
  topProductos: any[];
}

export default function ReportesList() {
  const [loading, setLoading] = useState(true);
  const [tipoReporte, setTipoReporte] = useState('ventas');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [reporte, setReporte] = useState<any>(null);

  useEffect(() => {
    // Establecer fechas por defecto (último mes)
    const hoy = new Date();
    const haceMes = new Date(hoy.getFullYear(), hoy.getMonth() - 1, hoy.getDate());
    
    setFechaFin(hoy.toISOString().split('T')[0]);
    setFechaInicio(haceMes.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (fechaInicio && fechaFin) {
      fetchReporte();
    }
  }, [tipoReporte, fechaInicio, fechaFin]);

  const fetchReporte = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        tipo: tipoReporte,
        fechaInicio,
        fechaFin
      });

      const response = await fetch(`/api/reportes?${params}`);
      const data = await response.json();
      setReporte(data);
    } catch (error) {
      console.error('Error al cargar reporte:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `S/ ${value.toFixed(2)}`;
  };

  const exportarCSV = () => {
    if (!reporte) return;

    let csv = '';
    const fecha = new Date().toLocaleDateString('es-PE');

    if (tipoReporte === 'ventas') {
      csv = 'REPORTE DE VENTAS\n';
      csv += `Período: ${fechaInicio} al ${fechaFin}\n`;
      csv += `Generado: ${fecha}\n\n`;
      csv += 'RESUMEN\n';
      csv += `Total Ventas,${reporte.resumen.totalVentas}\n`;
      csv += `Total Ingresos,${reporte.resumen.totalIngresos}\n`;
      csv += `Total Descuentos,${reporte.resumen.totalDescuentos}\n`;
      csv += `Ticket Promedio,${reporte.resumen.ticketPromedio}\n\n`;
      csv += 'TOP PRODUCTOS VENDIDOS\n';
      csv += 'Producto,Código,Cantidad,Ingresos\n';
      reporte.topProductos.forEach((p: any) => {
        csv += `${p.producto},${p.codigo},${p.cantidad},${p.ingresos}\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte_${tipoReporte}_${fecha}.csv`;
    link.click();
  };

  const imprimirReporte = () => {
    window.print();
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
          <i className="bi bi-bar-chart me-2"></i>
          Reportes
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Dashboard</a></li>
            <li className="breadcrumb-item active">Reportes</li>
          </ol>
        </nav>
      </div>

      <div className="card mb-4">
        <div className="card-header">
          <i className="bi bi-funnel me-2"></i>
          Configuración del Reporte
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Tipo de Reporte</label>
              <select
                className="form-select"
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
              >
                <option value="ventas">Ventas</option>
                <option value="productos">Productos</option>
                <option value="inventario">Inventario</option>
                <option value="resumen">Resumen General</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Inicio</label>
              <input
                type="date"
                className="form-control"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Fin</label>
              <input
                type="date"
                className="form-control"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button className="btn btn-primary flex-fill" onClick={fetchReporte}>
                <i className="bi bi-arrow-clockwise me-2"></i>
                Generar
              </button>
              <button className="btn btn-outline-success" onClick={exportarCSV} title="Exportar CSV">
                <i className="bi bi-file-earmark-spreadsheet"></i>
              </button>
              <button className="btn btn-outline-primary" onClick={imprimirReporte} title="Imprimir">
                <i className="bi bi-printer"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* REPORTE DE VENTAS */}
      {tipoReporte === 'ventas' && reporte && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-primary">
                  <i className="bi bi-cart-check"></i>
                </div>
                <div className="value">{reporte.resumen.totalVentas}</div>
                <div className="label">Total Ventas</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-success">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.totalIngresos)}</div>
                <div className="label">Ingresos Totales</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-warning">
                  <i className="bi bi-percent"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.totalDescuentos)}</div>
                <div className="label">Descuentos</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-info">
                  <i className="bi bi-receipt"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.ticketPromedio)}</div>
                <div className="label">Ticket Promedio</div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <i className="bi bi-credit-card me-2"></i>
                  Ventas por Método de Pago
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Método</th>
                          <th className="text-end">Cantidad</th>
                          <th className="text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reporte.ventasPorMetodo).map(([metodo, datos]: [string, any]) => (
                          <tr key={metodo}>
                            <td className="text-capitalize">{metodo}</td>
                            <td className="text-end">{datos.cantidad}</td>
                            <td className="text-end"><strong>{formatCurrency(datos.total)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <i className="bi bi-trophy me-2"></i>
                  Top 10 Productos Más Vendidos
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Producto</th>
                          <th className="text-end">Cantidad</th>
                          <th className="text-end">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.topProductos.slice(0, 10).map((p: any, idx: number) => (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{p.producto}</td>
                            <td className="text-end">{p.cantidad}</td>
                            <td className="text-end"><strong>{formatCurrency(p.ingresos)}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <i className="bi bi-calendar3 me-2"></i>
              Ventas por Día
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th className="text-end">Cantidad de Ventas</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reporte.ventasPorDia)
                      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                      .map(([fecha, datos]: [string, any]) => (
                        <tr key={fecha}>
                          <td>{fecha}</td>
                          <td className="text-end">{datos.cantidad}</td>
                          <td className="text-end"><strong>{formatCurrency(datos.total)}</strong></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* REPORTE DE PRODUCTOS */}
      {tipoReporte === 'productos' && reporte && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-primary">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="value">{reporte.resumen.totalProductos}</div>
                <div className="label">Total Productos</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-success">
                  <i className="bi bi-check-circle"></i>
                </div>
                <div className="value">{reporte.resumen.productosActivos}</div>
                <div className="label">Activos</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-warning">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="value">{reporte.resumen.productosBajoStock}</div>
                <div className="label">Stock Bajo</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-info">
                  <i className="bi bi-currency-dollar"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.valorTotalInventario)}</div>
                <div className="label">Valor Inventario</div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <i className="bi bi-tags me-2"></i>
                  Productos por Categoría
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Categoría</th>
                          <th className="text-end">Cantidad</th>
                          <th className="text-end">Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reporte.productosPorCategoria).map(([cat, datos]: [string, any]) => (
                          <tr key={cat}>
                            <td>{cat}</td>
                            <td className="text-end">{datos.cantidad}</td>
                            <td className="text-end">{formatCurrency(datos.valorInventario)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <i className="bi bi-graph-up me-2"></i>
                  Mejor Rotación
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th className="text-end">Vendidos</th>
                          <th className="text-end">Ingresos</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.mejorRotacion.slice(0, 10).map((p: any, idx: number) => (
                          <tr key={idx}>
                            <td>{p.producto}</td>
                            <td className="text-end">{p.cantidadVendida}</td>
                            <td className="text-end">{formatCurrency(p.ingresos)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {reporte.productosSinMovimiento.length > 0 && (
            <div className="card">
              <div className="card-header">
                <i className="bi bi-exclamation-circle me-2"></i>
                Productos Sin Movimiento
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Código</th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th className="text-end">Stock</th>
                        <th className="text-end">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporte.productosSinMovimiento.map((p: any) => (
                        <tr key={p.id}>
                          <td>{p.codigo}</td>
                          <td>{p.nombre}</td>
                          <td>{p.categoria?.nombre || 'Sin categoría'}</td>
                          <td className="text-end">{p.stock}</td>
                          <td className="text-end">{formatCurrency(Number(p.precioCompra) * Number(p.stock))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* REPORTE DE INVENTARIO */}
      {tipoReporte === 'inventario' && reporte && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-primary">
                  <i className="bi bi-box-seam"></i>
                </div>
                <div className="value">{reporte.resumen.totalProductos}</div>
                <div className="label">Total Productos</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-danger">
                  <i className="bi bi-exclamation-triangle"></i>
                </div>
                <div className="value">{reporte.resumen.stockCritico}</div>
                <div className="label">Stock Crítico</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-success">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.valorInventario)}</div>
                <div className="label">Valor Inventario</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="stats-card">
                <div className="icon text-info">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="value">{formatCurrency(reporte.resumen.margenPotencial)}</div>
                <div className="label">Margen Potencial</div>
              </div>
            </div>
          </div>

          <div className="row mb-4">
            <div className="col-md-6">
              <div className="card">
                <div className="card-header bg-danger text-white">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Stock Crítico
                </div>
                <div className="card-body">
                  {reporte.stockCritico.length === 0 ? (
                    <p className="text-muted text-center py-3">No hay productos con stock crítico</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Producto</th>
                            <th className="text-end">Stock</th>
                            <th className="text-end">Mínimo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporte.stockCritico.slice(0, 15).map((p: any) => (
                            <tr key={p.id}>
                              <td>{p.nombre}</td>
                              <td className="text-end"><span className="badge bg-danger">{p.stock}</span></td>
                              <td className="text-end">{p.stockMinimo}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <i className="bi bi-archive me-2"></i>
                  Movimientos por Tipo
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th className="text-end">Movimientos</th>
                          <th className="text-end">Unidades</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(reporte.movimientosPorTipo).map(([tipo, datos]: [string, any]) => (
                          <tr key={tipo}>
                            <td className="text-capitalize">{tipo}</td>
                            <td className="text-end">{datos.cantidad}</td>
                            <td className="text-end">{datos.unidades}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* REPORTE RESUMEN */}
      {tipoReporte === 'resumen' && reporte && (
        <div className="row">
          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header bg-primary text-white">
                <i className="bi bi-cart-check me-2"></i>
                Ventas
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Ventas:</span>
                  <strong>{reporte.ventas.totalVentas}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Ingresos:</span>
                  <strong>{formatCurrency(reporte.ventas.totalIngresos)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Ticket Promedio:</span>
                  <strong>{formatCurrency(reporte.ventas.ticketPromedio)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header bg-success text-white">
                <i className="bi bi-box-seam me-2"></i>
                Productos
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Productos:</span>
                  <strong>{reporte.productos.totalProductos}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Activos:</span>
                  <strong>{reporte.productos.productosActivos}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Stock Bajo:</span>
                  <strong className="text-warning">{reporte.productos.productosBajoStock}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Valor Inventario:</span>
                  <strong>{formatCurrency(reporte.productos.valorTotalInventario)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4 mb-4">
            <div className="card">
              <div className="card-header bg-info text-white">
                <i className="bi bi-clipboard-data me-2"></i>
                Inventario
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Productos:</span>
                  <strong>{reporte.inventario.totalProductos}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Stock Crítico:</span>
                  <strong className="text-danger">{reporte.inventario.stockCritico}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Valor Compra:</span>
                  <strong>{formatCurrency(reporte.inventario.valorInventario)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Valor Venta:</span>
                  <strong>{formatCurrency(reporte.inventario.valorPotencialVenta)}</strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <span>Margen Potencial:</span>
                  <strong className="text-success">{formatCurrency(reporte.inventario.margenPotencial)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          .page-header nav,
          .card-header button,
          .btn-group,
          button {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
