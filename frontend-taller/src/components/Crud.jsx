import { useState } from 'react';
import UsuariosCrud from './UsuariosCrud';
import VentasCrud from './VentasCrud';
import EmpresasCrud from './EmpresasCrud';

function Crud() {
  const [tab, setTab] = useState('usuarios');

  return (
    <div className="crud-layout">
      <aside className="sidebar">
        <div className="brand">Actividad <span>Arquitectura Software</span></div>
        <nav>
          <button className={tab === 'usuarios' ? 'active' : ''} onClick={() => setTab('usuarios')}>Usuarios</button>
          <button className={tab === 'empresas' ? 'active' : ''} onClick={() => setTab('empresas')}>Empresas</button>
          <button className={tab === 'ventas' ? 'active' : ''} onClick={() => setTab('ventas')}>Ventas</button>
        </nav>
      </aside>
      <div className="main-content">
        {tab === 'usuarios' && <UsuariosCrud />}
        {tab === 'empresas' && <EmpresasCrud />}
        {tab === 'ventas' && <VentasCrud />}
      </div>
    </div>
  );
}

export default Crud;