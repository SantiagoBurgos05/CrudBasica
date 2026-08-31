import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario, getEmpresas } from '../services/api';
import { campoVacio, correoValido } from '../utils/validaciones';
import ErrorModal from './ErrorModal';

function Registro() {
  const [form, setForm] = useState({
    nombres: '', apellidos: '', correo: '', telefono: '', login: '', password: '', idempresa: '',
  });
  const [empresas, setEmpresas] = useState([]);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const navigate = useNavigate();

  useEffect(() => { getEmpresas().then((res) => setEmpresas(res.data)); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validar = () => {
    if (campoVacio(form.nombres) || campoVacio(form.apellidos) || campoVacio(form.correo)
      || campoVacio(form.telefono) || campoVacio(form.login) || campoVacio(form.password)
      || campoVacio(form.idempresa)) {
      return 'Todos los campos son obligatorios, incluyendo la empresa';
    }
    if (!correoValido(form.correo)) return 'El correo no tiene un formato válido';
    if (form.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errorValidacion = validar();
    if (errorValidacion) { setError(errorValidacion); return; }
    try {
      await registrarUsuario(form);
      setExito('Usuario registrado con éxito');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar usuario');
    }
  };

  return (
    <div className="auth-page plate-bg">
      <div className="auth-card">
        <h2>Crear cuenta</h2>
        <form onSubmit={handleSubmit}>
          <input name="nombres" placeholder="Nombres" value={form.nombres} onChange={handleChange} />
          <input name="apellidos" placeholder="Apellidos" value={form.apellidos} onChange={handleChange} />
          <input name="correo" type="email" placeholder="Correo electrónico" value={form.correo} onChange={handleChange} />
          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
          <select name="idempresa" value={String(form.idempresa)} onChange={handleChange}>
            <option value="">Selecciona una empresa</option>
            {empresas.map((emp) => <option key={emp.codigo} value={String(emp.codigo)}>{emp.empresa}</option>)}
          </select>
          <input name="login" placeholder="Usuario" value={form.login} onChange={handleChange} />
          <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} />
          <button type="submit" className="btn btn-primary">Registrarse</button>
        </form>
        {exito && <p className="switch-link">{exito}</p>}
      </div>
      <ErrorModal mensaje={error} onClose={() => setError('')} />
    </div>
  );
}

export default Registro;