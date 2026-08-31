from conexion import Conexion

class AccesoPersonas:
    def __init__(self):
        self.conexion = Conexion()

    def registrar(self, persona):
        conn = self.conexion.get_conexion()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO Personas (Nombre, Apellido, Edad, Telefono)
            OUTPUT INSERTED.IDPersona
            VALUES (?, ?, ?, ?)
            """,
            persona['nombre'], persona['apellido'], persona['edad'], persona['telefono']
        )
        id_persona = int(cursor.fetchone()[0])
        conn.commit()
        return id_persona