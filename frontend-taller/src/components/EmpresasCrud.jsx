import { useEffect, useState } from 'react';
import { getEmpresas, crearEmpresa, actualizarEmpresa, eliminarEmpresa } from '../services/api';
import { campoVacio } from '../utils/validaciones';

const formVacio = { empresa: '', nombre: '', nit: '' };

function EmpresasCrud() {
  const [empresas, setEmpresas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [nueva, setNueva] = useState(formVacio);
  const [error, setError] = useState('');

  const cargar = async () => {
    const res = await getEmpresas();
    setEmpresas(res.data);
  };

  useEffect(() => { cargar(); }, []);

  const validar = (e) => (campoVacio(e.empresa) || campoVacio(e.nombre) || campoVacio(e.nit))
    ? 'Todos los campos son obligatorios' : null;

  const handleCrear = async (e) => {
    e.preventDefault();
    const errorValidacion = validar(nueva);
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await crearEmpresa(nueva);
      setError('');
      setNueva(formVacio);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear la empresa');
    }
  };

  const handleEliminar = async (codigo) => {
    await eliminarEmpresa(codigo);
    cargar();
  };

  const handleGuardar = async () => {
    const errorValidacion = validar(editando);
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await actualizarEmpresa(editando.codigo, editando);
      setError('');
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar la empresa');
    }
  };

  return (
    <div>
      <h3>Empresas</h3>
      <button className="btn btn-primary" onClick={() => { setCreando(!creando); setError(''); }}>
        {creando ? 'Cancelar' : 'Crear empresa'}
      </button>

      {creando && (
        <form className="inline-form" onSubmit={handleCrear} style={{ marginTop: '16px' }}>
          <input placeholder="Empresa" value={nueva.empresa} onChange={(e) => setNueva({ ...nueva, empresa: e.target.value })} />
          <input placeholder="Nombre contacto" value={nueva.nombre} onChange={(e) => setNueva({ ...nueva, nombre: e.target.value })} />
          <input placeholder="NIT" value={nueva.nit} onChange={(e) => setNueva({ ...nueva, nit: e.target.value })} />
          <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}

      <table className="data-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr><th>Código</th><th>Empresa</th><th>Nombre</th><th>NIT</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {empresas.map((e) => (
            <tr key={e.codigo}>
              {editando?.codigo === e.codigo ? (
                <>
                  <td>{e.codigo}</td>
                  <td><input value={editando.empresa} onChange={(ev) => setEditando({ ...editando, empresa: ev.target.value })} /></td>
                  <td><input value={editando.nombre} onChange={(ev) => setEditando({ ...editando, nombre: ev.target.value })} /></td>
                  <td><input value={editando.nit} onChange={(ev) => setEditando({ ...editando, nit: ev.target.value })} /></td>
                  <td className="actions"><button className="btn btn-primary" onClick={handleGuardar}>Guardar</button></td>
                </>
              ) : (
                <>
                  <td>{e.codigo}</td>
                  <td>{e.empresa}</td>
                  <td>{e.nombre}</td>
                  <td>{e.nit}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => { setEditando(e); setError(''); }}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleEliminar(e.codigo)}>Eliminar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmpresasCrud;