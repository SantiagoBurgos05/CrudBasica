import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const login = (loginUser, password) => api.post('/login', { login: loginUser, password });

export const registrarUsuario = (usuario) => api.post('/usuarios', usuario);
export const getUsuarios = () => api.get('/usuarios');
export const actualizarUsuario = (id, usuario) => api.put(`/usuarios/${id}`, usuario);
export const eliminarUsuario = (id) => api.delete(`/usuarios/${id}`);

export const getEmpresas = () => api.get('/empresas');
export const crearEmpresa = (empresa) => api.post('/empresas', empresa);
export const actualizarEmpresa = (codigo, empresa) => api.put(`/empresas/${codigo}`, empresa);
export const eliminarEmpresa = (codigo) => api.delete(`/empresas/${codigo}`);

export const getVentas = () => api.get('/ventas');
export const getVentaDetalle = (id) => api.get(`/ventas/${id}`);
export const crearVenta = (venta) => api.post('/ventas', venta);
export const actualizarVenta = (id, venta) => api.put(`/ventas/${id}`, venta);
export const eliminarVenta = (id) => api.delete(`/ventas/${id}`);

export default api;