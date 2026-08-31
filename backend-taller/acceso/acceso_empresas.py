from conexion import Conexion

class AccesoEmpresas:
    def __init__(self):
        self.conexion = Conexion()

    def registrar(self, empresa):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Empresas (Empresa, Nombre, NIT) VALUES (?, ?, ?)",
            empresa['empresa'], empresa['nombre'], empresa['nit']
        )
        conn.commit()
        return cursor.rowcount

    def consultar(self):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT Codigo, Empresa, Nombre, NIT, FechaIngreso FROM Empresas")
        columnas = [col[0].lower() for col in cursor.description]
        return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]

    def modificar(self, codigo, empresa):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE Empresas SET Empresa=?, Nombre=?, NIT=? WHERE Codigo=?",
            empresa['empresa'], empresa['nombre'], empresa['nit'], codigo
        )
        conn.commit()
        return cursor.rowcount

    def eliminar(self, codigo):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Empresas WHERE Codigo = ?", codigo)
        conn.commit()
        return cursor.rowcount