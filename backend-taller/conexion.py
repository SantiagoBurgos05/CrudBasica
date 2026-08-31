import pyodbc

class Conexion:
    def __init__(self):
        self.servidor = 'SANTIAGO\\SQLEXPRESS'
        self.basedatos = 'TallerArquitectura'
        self.conexion = None

    def conectar(self):
        cadena = (
            'DRIVER={ODBC Driver 17 for SQL Server};'
            f'SERVER={self.servidor};'
            f'DATABASE={self.basedatos};'
            'Trusted_Connection=yes;'
        )
        self.conexion = pyodbc.connect(cadena)
        return self.conexion

    def get_conexion(self):
        if self.conexion is None:
            return self.conectar()
        return self.conexion

    def desconectar(self):
        if self.conexion:
            self.conexion.close()
            self.conexion = None