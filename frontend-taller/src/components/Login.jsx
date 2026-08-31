import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { campoVacio } from '../utils/validaciones';
import ErrorModal from './ErrorModal';

function Login() {
  const [loginUser, setLoginUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (campoVacio(loginUser) || campoVacio(password)) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }

    try {
      const res = await login(loginUser, password);
      if (res.data.success) {
        navigate('/crud');
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    }
  };

  return (
    <div className="auth-page plate-bg">
      <div className="auth-card">
        <h2>BLS Dynamics 3D</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Usuario" value={loginUser} onChange={(e) => setLoginUser(e.target.value)} />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn btn-primary">Ingresar</button>
        </form>
        <p className="switch-link">
          ¿No tienes cuenta? <Link to="/registro">Regístrate aquí</Link>
        </p>
      </div>
      <ErrorModal mensaje={error} onClose={() => setError('')} />
    </div>
  );
}

export default Login;