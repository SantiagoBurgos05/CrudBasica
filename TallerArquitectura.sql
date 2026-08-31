-- 1. Crear la base de datos
CREATE DATABASE TallerArquitectura;
GO
USE TallerArquitectura;
GO

-- 2. Tabla Empresas (mapea la clase "Inicio": Codigo, Empresa, Nombre, NIT)
CREATE TABLE Empresas (
    Codigo INT IDENTITY(1,1) PRIMARY KEY,
    Empresa VARCHAR(150) NOT NULL,
    Nombre VARCHAR(150) NOT NULL,
    NIT VARCHAR(20) NOT NULL UNIQUE,
    FechaIngreso DATETIME DEFAULT GETDATE()
);
GO

-- 3. Tabla Usuarios (mapea la clase "Conexion": login, password)
CREATE TABLE Usuarios (
    IDUsuario INT IDENTITY(1,1) PRIMARY KEY,
    Login VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL, -- se guardará el hash, no el texto plano
    IDEmpresa INT NULL,
    FOREIGN KEY (IDEmpresa) REFERENCES Empresas(Codigo)
);
GO

-- 4. Tabla Personas (mapea la clase "Ingreso": IDpersona, nombre, apellido, edad, telefono)
CREATE TABLE Personas (
    IDPersona INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Apellido VARCHAR(100) NOT NULL,
    Edad INT NOT NULL,
    Telefono VARCHAR(20) NOT NULL
);
GO

-- 5. Tabla Ventas: relaciona una venta con un cliente (Personas)
CREATE TABLE Ventas (
    IDVenta INT IDENTITY(1,1) PRIMARY KEY,
    IDPersona INT NOT NULL,
    Producto VARCHAR(150) NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1,
    Precio DECIMAL(10,2) NOT NULL,
    FechaVenta DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (IDPersona) REFERENCES Personas(IDPersona)
);
GO

-- 6. Datos de prueba (orden correcto: primero Empresas y Personas, luego lo que depende de ellas)
INSERT INTO Empresas (Empresa, Nombre, NIT) VALUES ('BLS', 'Admin', '900123456-1');
GO

INSERT INTO Usuarios (Login, Password, IDEmpresa)
VALUES ('admin', 'admin123', 1); -- luego lo cambiamos por hash real desde el backend
GO

INSERT INTO Personas (Nombre, Apellido, Edad, Telefono)
VALUES ('Juan', 'Pérez', 28, '3001234567');
GO

INSERT INTO Ventas (IDPersona, Producto, Cantidad, Precio)
VALUES (1, 'Figura 3D - Dragón', 2, 45000.00);
GO

USE TallerArquitectura;
GO

ALTER TABLE Usuarios ADD Nombres VARCHAR(100) NULL;
ALTER TABLE Usuarios ADD Apellidos VARCHAR(100) NULL;
ALTER TABLE Usuarios ADD Correo VARCHAR(150) NULL;
GO

-- Completar el registro admin que ya existe (opcional, para que no quede en blanco)
UPDATE Usuarios
SET Nombres = 'Administrador', Apellidos = 'Sistema', Correo = 'admin@blsdynamics.com'
WHERE Login = 'admin';
GO

ALTER TABLE Usuarios ADD Telefono VARCHAR(20) NULL;
GO
select * from Usuarios