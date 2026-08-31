import { useEffect, useState } from 'react';
import { getVentas, getVentaDetalle, crearVenta, actualizarVenta, eliminarVenta } from '../services/api';
import { campoVacio, esNumeroPositivo, esEnteroPositivo } from '../utils/validaciones';
import ErrorModal from './ErrorModal';

const productoVacio = { producto: '', cantidad: 1, precio: '' };
const personaVacia = { nombre: '', apellido: '', edad: '', telefono: '' };
// La columna Precio en la BD es DECIMAL(10,2): máximo 8 dígitos enteros + 2 decimales
const PRECIO_MAXIMO = 99999999.99;

function VentasCrud() {
  const [ventas, setVentas] = useState([]);
  const [mostrarCrear, setMostrarCrear] = useState(false);
  const [producto, setProducto] = useState(productoVacio);
  const [persona, setPersona] = useState(personaVacia);
  const [seccionAbierta, setSeccionAbierta] = useState('producto');
  const [error, setError] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [editando, setEditando] = useState(null);

  const cargar = async () => {
    const res = await getVentas();
    setVentas(res.data);
  };

  useEffect(() => { cargar(); }, []);

  const validarCreacion = () => {
    if (campoVacio(producto.producto) || campoVacio(producto.cantidad) || campoVacio(producto.precio)) {
      return 'Todos los datos del producto son obligatorios';
    }
    if (!esEnteroPositivo(producto.cantidad)) return 'La cantidad debe ser un número entero mayor a 0';
    if (!esNumeroPositivo(producto.precio)) return 'El precio debe ser un número mayor a 0';
    if (Number(producto.precio) > PRECIO_MAXIMO) return `El precio no puede ser mayor a ${PRECIO_MAXIMO.toLocaleString()}`;
    if (campoVacio(persona.nombre) || campoVacio(persona.apellido) || campoVacio(persona.edad) || campoVacio(persona.telefono)) {
      return 'Todos los datos del cliente son obligatorios';
    }
    if (!esEnteroPositivo(persona.edad)) return 'La edad debe ser un número entero mayor a 0';
    return null;
  };

  const validarEdicion = (v) => {
    if (campoVacio(v.producto) || campoVacio(v.cantidad) || campoVacio(v.precio)) return 'Todos los campos son obligatorios';
    if (!esEnteroPositivo(v.cantidad)) return 'La cantidad debe ser un número entero mayor a 0';
    if (!esNumeroPositivo(v.precio)) return 'El precio debe ser un número mayor a 0';
    if (Number(v.precio) > PRECIO_MAXIMO) return `El precio no puede ser mayor a ${PRECIO_MAXIMO.toLocaleString()}`;
    return null;
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const errorValidacion = validarCreacion();
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await crearVenta({ producto, persona });
      setError('');
      setProducto(productoVacio);
      setPersona(personaVacia);
      setMostrarCrear(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la venta');
    }
  };

  const handleEliminar = async (id) => {
    await eliminarVenta(id);
    cargar();
  };

  const handleGuardarEdicion = async () => {
    const errorValidacion = validarEdicion(editando);
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await actualizarVenta(editando.idventa, editando);
      setError('');
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar la venta');
    }
  };

  const handleVerInfo = async (id) => {
    const res = await getVentaDetalle(id);
    setDetalle(res.data);
  };

  return (
    <div>
      <h3>Ventas</h3>

      <button className="btn btn-primary" onClick={() => { setMostrarCrear(true); setError(''); setSeccionAbierta('producto'); }}>
        Registrar venta
      </button>

      <table className="data-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr><th>ID</th><th>Cliente</th><th>Producto</th><th>Cant.</th><th>Precio</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <tr key={v.idventa}>
              {editando?.idventa === v.idventa ? (
                <>
                  <td>{v.idventa}</td>
                  <td>{v.nombre} {v.apellido}</td>
                  <td><input value={editando.producto} onChange={(e) => setEditando({ ...editando, producto: e.target.value })} /></td>
                  <td><input value={editando.cantidad} onChange={(e) => setEditando({ ...editando, cantidad: e.target.value })} /></td>
                  <td><input value={editando.precio} onChange={(e) => setEditando({ ...editando, precio: e.target.value })} /></td>
                  <td className="actions"><button className="btn btn-primary" onClick={handleGuardarEdicion}>Guardar</button></td>
                </>
              ) : (
                <>
                  <td>{v.idventa}</td>
                  <td>{v.nombre} {v.apellido}</td>
                  <td>{v.producto}</td>
                  <td>{v.cantidad}</td>
                  <td>{v.precio}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => handleVerInfo(v.idventa)}>Ver info</button>
                    <button className="btn btn-secondary" onClick={() => { setEditando(v); setError(''); }}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleEliminar(v.idventa)}>Eliminar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {mostrarCrear && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setMostrarCrear(false)}>×</button>
            <h3>Registrar venta</h3>
            <form onSubmit={handleCrear}>
              <div className="collapse-section">
                <div className="collapse-header" onClick={() => setSeccionAbierta(seccionAbierta === 'producto' ? '' : 'producto')}>
                  Datos del producto <span>{seccionAbierta === 'producto' ? '−' : '+'}</span>
                </div>
                {seccionAbierta === 'producto' && (
                  <div className="collapse-body">
                    <input placeholder="Producto" value={producto.producto} onChange={(e) => setProducto({ ...producto, producto: e.target.value })} />
                    <input type="number" placeholder="Cantidad" value={producto.cantidad} onChange={(e) => setProducto({ ...producto, cantidad: e.target.value })} />
                    <input placeholder="Precio" value={producto.precio} onChange={(e) => setProducto({ ...producto, precio: e.target.value })} />
                  </div>
                )}
              </div>

              <div className="collapse-section">
                <div className="collapse-header" onClick={() => setSeccionAbierta(seccionAbierta === 'persona' ? '' : 'persona')}>
                  Datos del cliente <span>{seccionAbierta === 'persona' ? '−' : '+'}</span>
                </div>
                {seccionAbierta === 'persona' && (
                  <div className="collapse-body">
                    <input placeholder="Nombre" value={persona.nombre} onChange={(e) => setPersona({ ...persona, nombre: e.target.value })} />
                    <input placeholder="Apellido" value={persona.apellido} onChange={(e) => setPersona({ ...persona, apellido: e.target.value })} />
                    <input type="number" placeholder="Edad" value={persona.edad} onChange={(e) => setPersona({ ...persona, edad: e.target.value })} />
                    <input placeholder="Teléfono" value={persona.telefono} onChange={(e) => setPersona({ ...persona, telefono: e.target.value })} />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }}>Guardar venta</button>
            </form>
          </div>
        </div>
      )}

      {detalle && (
        <div className="modal-overlay">
          <div className="modal-box">
            <button className="close-btn" onClick={() => setDetalle(null)}>×</button>
            <h3>Detalle de la venta #{detalle.idventa}</h3>
            <div className="detail-row"><span>Producto</span><span>{detalle.producto}</span></div>
            <div className="detail-row"><span>Cantidad</span><span>{detalle.cantidad}</span></div>
            <div className="detail-row"><span>Precio</span><span>{detalle.precio}</span></div>
            <div className="detail-row"><span>Fecha</span><span>{detalle.fechaventa}</span></div>
            <h3 style={{ marginTop: '20px' }}>Cliente</h3>
            <div className="detail-row"><span>Nombre</span><span>{detalle.nombre} {detalle.apellido}</span></div>
            <div className="detail-row"><span>Edad</span><span>{detalle.edad}</span></div>
            <div className="detail-row"><span>Teléfono</span><span>{detalle.telefono}</span></div>
          </div>
        </div>
      )}
            <ErrorModal mensaje={error} onClose={() => setError('')} />
    </div>
  );
}

export default VentasCrud;