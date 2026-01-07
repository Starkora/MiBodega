import { useState, useEffect } from 'react';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
  imagen?: string;
  categoria?: {
    nombre: string;
  };
}

export default function PantallaCliente() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaActiva, setCategoriaActiva] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [enviando, setEnviando] = useState(false);
  const [telefonoTienda, setTelefonoTienda] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [showConfirmacionModal, setShowConfirmacionModal] = useState(false);
  const [numeroPedidoConfirmado, setNumeroPedidoConfirmado] = useState('');
  const [pedidoIdConfirmado, setPedidoIdConfirmado] = useState<number | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [pedidosPendientes, setPedidosPendientes] = useState<any[]>([]);
  const [showPedidosModal, setShowPedidosModal] = useState(false);
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [pedidoACancelar, setPedidoACancelar] = useState<any>(null);
  const [carrito, setCarrito] = useState<{producto: Producto, cantidad: number}[]>([]);
  const [showCarrito, setShowCarrito] = useState(false);
  const [pedidosEnSeguimiento, setPedidosEnSeguimiento] = useState<number[]>([]);
  const [showNotificacionConfirmacion, setShowNotificacionConfirmacion] = useState(false);
  const [pedidoConfirmadoInfo, setPedidoConfirmadoInfo] = useState<any>(null);

  useEffect(() => {
    fetchProductos();
    fetchConfiguracion();
    cargarPedidosPendientes();
  }, []);

  // Polling para verificar confirmación de pedidos
  useEffect(() => {
    if (pedidosEnSeguimiento.length === 0) return;

    const interval = setInterval(async () => {
      try {
        // Verificar estado de cada pedido en seguimiento
        for (const pedidoId of pedidosEnSeguimiento) {
          const response = await fetch(`/api/pedidos/${pedidoId}`);
          if (response.ok) {
            const pedido = await response.json();
            
            // Si el pedido fue confirmado, notificar al cliente
            if (pedido.estado === 'confirmado') {
              setPedidoConfirmadoInfo(pedido);
              setShowNotificacionConfirmacion(true);
              
              // Remover de seguimiento
              setPedidosEnSeguimiento(prev => prev.filter(id => id !== pedidoId));
              
              // Actualizar lista de pedidos
              cargarPedidosPendientes();
              
              // Reproducir sonido de notificación (opcional)
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGGS67OmlVxILWrXs7qVdFAk+ldf1x3MpBSN2xvDckjsKE1+67+yrWBQLUKXj7rZiGgU3k9vyzoUpBSd6x+/aizsIGGe87+ypWxQLV7bv8apcEwxJpuHyu2YcBTKO1PHNeisFJnjH8NyMPQoUYbbw76lfFgxWt+7wpVoSClCk4fG2YhoFM47T8c16KwUmesbw3Iw9ChRftO/tqVsVDFa37+ylWxILTqXh8rtnGgU0jtTxzXorBSZ4x+/cizsIGGe87++pWxQLWrf87KVaEgpPpOHxt2IaBTOO0/HNeisFJnnH79yLPAkXY7bw76pdFQxPqOLwuGIaBTOO0/HNeisFJnnH79yLPAkXY7bw76pdFQxPqOLwuGIaA');
                audio.volume = 0.3;
                audio.play().catch(() => {});
              } catch {}
            }
          }
        }
      } catch (error) {
        console.error('Error verificando estado de pedidos:', error);
      }
    }, 5000); // Verificar cada 5 segundos

    return () => clearInterval(interval);
  }, [pedidosEnSeguimiento]);

  const fetchConfiguracion = async () => {
    try {
      const response = await fetch('/api/configuracion');
      const data = await response.json();
      if (data.telefono) {
        setTelefonoTienda(data.telefono.valor);
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  };

  const cargarPedidosPendientes = async () => {
    try {
      const response = await fetch('/api/pedidos?estado=pendiente');
      if (response.ok) {
        const data = await response.json();
        setPedidosPendientes(data);
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch('/api/productos');
      const data = await response.json();
      
      const productosConvertidos = data
        .filter((p: any) => p.activo) // Solo filtrar por activo, mostrar aunque no tengan stock
        .map((p: any) => ({
          ...p,
          precio: Number(p.precio),
          stock: Number(p.stock)
        }));
      
      setProductos(productosConvertidos);
      
      // Extraer categorías únicas
      const cats = ['Todos', ...new Set(productosConvertidos
        .map((p: Producto) => p.categoria?.nombre)
        .filter(Boolean)
      )];
      setCategorias(cats as string[]);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = categoriaActiva === 'Todos'
    ? productos
    : productos.filter(p => p.categoria?.nombre === categoriaActiva);

  const handleProductoClick = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setCantidad(1);
  };

  const agregarAlCarrito = () => {
    if (!productoSeleccionado) return;
    
    const itemExistente = carrito.find(item => item.producto.id === productoSeleccionado.id);
    
    if (itemExistente) {
      // Actualizar cantidad si ya existe
      setCarrito(carrito.map(item => 
        item.producto.id === productoSeleccionado.id
          ? { ...item, cantidad: item.cantidad + cantidad }
          : item
      ));
      showToast('success', `${cantidad} más agregado al carrito`);
    } else {
      // Agregar nuevo item
      setCarrito([...carrito, { producto: productoSeleccionado, cantidad }]);
      showToast('success', 'Producto agregado al carrito');
    }
    
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const actualizarCantidadCarrito = (productoId: number, nuevaCantidad: number) => {
    if (nuevaCantidad < 1) return;
    
    const producto = carrito.find(item => item.producto.id === productoId)?.producto;
    if (producto && nuevaCantidad > producto.stock) {
      showToast('error', 'Cantidad supera el stock disponible');
      return;
    }
    
    setCarrito(carrito.map(item => 
      item.producto.id === productoId
        ? { ...item, cantidad: nuevaCantidad }
        : item
    ));
  };

  const eliminarDelCarrito = (productoId: number) => {
    setCarrito(carrito.filter(item => item.producto.id !== productoId));
    showToast('info', 'Producto eliminado del carrito');
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setShowCarrito(false);
  };

  const calcularTotalCarrito = () => {
    return carrito.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  };

  const finalizarPedidoCarrito = async () => {
    if (carrito.length === 0) {
      showToast('error', 'El carrito está vacío');
      return;
    }

    setEnviando(true);
    try {
      const detalles = carrito.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precio
      }));

      const total = calcularTotalCarrito();

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detalles, total })
      });

      if (response.ok) {
        const pedido = await response.json();
        
        console.log('Pedido creado:', pedido);
        
        // Notificar al vendedor por WhatsApp Bot
        const productosTexto = carrito
          .map(item => `- ${item.producto.nombre} x${item.cantidad}`)
          .join('\n');

        console.log('Enviando notificación WhatsApp...', {
          numeroPedido: pedido.numeroPedido,
          total: total,
          productos: productosTexto
        });

        fetch('/api/whatsapp/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'nuevo',
            pedido: {
              numeroPedido: pedido.numeroPedido,
              total: total
            },
            productos: productosTexto
          })
        })
        .then(res => {
          console.log('Respuesta notify:', res.status);
          return res.json();
        })
        .then(result => console.log('Resultado notify:', result))
        .catch(err => console.error('Error notificación:', err));

        setNumeroPedidoConfirmado(pedido.numeroPedido);
        setPedidoIdConfirmado(pedido.id);
        setShowCarrito(false);
        setShowConfirmacionModal(true);
        vaciarCarrito();
        cargarPedidosPendientes();
        
        // Agregar pedido a seguimiento para detectar confirmación
        setPedidosEnSeguimiento(prev => [...prev, pedido.id]);
      } else {
        const error = await response.json();
        showToast('error', error.message || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al procesar el pedido');
    } finally {
      setEnviando(false);
    }
  };

  const handleCerrarModal = () => {
    setProductoSeleccionado(null);
    setCantidad(1);
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const handleEnviarPedido = async () => {
    if (!productoSeleccionado || !telefonoTienda) {
      showToast('error', 'Configuración incompleta. Contacte al administrador.');
      return;
    }

    setEnviando(true);

    try {
      // Primero guardar el pedido en la base de datos
      const pedidoResponse = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          detalles: [{
            productoId: productoSeleccionado.id,
            cantidad,
            precioUnitario: productoSeleccionado.precio
          }]
        }),
      });

      if (!pedidoResponse.ok) {
        throw new Error('Error al crear pedido');
      }

      const pedido = await pedidoResponse.json();

      // Notificar al vendedor automáticamente por WhatsApp Bot
      const productosTexto = `- ${productoSeleccionado.nombre} x${cantidad}`;
      
      fetch('/api/whatsapp/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'nuevo',
          pedido: {
            numeroPedido: pedido.numeroPedido,
            total: productoSeleccionado.precio * cantidad
          },
          productos: productosTexto
        })
      }).catch(err => console.error('Error notificación:', err));

      // Guardar número de pedido, ID y mostrar modal de confirmación
      setNumeroPedidoConfirmado(pedido.numeroPedido);
      setPedidoIdConfirmado(pedido.id);
      setShowConfirmacionModal(true);
      
      handleCerrarModal();
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al procesar tu pedido.');
    } finally {
      setEnviando(false);
    }
  };

  const incrementar = () => {
    if (productoSeleccionado && cantidad < productoSeleccionado.stock) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementar = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

  const handleCancelarPedido = async () => {
    if (!pedidoIdConfirmado) return;

    setCancelando(true);
    try {
      const response = await fetch(`/api/pedidos/${pedidoIdConfirmado}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelado' })
      });

      if (response.ok) {
        // Notificar al vendedor por WhatsApp Bot
        fetch('/api/whatsapp/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'cancelacion',
            pedido: {
              numeroPedido: numeroPedidoConfirmado,
              total: 0
            }
          })
        }).catch(err => console.error('Error notificación:', err));

        showToast('success', 'Pedido cancelado correctamente');
        setShowConfirmacionModal(false);
        setPedidoIdConfirmado(null);
        setNumeroPedidoConfirmado('');
        cargarPedidosPendientes(); // Recargar lista
      } else {
        showToast('error', 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al cancelar el pedido');
    } finally {
      setCancelando(false);
    }
  };

  const handleCancelarPedidoLista = async (pedido: any) => {
    setPedidoACancelar(pedido);
    setShowCancelarModal(true);
  };

  const confirmarCancelacionLista = async () => {
    if (!pedidoACancelar) return;
    
    setCancelando(true);
    try {
      // Obtener info del pedido antes de cancelar
      const pedidoResponse = await fetch(`/api/pedidos/${pedidoACancelar.id}`);
      const pedidoData = await pedidoResponse.json();

      const response = await fetch(`/api/pedidos/${pedidoACancelar.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelado' })
      });

      if (response.ok) {
        // Notificar al vendedor por WhatsApp Bot
        const productosTexto = pedidoData.detalles
          .map((d: any) => `- ${d.producto.nombre} x${d.cantidad}`)
          .join('\n');

        fetch('/api/whatsapp/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'cancelacion',
            pedido: {
              numeroPedido: pedidoData.numeroPedido,
              total: pedidoData.total
            },
            productos: productosTexto
          })
        }).catch(err => console.error('Error notificación:', err));

        showToast('success', 'Pedido cancelado correctamente');
        cargarPedidosPendientes();
        setShowCancelarModal(false);
        setPedidoACancelar(null);
      } else {
        showToast('error', 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('error', 'Error al cancelar el pedido');
    } finally {
      setCancelando(false);
    }
  };

  if (loading) {
    return (
      <div className="cliente-loading">
        <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }}>
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando productos...</p>
      </div>
    );
  }

  return (
    <>
      <div className="cliente-container">
        {/* Header */}
        <div className="cliente-header">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col">
                <h1 className="cliente-titulo">
                  <i className="bi bi-shop me-3"></i>
                  Bienvenido a MiBodega
                </h1>
                <p className="cliente-subtitulo">Selecciona los productos que deseas</p>
              </div>
              <div className="col-auto">
                <div className="cliente-info-box">
                  <i className="bi bi-whatsapp me-2"></i>
                  Pedidos por WhatsApp
                </div>
              </div>
              {pedidosPendientes.length > 0 && (
                <div className="col-auto">
                  <button className="btn-mis-pedidos" onClick={() => setShowPedidosModal(true)}>
                    <i className="bi bi-receipt me-2"></i>
                    Mis Pedidos ({pedidosPendientes.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filtros de Categorías */}
        <div className="cliente-categorias">
          <div className="container-fluid">
            <div className="categoria-scroll">
              {categorias.map((cat) => (
                <button
                  key={cat}
                  className={`categoria-btn ${categoriaActiva === cat ? 'active' : ''}`}
                  onClick={() => setCategoriaActiva(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid de Productos */}
        <div className="cliente-productos">
          <div className="container-fluid">
            {productosFiltrados.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: '5rem', color: '#ccc' }}></i>
                <h3 className="mt-4 text-muted">No hay productos disponibles</h3>
              </div>
            ) : (
              <div className="productos-grid">
                {productosFiltrados.map((producto) => {
                  const sinStock = producto.stock === 0;
                  return (
                    <div
                      key={producto.id}
                      className={`producto-card-touch ${sinStock ? 'producto-agotado' : ''}`}
                      onClick={() => !sinStock && handleProductoClick(producto)}
                    >
                      {sinStock && (
                        <div className="badge-agotado">
                          <span className="badge-agotado-texto">AGOTADO</span>
                          <span className="badge-agotado-mensaje">Pronto disponible</span>
                        </div>
                      )}
                      <div className="producto-imagen">
                        {producto.imagen ? (
                          <img src={producto.imagen} alt={producto.nombre} />
                        ) : (
                          <div className="producto-sin-imagen">
                            <i className="bi bi-box-seam"></i>
                          </div>
                        )}
                      </div>
                      <div className="producto-info">
                        <h3 className="producto-nombre">{producto.nombre}</h3>
                        {producto.descripcion && (
                          <p className="producto-descripcion">{producto.descripcion}</p>
                        )}
                        <div className="producto-footer">
                          <div className="producto-precio">S/ {producto.precio.toFixed(2)}</div>
                          <div className="producto-stock">
                            <i className="bi bi-box me-1"></i>
                            Stock: {producto.stock}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Selección */}
      {productoSeleccionado && (
        <div className="modal-touch show">
          <div className="modal-touch-backdrop" onClick={handleCerrarModal}></div>
          <div className="modal-touch-dialog">
            <div className="modal-touch-header">
              <h2>{productoSeleccionado.nombre}</h2>
              <button className="btn-cerrar-touch" onClick={handleCerrarModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            
            <div className="modal-touch-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="producto-imagen-modal">
                    {productoSeleccionado.imagen ? (
                      <img src={productoSeleccionado.imagen} alt={productoSeleccionado.nombre} />
                    ) : (
                      <div className="producto-sin-imagen-modal">
                        <i className="bi bi-box-seam"></i>
                      </div>
                    )}
                  </div>
                  {productoSeleccionado.descripcion && (
                    <p className="mt-3 text-muted">{productoSeleccionado.descripcion}</p>
                  )}
                </div>
                
                <div className="col-md-6">
                  <div className="detalle-producto">
                    <div className="precio-grande">
                      S/ {productoSeleccionado.precio.toFixed(2)}
                      <small className="d-block text-muted">por unidad</small>
                    </div>
                    
                    <div className="stock-info-modal">
                      <i className="bi bi-box me-2"></i>
                      Disponible: {productoSeleccionado.stock} unidades
                    </div>

                    <div className="cantidad-selector">
                      <label className="cantidad-label">Cantidad:</label>
                      <div className="cantidad-controles">
                        <button
                          className="btn-cantidad"
                          onClick={decrementar}
                          disabled={cantidad <= 1}
                        >
                          <i className="bi bi-dash-lg"></i>
                        </button>
                        <span className="cantidad-display">{cantidad}</span>
                        <button
                          className="btn-cantidad"
                          onClick={incrementar}
                          disabled={cantidad >= productoSeleccionado.stock}
                        >
                          <i className="bi bi-plus-lg"></i>
                        </button>
                      </div>
                    </div>

                    <div className="total-modal">
                      <span>Total:</span>
                      <span className="total-precio">
                        S/ {(productoSeleccionado.precio * cantidad).toFixed(2)}
                      </span>
                    </div>

                    <button
                      className="btn-pedir-touch"
                      onClick={agregarAlCarrito}
                      disabled={enviando}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Agregar al Carrito
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mis Pedidos */}
      {showPedidosModal && (
        <div className="modal-overlay-confirmacion" onClick={() => setShowPedidosModal(false)}>
          <div className="modal-pedidos-lista" onClick={(e) => e.stopPropagation()}>
            <div className="modal-pedidos-header">
              <h2>
                <i className="bi bi-receipt me-2"></i>
                Mis Pedidos Pendientes
              </h2>
              <button className="btn-close-pedidos" onClick={() => setShowPedidosModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-pedidos-body">
              {pedidosPendientes.length === 0 ? (
                <div className="pedidos-vacio">
                  <i className="bi bi-inbox"></i>
                  <p>No tienes pedidos pendientes</p>
                </div>
              ) : (
                pedidosPendientes.map((pedido) => (
                  <div key={pedido.id} className="pedido-item-cliente">
                    <div className="pedido-item-header">
                      <span className="pedido-numero">#{pedido.numeroPedido}</span>
                      <span className="pedido-fecha">
                        {new Date(pedido.createdAt).toLocaleString('es-PE', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="pedido-item-detalles">
                      {pedido.detalles.map((detalle: any, idx: number) => (
                        <div key={idx} className="pedido-producto-item">
                          <span>{detalle.producto.nombre}</span>
                          <span className="pedido-cantidad">x{detalle.cantidad}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pedido-item-footer">
                      <span className="pedido-total">Total: S/ {Number(pedido.total).toFixed(2)}</span>
                      <button 
                        className="btn-cancelar-pedido-item"
                        onClick={() => handleCancelarPedidoLista(pedido)}
                      >
                        <i className="bi bi-x-circle me-1"></i>
                        Cancelar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Botón Flotante del Carrito */}
      {carrito.length > 0 && (
        <button className="btn-carrito-flotante" onClick={() => setShowCarrito(true)}>
          <i className="bi bi-cart3"></i>
          <span className="carrito-badge">{carrito.length}</span>
        </button>
      )}

      {/* Modal del Carrito */}
      {showCarrito && (
        <div className="modal-overlay-confirmacion" onClick={() => setShowCarrito(false)}>
          <div className="modal-carrito" onClick={(e) => e.stopPropagation()}>
            <div className="modal-carrito-header">
              <h2>
                <i className="bi bi-cart3 me-2"></i>
                Mi Carrito
              </h2>
              <button className="btn-close-pedidos" onClick={() => setShowCarrito(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <div className="modal-carrito-body">
              {carrito.map((item) => (
                <div key={item.producto.id} className="carrito-item">
                  <div className="carrito-item-imagen">
                    {item.producto.imagen ? (
                      <img src={item.producto.imagen} alt={item.producto.nombre} />
                    ) : (
                      <i className="bi bi-box"></i>
                    )}
                  </div>
                  <div className="carrito-item-info">
                    <h4>{item.producto.nombre}</h4>
                    <p className="carrito-item-precio">S/ {item.producto.precio.toFixed(2)}</p>
                  </div>
                  <div className="carrito-item-controles">
                    <div className="cantidad-controles-carrito">
                      <button
                        className="btn-cantidad-carrito"
                        onClick={() => actualizarCantidadCarrito(item.producto.id, item.cantidad - 1)}
                        disabled={item.cantidad <= 1}
                      >
                        <i className="bi bi-dash-lg"></i>
                      </button>
                      <span className="cantidad-carrito">{item.cantidad}</span>
                      <button
                        className="btn-cantidad-carrito"
                        onClick={() => actualizarCantidadCarrito(item.producto.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.producto.stock}
                      >
                        <i className="bi bi-plus-lg"></i>
                      </button>
                    </div>
                    <p className="carrito-item-subtotal">
                      S/ {(item.producto.precio * item.cantidad).toFixed(2)}
                    </p>
                    <button
                      className="btn-eliminar-carrito"
                      onClick={() => eliminarDelCarrito(item.producto.id)}
                      title="Eliminar"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-carrito-footer">
              <div className="carrito-total-final">
                <span>Total:</span>
                <span className="carrito-total-precio">S/ {calcularTotalCarrito().toFixed(2)}</span>
              </div>
              <div className="carrito-botones">
                <button className="btn-vaciar-carrito" onClick={vaciarCarrito}>
                  <i className="bi bi-trash me-2"></i>
                  Vaciar Carrito
                </button>
                <button 
                  className="btn-finalizar-pedido"
                  onClick={finalizarPedidoCarrito}
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-whatsapp me-2"></i>
                      Finalizar Pedido
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Pedido */}
      {showConfirmacionModal && (
        <div className="modal-overlay-confirmacion">
          <div className="modal-confirmacion-pedido">
            <div className="modal-confirmacion-icono">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2 className="modal-confirmacion-titulo">¡Tu pedido está siendo procesado!</h2>
            <p className="modal-confirmacion-numero">Pedido #{numeroPedidoConfirmado}</p>
            <p className="modal-confirmacion-mensaje">
              Tu pedido ha sido enviado correctamente.<br />
              <strong>En breve recibirás la confirmación y se te entregará tu producto.</strong>
            </p>
            <div className="modal-confirmacion-botones">
              <button 
                className="btn-confirmacion-ok" 
                onClick={() => {
                  setShowConfirmacionModal(false);
                  setNumeroPedidoConfirmado('');
                  setPedidoIdConfirmado(null);
                }}
              >
                Entendido
              </button>
              <button 
                className="btn-cancelar-pedido-cliente" 
                onClick={handleCancelarPedido}
                disabled={cancelando}
              >
                {cancelando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    Cancelar Pedido
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelarModal && (
        <div className="modal-overlay-confirmacion">
          <div className="modal-confirmacion-pedido modal-cancelar">
            <div className="modal-confirmacion-icono" style={{ color: '#f56565' }}>
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h2 className="modal-confirmacion-titulo">¿Cancelar pedido?</h2>
            <p className="modal-confirmacion-numero">Pedido #{pedidoACancelar?.numeroPedido}</p>
            <p className="modal-confirmacion-mensaje">
              ¿Estás seguro de que deseas cancelar este pedido?<br />
              <strong>Esta acción no se puede deshacer.</strong>
            </p>
            <div className="modal-confirmacion-botones">
              <button 
                className="btn-confirmacion-ok btn-secundario" 
                onClick={() => {
                  setShowCancelarModal(false);
                  setPedidoACancelar(null);
                }}
                disabled={cancelando}
              >
                No, volver
              </button>
              <button 
                className="btn-cancelar-pedido-cliente btn-danger" 
                onClick={confirmarCancelacionLista}
                disabled={cancelando}
              >
                {cancelando ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-x-circle me-2"></i>
                    Sí, cancelar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Notificación de Confirmación */}
      {showNotificacionConfirmacion && pedidoConfirmadoInfo && (
        <div className="modal-overlay-confirmacion" onClick={() => setShowNotificacionConfirmacion(false)}>
          <div className="modal-confirmacion-pedido modal-confirmacion-vendedor" onClick={(e) => e.stopPropagation()}>
            <div className="modal-confirmacion-icono" style={{ color: '#48bb78' }}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h2 className="modal-confirmacion-titulo">¡Pedido Confirmado!</h2>
            <p className="modal-confirmacion-numero">Pedido #{pedidoConfirmadoInfo.numeroPedido}</p>
            <p className="modal-confirmacion-mensaje">
              <strong>¡Buenas noticias!</strong><br />
              El vendedor ha confirmado tu pedido.<br />
              <strong>En unos minutos te entregarán tu producto.</strong>
            </p>
            <div className="modal-confirmacion-botones">
              <button 
                className="btn-confirmacion-ok" 
                onClick={() => {
                  setShowNotificacionConfirmacion(false);
                  setPedidoConfirmadoInfo(null);
                }}
              >
                <i className="bi bi-check2 me-2"></i>
                ¡Entendido!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cliente-container {
          min-height: 100vh;
          background: #f7fafc;
          padding-bottom: 2rem;
        }

        .cliente-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: #f7fafc;
          color: #2d3748;
        }

        .cliente-header {
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem 0;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .cliente-titulo {
          font-size: 3rem;
          font-weight: bold;
          color: #2d3748;
          margin: 0;
        }

        .cliente-subtitulo {
          font-size: 1.5rem;
          color: #718096;
          margin: 0;
        }

        .cliente-info-box {
          background: #25D366;
          color: white;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.3rem;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .btn-mis-pedidos {
          background: white;
          color: #667eea;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.2rem;
          font-weight: 600;
          border: 3px solid #667eea;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .btn-mis-pedidos:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        }

        .modal-pedidos-lista {
          background: white;
          border-radius: 30px;
          max-width: 600px;
          width: 90%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .modal-pedidos-header {
          padding: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-pedidos-header h2 {
          margin: 0;
          font-size: 1.8rem;
        }

        .btn-close-pedidos {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .btn-close-pedidos:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-pedidos-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .pedidos-vacio {
          text-align: center;
          padding: 3rem;
          color: #a0aec0;
        }

        .pedidos-vacio i {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .pedido-item-cliente {
          background: #f7fafc;
          border-radius: 15px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
        }

        .pedido-item-cliente:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .pedido-item-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .pedido-numero {
          font-size: 1.3rem;
          font-weight: 700;
          color: #667eea;
        }

        .pedido-fecha {
          color: #718096;
          font-size: 1rem;
        }

        .pedido-item-detalles {
          margin-bottom: 1rem;
        }

        .pedido-producto-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: #4a5568;
          font-size: 1.1rem;
        }

        .pedido-cantidad {
          font-weight: 600;
          color: #667eea;
        }

        .pedido-item-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .pedido-total {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2d3748;
        }

        .btn-cancelar-pedido-item {
          padding: 0.75rem 1.5rem;
          background: white;
          color: #e53e3e;
          border: 2px solid #e53e3e;
          border-radius: 50px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-cancelar-pedido-item:hover {
          background: #e53e3e;
          color: white;
          transform: translateY(-2px);
        }

        .cliente-categorias {
          background: white;
          padding: 1.5rem 0;
          border-bottom: 3px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .categoria-scroll {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .categoria-btn {
          padding: 1rem 2.5rem;
          border: 3px solid #e2e8f0;
          background: white;
          border-radius: 50px;
          font-size: 1.3rem;
          font-weight: 600;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.3s;
          white-space: nowrap;
        }

        .categoria-btn:hover {
          border-color: #667eea;
          color: #667eea;
          transform: translateY(-2px);
        }

        .categoria-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .cliente-productos {
          padding: 2rem 0;
        }

        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .producto-card-touch {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          cursor: pointer;
          transition: all 0.3s;
          position: relative;
        }

        .producto-card-touch:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.25);
        }

        .producto-card-touch:active {
          transform: scale(0.98);
        }

        /* Producto agotado */
        .producto-agotado {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(100%);
        }

        .producto-agotado:hover {
          transform: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }

        .producto-agotado:active {
          transform: none;
        }

        .badge-agotado {
          position: absolute;
          top: 1rem;
          right: 1rem;
          z-index: 10;
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 15px;
          box-shadow: 0 4px 15px rgba(245, 101, 101, 0.4);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          animation: pulseAgotado 2s infinite;
        }

        @keyframes pulseAgotado {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .badge-agotado-texto {
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 1px;
        }

        .badge-agotado-mensaje {
          font-size: 0.75rem;
          opacity: 0.9;
          font-weight: 500;
        }


        .producto-imagen {
          height: 250px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .producto-imagen img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .producto-sin-imagen {
          font-size: 5rem;
          color: #cbd5e0;
        }

        .producto-info {
          padding: 1.5rem;
        }

        .producto-nombre {
          font-size: 1.5rem;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 0.5rem;
        }

        .producto-descripcion {
          font-size: 1rem;
          color: #718096;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .producto-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .producto-precio {
          font-size: 2rem;
          font-weight: bold;
          color: #667eea;
        }

        .producto-stock {
          font-size: 1rem;
          color: #48bb78;
          font-weight: 600;
        }

        .modal-touch {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .modal-touch-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
        }

        .modal-touch-dialog {
          position: relative;
          background: white;
          border-radius: 30px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0,0,0,0.3);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-touch-header {
          padding: 2rem;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-touch-header h2 {
          font-size: 2rem;
          font-weight: bold;
          color: #2d3748;
          margin: 0;
        }

        .btn-cerrar-touch {
          background: #f56565;
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-cerrar-touch:hover {
          background: #e53e3e;
          transform: rotate(90deg);
        }

        .modal-touch-body {
          padding: 2rem;
        }

        .producto-imagen-modal {
          width: 100%;
          height: 300px;
          background: white;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .producto-imagen-modal img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .producto-sin-imagen-modal {
          font-size: 6rem;
          color: #cbd5e0;
        }

        .detalle-producto {
          background: #f7fafc;
          padding: 2rem;
          border-radius: 20px;
        }

        .precio-grande {
          font-size: 3rem;
          font-weight: bold;
          color: #667eea;
          margin-bottom: 1rem;
        }

        .stock-info-modal {
          background: #c6f6d5;
          color: #22543d;
          padding: 1rem;
          border-radius: 10px;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .cantidad-selector {
          margin-bottom: 2rem;
        }

        .cantidad-label {
          font-size: 1.3rem;
          font-weight: 600;
          color: #2d3748;
          display: block;
          margin-bottom: 1rem;
        }

        .cantidad-controles {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2rem;
        }

        .btn-cantidad {
          width: 70px;
          height: 70px;
          border: 3px solid #667eea;
          background: white;
          color: #667eea;
          border-radius: 15px;
          font-size: 2rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-cantidad:hover:not(:disabled) {
          background: #667eea;
          color: white;
          transform: scale(1.1);
        }

        .btn-cantidad:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .cantidad-display {
          font-size: 3rem;
          font-weight: bold;
          color: #2d3748;
          min-width: 80px;
          text-align: center;
        }

        .total-modal {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: white;
          border-radius: 15px;
          margin-bottom: 2rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .total-precio {
          font-size: 2rem;
          color: #48bb78;
        }

        .btn-pedir-touch {
          width: 100%;
          padding: 1.5rem;
          background: #25D366;
          color: white;
          border: none;
          border-radius: 15px;
          font-size: 1.5rem;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
        }

        .btn-pedir-touch:hover:not(:disabled) {
          background: #128C7E;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
        }

        .btn-pedir-touch:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .toast-container-cliente {
          position: fixed;
          top: 2rem;
          right: 2rem;
          z-index: 9999;
          animation: slideInRight 0.4s ease-out;
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .toast-modern {
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          min-width: 350px;
          max-width: 500px;
          border-left: 5px solid;
        }

        .toast-modern.success {
          border-left-color: #48bb78;
        }

        .toast-modern.error {
          border-left-color: #f56565;
        }

        .toast-modern.info {
          border-left-color: #4299e1;
        }

        .toast-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          font-size: 1.1rem;
          font-weight: 500;
          color: #2d3748;
        }

        .toast-close {
          background: transparent;
          border: none;
          font-size: 2rem;
          color: #a0aec0;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .toast-close:hover {
          background: #edf2f7;
          color: #2d3748;
        }

        .modal-overlay-confirmacion {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
        }

        .modal-confirmacion-pedido {
          background: white;
          border-radius: 30px;
          padding: 3rem 2rem;
          max-width: 600px;
          width: 100%;
          text-align: center;
          animation: slideInUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-confirmacion-icono {
          font-size: 6rem;
          color: #48bb78;
          margin-bottom: 1.5rem;
          animation: bounceIn 0.6s ease;
        }

        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .modal-confirmacion-titulo {
          font-size: 2rem;
          font-weight: bold;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .modal-confirmacion-numero {
          font-size: 1.5rem;
          font-weight: 600;
          color: #667eea;
          margin-bottom: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: #f7fafc;
          border-radius: 15px;
          display: inline-block;
        }

        .modal-confirmacion-mensaje {
          font-size: 1.3rem;
          color: #4a5568;
          line-height: 1.8;
          margin-bottom: 2rem;
        }

        .modal-confirmacion-mensaje strong {
          color: #2d3748;
        }

        .modal-confirmacion-botones {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-secundario {
          background: linear-gradient(135deg, #cbd5e0 0%, #a0aec0 100%) !important;
        }

        .btn-secundario:hover {
          background: linear-gradient(135deg, #a0aec0 0%, #718096 100%) !important;
          box-shadow: 0 6px 20px rgba(160, 174, 192, 0.4) !important;
        }

        .btn-danger {
          background: linear-gradient(135deg, #fc8181 0%, #f56565 100%) !important;
        }

        .btn-danger:hover {
          background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%) !important;
          box-shadow: 0 6px 20px rgba(245, 101, 101, 0.5) !important;
        }

        /* Modal de Confirmación del Vendedor */
        .modal-confirmacion-vendedor {
          animation: slideInDown 0.5s ease, shake 0.6s ease 0.2s;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translateX(5px) rotate(1deg); }
        }

        /* Botón Flotante del Carrito */
        .btn-carrito-flotante {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
          cursor: pointer;
          transition: all 0.3s;
          z-index: 999;
          animation: pulseCart 2s infinite;
        }

        @keyframes pulseCart {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .btn-carrito-flotante:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
        }

        .btn-carrito-flotante:active {
          transform: scale(0.95);
        }

        .carrito-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #f56565;
          color: white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: bold;
          border: 3px solid white;
          animation: bounceIn 0.5s ease;
        }

        /* Modal del Carrito */
        .modal-carrito {
          background: white;
          border-radius: 30px;
          width: 95%;
          max-width: 600px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          animation: slideInUp 0.4s ease;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-carrito-header {
          padding: 2rem;
          border-bottom: 2px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 30px 30px 0 0;
        }

        .modal-carrito-header h2 {
          margin: 0;
          font-size: 1.8rem;
          color: white;
          display: flex;
          align-items: center;
        }

        .modal-carrito-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          max-height: 400px;
        }

        .carrito-item {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: #f7fafc;
          border-radius: 15px;
          margin-bottom: 1rem;
          border: 2px solid #e2e8f0;
          transition: all 0.3s;
        }

        .carrito-item:hover {
          border-color: #667eea;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
        }

        .carrito-item-imagen {
          width: 80px;
          height: 80px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .carrito-item-imagen img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .carrito-item-imagen i {
          font-size: 2.5rem;
          color: #cbd5e0;
        }

        .carrito-item-info {
          flex: 1;
          min-width: 0;
        }

        .carrito-item-info h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.2rem;
          color: #2d3748;
          font-weight: 600;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .carrito-item-precio {
          margin: 0;
          color: #667eea;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .carrito-item-controles {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }

        .cantidad-controles-carrito {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.3rem;
          border-radius: 10px;
          border: 2px solid #e2e8f0;
        }

        .btn-cantidad-carrito {
          background: #667eea;
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .btn-cantidad-carrito:hover:not(:disabled) {
          background: #764ba2;
          transform: scale(1.1);
        }

        .btn-cantidad-carrito:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }

        .cantidad-carrito {
          min-width: 35px;
          text-align: center;
          font-weight: 600;
          font-size: 1.1rem;
          color: #2d3748;
        }

        .carrito-item-subtotal {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2d3748;
          margin: 0;
        }

        .btn-eliminar-carrito {
          background: #fc8181;
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.1rem;
        }

        .btn-eliminar-carrito:hover {
          background: #f56565;
          transform: scale(1.1);
        }

        .modal-carrito-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid #e2e8f0;
          background: #f7fafc;
          border-radius: 0 0 30px 30px;
        }

        .carrito-total-final {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding: 1rem;
          background: white;
          border-radius: 12px;
          border: 2px solid #667eea;
        }

        .carrito-total-final span:first-child {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
        }

        .carrito-total-precio {
          font-size: 2rem !important;
          font-weight: 700 !important;
          color: #667eea !important;
        }

        .carrito-botones {
          display: flex;
          gap: 1rem;
        }

        .btn-vaciar-carrito {
          flex: 1;
          padding: 1rem;
          border-radius: 15px;
          border: 2px solid #fc8181;
          background: white;
          color: #f56565;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-vaciar-carrito:hover {
          background: #fc8181;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(252, 129, 129, 0.4);
        }

        .btn-finalizar-pedido {
          flex: 2;
          padding: 1rem;
          border-radius: 15px;
          border: none;
          background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-finalizar-pedido:hover:not(:disabled) {
          background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(72, 187, 120, 0.5);
        }

        .btn-finalizar-pedido:disabled {
          background: #cbd5e0;
          cursor: not-allowed;
        }



        .btn-confirmacion-ok {
          padding: 1.2rem 3rem;
          font-size: 1.3rem;
          font-weight: 600;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
          flex: 1;
          min-width: 180px;
        }

        .btn-confirmacion-ok:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .btn-confirmacion-ok:active {
          transform: translateY(0);
        }

        .btn-cancelar-pedido-cliente {
          padding: 1.2rem 2rem;
          font-size: 1.2rem;
          font-weight: 600;
          background: white;
          color: #e53e3e;
          border: 2px solid #e53e3e;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
          min-width: 180px;
        }

        .btn-cancelar-pedido-cliente:hover:not(:disabled) {
          background: #e53e3e;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(229, 62, 62, 0.4);
        }

        .btn-cancelar-pedido-cliente:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-cancelar-pedido-cliente:active:not(:disabled) {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .cliente-titulo {
            font-size: 2rem;
          }

          .btn-carrito-flotante {
            width: 60px;
            height: 60px;
            font-size: 1.5rem;
            bottom: 1.5rem;
            right: 1.5rem;
          }

          .carrito-badge {
            width: 24px;
            height: 24px;
            font-size: 0.8rem;
          }

          .modal-carrito {
            width: 100%;
            max-height: 95vh;
            border-radius: 20px 20px 0 0;
          }

          .modal-carrito-header {
            border-radius: 20px 20px 0 0;
            padding: 1.5rem;
          }

          .modal-carrito-header h2 {
            font-size: 1.5rem;
          }

          .carrito-item {
            flex-direction: column;
            gap: 1rem;
          }

          .carrito-item-controles {
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }

          .carrito-botones {
            flex-direction: column;
          }

          .carrito-total-final {
            font-size: 1.2rem;
          }

          .carrito-total-precio {
            font-size: 1.5rem !important;
          }
          
          .cliente-subtitulo {
            font-size: 1.2rem;
          }

          .productos-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
          }

          .modal-touch-dialog {
            margin: 1rem;
          }

          .toast-container-cliente {
            top: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .toast-modern {
            min-width: auto;
            width: 100%;
          }

          .modal-confirmacion-pedido {
            padding: 2rem 1.5rem;
          }

          .modal-confirmacion-icono {
            font-size: 4.5rem;
          }

          .modal-confirmacion-titulo {
            font-size: 1.5rem;
          }

          .modal-confirmacion-numero {
            font-size: 1.2rem;
          }

          .modal-confirmacion-mensaje {
            font-size: 1.1rem;
          }

          .btn-confirmacion-ok {
            padding: 1rem 2rem;
            font-size: 1.1rem;
            min-width: 150px;
          }

          .btn-cancelar-pedido-cliente {
            padding: 1rem 1.5rem;
            font-size: 1rem;
            min-width: 150px;
          }

          .modal-confirmacion-botones {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
}
