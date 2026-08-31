from conexion import Conexion

class AccesoUsuarios:
    def __init__(self):
        self.conexion = Conexion()

    def registrar(self, usuario):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO Usuarios (Nombres, Apellidos, Correo, Telefono, Login, Password, IDEmpresa) VALUES (?, ?, ?, ?, ?, ?, ?)",
            usuario['nombres'], usuario['apellidos'], usuario['correo'], usuario['telefono'],
            usuario['login'], usuario['password'], usuario['idempresa']
        )
        conn.commit()
        return cursor.rowcount

    def consultar(self):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.IDUsuario, u.Nombres, u.Apellidos, u.Correo, u.Telefono, u.Login,
                   u.IDEmpresa, e.Empresa AS NombreEmpresa
            FROM Usuarios u
            LEFT JOIN Empresas e ON u.IDEmpresa = e.Codigo
        """)
        columnas = [col[0].lower() for col in cursor.description]
        return [dict(zip(columnas, fila)) for fila in cursor.fetchall()]

    def consultar_por_login(self, login):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("SELECT IDUsuario, Login, Password FROM Usuarios WHERE Login = ?", login)
        fila = cursor.fetchone()
        if fila:
            return {'idusuario': fila[0], 'login': fila[1], 'password': fila[2]}
        return None

    def modificar(self, id_usuario, usuario):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE Usuarios SET Nombres=?, Apellidos=?, Correo=?, Telefono=?, Login=?, IDEmpresa=? WHERE IDUsuario=?",
            usuario['nombres'], usuario['apellidos'], usuario['correo'], usuario['telefono'],
            usuario['login'], usuario['idempresa'], id_usuario
        )
        conn.commit()
        return cursor.rowcount

    def eliminar(self, id_usuario):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM Usuarios WHERE IDUsuario = ?", id_usuario)
        conn.commit()
        return cursor.rowcount