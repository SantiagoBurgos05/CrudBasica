from conexion import Conexion

class AccesoVentas:
    def __init__(self):
        self.conexion = Conexion()

    def registrar(self, id_persona, producto):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Ventas (IDPersona, Producto, Cantidad, Precio) VALUES (?, ?, ?, ?)",
            id_persona, producto['producto'], int(producto['cantidad']), float(producto['precio'])
        )
        conn.commit()
        return cursor.rowcount

    @staticmethod
    def _normalizar(fila_dict):
        # pyodbc devuelve las columnas DECIMAL/NUMERIC como decimal.Decimal,
        # y Flask no puede serializar ese tipo a JSON -> provoca un 500.
        if 'precio' in fila_dict and fila_dict['precio'] is not None:
            fila_dict['precio'] = float(fila_dict['precio'])
        return fila_dict

    def consultar(self):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT v.IDVenta, v.IDPersona, v.Producto, v.Cantidad, v.Precio, v.FechaVenta,
                   p.Nombre, p.Apellido
            FROM Ventas v
            JOIN Personas p ON v.IDPersona = p.IDPersona
        """)
        columnas = [col[0].lower() for col in cursor.description]
        return [self._normalizar(dict(zip(columnas, fila))) for fila in cursor.fetchall()]

    def consultar_detalle(self, id_venta):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT v.IDVenta, v.Producto, v.Cantidad, v.Precio, v.FechaVenta,
                   p.IDPersona, p.Nombre, p.Apellido, p.Edad, p.Telefono
            FROM Ventas v
            JOIN Personas p ON v.IDPersona = p.IDPersona
            WHERE v.IDVenta = ?
        """, id_venta)
        fila = cursor.fetchone()
        if fila:
            columnas = [col[0].lower() for col in cursor.description]
            return self._normalizar(dict(zip(columnas, fila)))
        return None

    def modificar(self, id_venta, venta):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE Ventas SET Producto=?, Cantidad=?, Precio=? WHERE IDVenta=?",
            venta['producto'], int(venta['cantidad']), float(venta['precio']), id_venta
        )
        conn.commit()
        return cursor.rowcount

    def eliminar(self, id_venta):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Ventas WHERE IDVenta = ?", id_venta)
        conn.commit()
        return cursor.rowcount