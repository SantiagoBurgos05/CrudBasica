import { useEffect, useState } from 'react';
import { getUsuarios, registrarUsuario, actualizarUsuario, eliminarUsuario, getEmpresas } from '../services/api';
import { campoVacio, correoValido } from '../utils/validaciones';
import ErrorModal from './ErrorModal';

const formVacio = { nombres: '', apellidos: '', correo: '', telefono: '', login: '', password: '', idempresa: '' };

function UsuariosCrud() {
  const [usuarios, setUsuarios] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [editando, setEditando] = useState(null);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState(formVacio);
  const [error, setError] = useState('');

  const cargar = async () => {
    const res = await getUsuarios();
    // normalizamos nulos (registros creados antes de tener estos campos)
    const datos = res.data.map((u) => ({
      ...u,
      telefono: u.telefono ?? '',
      idempresa: u.idempresa ?? '',
    }));
    setUsuarios(datos);
  };

  useEffect(() => {
    cargar();
    getEmpresas().then((res) => setEmpresas(res.data));
  }, []);

  const validarUsuario = (u, requierePassword) => {
    if (campoVacio(u.nombres) || campoVacio(u.apellidos) || campoVacio(u.correo)
      || campoVacio(u.telefono) || campoVacio(u.login) || campoVacio(u.idempresa)) {
      return 'Todos los campos son obligatorios, incluyendo la empresa';
    }
    if (requierePassword && campoVacio(u.password)) return 'La contraseña es obligatoria';
    if (!correoValido(u.correo)) return 'El correo no tiene un formato válido';
    return null;
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    const errorValidacion = validarUsuario(nuevo, true);
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await registrarUsuario(nuevo);
      setNuevo(formVacio);
      setCreando(false);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al crear el usuario');
    }
  };

  const handleEliminar = async (id) => {
    await eliminarUsuario(id);
    cargar();
  };

  const handleGuardar = async () => {
    const errorValidacion = validarUsuario(editando, false);
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await actualizarUsuario(editando.idusuario, editando);
      setEditando(null);
      cargar();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al actualizar el usuario');
    }
  };

  return (
    <div>
      <h3>Usuarios de la aplicación</h3>
      <button className="btn btn-primary" onClick={() => setCreando(!creando)}>
        {creando ? 'Cancelar' : 'Crear usuario'}
      </button>

      {creando && (
        <form className="inline-form" onSubmit={handleCrear} style={{ marginTop: '16px' }}>
          <input placeholder="Nombres" value={nuevo.nombres} onChange={(e) => setNuevo({ ...nuevo, nombres: e.target.value })} />
          <input placeholder="Apellidos" value={nuevo.apellidos} onChange={(e) => setNuevo({ ...nuevo, apellidos: e.target.value })} />
          <input placeholder="Correo" type="email" value={nuevo.correo} onChange={(e) => setNuevo({ ...nuevo, correo: e.target.value })} />
          <input placeholder="Teléfono" value={nuevo.telefono} onChange={(e) => setNuevo({ ...nuevo, telefono: e.target.value })} />
          <select value={String(nuevo.idempresa)} onChange={(e) => setNuevo({ ...nuevo, idempresa: e.target.value })}>
            <option value="">Empresa</option>
            {empresas.map((emp) => <option key={emp.codigo} value={String(emp.codigo)}>{emp.empresa}</option>)}
          </select>
          <input placeholder="Usuario" value={nuevo.login} onChange={(e) => setNuevo({ ...nuevo, login: e.target.value })} />
          <input placeholder="Contraseña" type="password" value={nuevo.password} onChange={(e) => setNuevo({ ...nuevo, password: e.target.value })} />
          <button type="submit" className="btn btn-primary">Guardar</button>
        </form>
      )}

      <table className="data-table" style={{ marginTop: '20px' }}>
        <thead>
          <tr><th>ID</th><th>Nombres</th><th>Apellidos</th><th>Correo</th><th>Teléfono</th><th>Empresa</th><th>Login</th><th>Acciones</th></tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.idusuario}>
              {editando?.idusuario === u.idusuario ? (
                <>
                  <td>{u.idusuario}</td>
                  <td><input value={editando.nombres} onChange={(e) => setEditando({ ...editando, nombres: e.target.value })} /></td>
                  <td><input value={editando.apellidos} onChange={(e) => setEditando({ ...editando, apellidos: e.target.value })} /></td>
                  <td><input value={editando.correo} onChange={(e) => setEditando({ ...editando, correo: e.target.value })} /></td>
                  <td><input value={editando.telefono} onChange={(e) => setEditando({ ...editando, telefono: e.target.value })} /></td>
                  <td>
                    <select value={String(editando.idempresa)} onChange={(e) => setEditando({ ...editando, idempresa: e.target.value })}>
                      <option value="">Empresa</option>
                      {empresas.map((emp) => <option key={emp.codigo} value={String(emp.codigo)}>{emp.empresa}</option>)}
                    </select>
                  </td>
                  <td><input value={editando.login} onChange={(e) => setEditando({ ...editando, login: e.target.value })} /></td>
                  <td className="actions"><button className="btn btn-primary" onClick={handleGuardar}>Guardar</button></td>
                </>
              ) : (
                <>
                  <td>{u.idusuario}</td>
                  <td>{u.nombres}</td>
                  <td>{u.apellidos}</td>
                  <td>{u.correo}</td>
                  <td>{u.telefono}</td>
                  <td>{u.nombreempresa}</td>
                  <td>{u.login}</td>
                  <td className="actions">
                    <button className="btn btn-secondary" onClick={() => setEditando(u)}>Editar</button>
                    <button className="btn btn-danger" onClick={() => handleEliminar(u.idusuario)}>Eliminar</button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <ErrorModal mensaje={error} onClose={() => setError('')} />
    </div>
  );
}

export default UsuariosCrud;