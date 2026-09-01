# BLS Dynamics 3D — Taller de Arquitectura de Software

Sistema de gestión de **usuarios, empresas y ventas** desarrollado como taller de la asignatura de Arquitectura de Software. Aplicación web full-stack con backend en **Flask (Python)** conectado a **SQL Server**, y frontend en **React**.

> **Taller:** Implementación de Estilos Arquitectónico y Patrones de Diseño
> **Objetivo:** Construir una aplicación que implemente patrones de diseño bajo una arquitectura de desarrollo, con conexión a base de datos, Programación Orientada a Objetos y operaciones CRUD.

## Patrones de arquitectura y diseño utilizados

Este proyecto implementa una **arquitectura monolítica** organizada bajo el patrón **MVC (Modelo–Vista–Controlador)**, y dentro del Modelo se aplica adicionalmente el patrón **DAO (Data Access Object)** para separar la lógica de negocio del acceso a datos:

| Elemento del taller | Rol en MVC | Implementación en el proyecto |
|---|---|---|
| **Vista** | Interfaz con el usuario | Frontend en **React** (`frontend/src/components/*`) |
| **Controlador** | Recibe la solicitud, delega y devuelve la respuesta | `backend/app.py` (rutas Flask `/api/...`) |
| **Modelo → Lógica** | Reglas de negocio y validación | `backend/logica/*` (`LogicaUsuarios`, `LogicaEmpresas`, `LogicaVentas`) |
| **Modelo → Acceso (DAO)** | Operaciones CRUD contra la base de datos | `backend/acceso/*` (`AccesoUsuarios`, `AccesoEmpresas`, `AccesoPersonas`, `AccesoVentas`) |
| **Modelo → Conexión** | Gestión de la conexión a la BD | `backend/conexion.py` (`Conexion`: `conectar()`, `get_conexion()`, `desconectar()`) |

Esta separación replica exactamente el diagrama de **Arquitectura Monolítica** propuesto en el enunciado del taller (Vista ↔ Controlador ↔ Modelo, con el Modelo dividido en Lógica, Acceso y Conexión), aplicado aquí a las tres entidades del dominio (Usuarios/Empresas, Personas/Ventas) en vez de a una sola clase de ejemplo.

## Arquitectura general

El proyecto está dividido en dos aplicaciones independientes que se comunican por HTTP/JSON, siguiendo el flujo **Vista → Controlador → Modelo → Base de datos** del diagrama del taller:

```
┌─────────────────────┐        REST API (JSON)        ┌──────────────────────────────────────┐
│  VISTA (React)       │ ─────────────────────────────► │  CONTROLADOR (app.py / rutas Flask)   │
│  Componentes + Vistas │ ◄───────────────────────────── │  MODELO → Lógica → Acceso → Conexión  │
└─────────────────────┘                                └──────────────────────────────────────┘
```

### Backend: MVC (Controlador + Modelo) con DAO

El backend implementa el **Controlador** y el **Modelo** del patrón MVC. El Modelo, a su vez, se subdivide en tres responsabilidades (Lógica, Acceso y Conexión), igual que en el diagrama del taller:

```
backend/
├── app.py                 # CONTROLADOR — rutas HTTP
├── logica/                # MODELO → Lógica de negocio (Service Layer)
│   ├── logica_usuarios.py
│   ├── logica_empresas.py
│   └── logica_ventas.py
├── acceso/                 # MODELO → Acceso a datos (patrón DAO)
│   ├── acceso_usuarios.py
│   ├── acceso_empresas.py
│   ├── acceso_personas.py
│   └── acceso_ventas.py
└── conexion.py             # MODELO → Conexión a la base de datos
```

**1. Controlador — `app.py`**
Expone los endpoints REST (`/api/usuarios`, `/api/empresas`, `/api/ventas`, `/api/login`) y traduce las peticiones HTTP a llamadas de la capa de lógica. No contiene reglas de negocio ni SQL: solo recibe el `request`, delega y devuelve la respuesta JSON con el código de estado correspondiente (200/201/400/404/500). Incluye un `errorhandler` global que captura cualquier excepción no controlada y evita que el stack trace se filtre al cliente.

**2. Modelo → Lógica — `logica/*` (Service Layer)**
Cada entidad (`Usuarios`, `Empresas`, `Ventas`) tiene su propia clase `Logica*` responsable de:
- Validar los datos de entrada (campos obligatorios, formatos, rangos numéricos, reglas del dominio).
- Orquestar llamadas a una o varias clases DAO (por ejemplo, `LogicaVentas` coordina `AccesoPersonas` y `AccesoVentas` para registrar una venta junto con su cliente).
- Aplicar reglas de seguridad, como el hash de contraseñas antes de persistirlas.

Esta capa nunca ejecuta SQL directamente: solo habla con las clases `Acceso*` (DAO).

**3. Modelo → Acceso — `acceso/*` (patrón DAO)**
Cada clase `Acceso*` es un **Data Access Object**: encapsula exclusivamente las operaciones CRUD contra su tabla en SQL Server usando `pyodbc`, con consultas parametrizadas (`?`) para prevenir inyección SQL. El resto de la aplicación nunca escribe SQL directamente — siempre pasa por el DAO correspondiente. Esta capa no valida reglas de negocio: solo persiste y consulta.

**4. Modelo → Conexión — `conexion.py`**
Clase `Conexion` responsable exclusivamente de abrir, entregar y cerrar la conexión a SQL Server (`conectar()`, `get_conexion()`, `desconectar()`), aislando el detalle de la cadena de conexión y el driver ODBC del resto del Modelo.

**Beneficio de esta combinación MVC + DAO:** el Controlador puede cambiar (por ejemplo, exponer la misma lógica por gRPC en vez de REST) sin tocar el Modelo; y dentro del Modelo, la Lógica puede cambiar sus reglas sin saber cómo se persisten los datos, mientras que el DAO puede migrar de SQL Server a otro motor sin que la Lógica ni el Controlador se enteren.

### Frontend: la Vista del MVC

El frontend implementa la **Vista** del patrón MVC, siguiendo el modelo estándar de **React (Component-Based Architecture)** con separación adicional de responsabilidades:

```
frontend/src/
├── components/          # Componentes de UI (presentación + estado local)
│   ├── Login.jsx
│   ├── Registro.jsx
│   ├── Crud.jsx          # Layout/orquestador de las pestañas del panel
│   ├── UsuariosCrud.jsx
│   ├── EmpresasCrud.jsx
│   ├── VentasCrud.jsx
│   └── ErrorModal.jsx
├── services/
│   └── api.js            # Capa de acceso a la API (cliente HTTP centralizado)
├── utils/
│   └── validaciones.js   # Funciones puras de validación reutilizables
└── App.jsx                # Enrutamiento (React Router)
```

- **`services/api.js`** centraliza todas las llamadas HTTP con Axios, actuando como una capa de abstracción entre los componentes y el backend (los componentes nunca llaman a `fetch`/`axios` directamente).
- **`utils/validaciones.js`** aísla la lógica de validación de formularios como funciones puras, reutilizadas por distintos componentes CRUD.
- Cada entidad tiene su propio componente `*Crud.jsx` con responsabilidad única: listar, crear, editar y eliminar sus propios registros, replicando el mismo patrón de UI en las tres pantallas.
- El enrutamiento (`Login → Registro → Crud`) se maneja con **React Router**, y `Crud.jsx` actúa como layout contenedor con navegación por pestañas hacia los sub-CRUDs.

## Modelo de datos

Base de datos SQL Server (`TallerArquitectura`) con las siguientes tablas:

- **Empresas**: entidades registradas en el sistema.
- **Usuarios**: cuentas de acceso, asociadas a una empresa (`IDEmpresa`), con contraseña hasheada.
- **Personas**: clientes que realizan compras.
- **Ventas**: registros de venta asociados a una persona (`IDPersona`), con producto, cantidad, precio (`DECIMAL(10,2)`) y fecha.

El script completo de creación está en [`TallerArquitectura.sql`](./TallerArquitectura.sql).

## Puesta en marcha

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py                # http://localhost:5000
```

> Ajusta el servidor de SQL Server en `conexion.py` (`self.servidor`) según tu instancia local.

### Frontend

```bash
cd frontend
npm install
npm run dev                  # http://localhost:5173
```

## Endpoints principales

| Método | Ruta                     | Descripción                    |
|--------|--------------------------|---------------------------------|
| POST   | `/api/login`              | Autenticación de usuario        |
| GET/POST | `/api/usuarios`         | Listar / registrar usuarios     |
| PUT/DELETE | `/api/usuarios/<id>`  | Editar / eliminar usuario       |
| GET/POST | `/api/empresas`         | Listar / registrar empresas     |
| PUT/DELETE | `/api/empresas/<id>`  | Editar / eliminar empresa       |
| GET/POST | `/api/ventas`            | Listar / registrar ventas       |
| GET    | `/api/ventas/<id>`        | Detalle de una venta            |
| PUT/DELETE | `/api/ventas/<id>`    | Editar / eliminar venta         |
