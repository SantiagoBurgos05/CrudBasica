import re
from acceso.acceso_usuarios import AccesoUsuarios
from werkzeug.security import generate_password_hash, check_password_hash

class LogicaUsuarios:
    def __init__(self):
        self.acceso = AccesoUsuarios()

    def validar_registro(self, usuario, requiere_password=True):
        campos = ['nombres', 'apellidos', 'correo', 'telefono', 'login', 'idempresa']
        for campo in campos:
            if not usuario.get(campo) or str(usuario.get(campo)).strip() == '':
                return False, f'El campo {campo} es obligatorio'

        if requiere_password and (not usuario.get('password') or str(usuario.get('password')).strip() == ''):
            return False, 'La contraseña es obligatoria'

        if not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', usuario['correo']):
            return False, 'El correo no tiene un formato válido'

        try:
            int(usuario['idempresa'])
        except (ValueError, TypeError):
            return False, 'Debes seleccionar una empresa válida'

        if requiere_password:
            if len(usuario['password']) < 6:
                return False, 'La contraseña debe tener al menos 6 caracteres'
            if self.acceso.consultar_por_login(usuario['login']):
                return False, 'Ese usuario ya existe'
            usuario['password'] = generate_password_hash(usuario['password'])
            self.acceso.registrar(usuario)
            return True, 'Usuario registrado con éxito'

        return True, None

    def validar_login(self, login, password):
        if not login or not password:
            return False
        usuario = self.acceso.consultar_por_login(login)
        if usuario and check_password_hash(usuario['password'], password):
            return True
        return False

    def consultar(self):
        return self.acceso.consultar()

    def modificar(self, id_usuario, usuario):
        ok, mensaje = self.validar_registro(usuario, requiere_password=False)
        if not ok:
            return False, mensaje
        self.acceso.modificar(id_usuario, usuario)
        return True, 'Usuario actualizado'

    def eliminar(self, id_usuario):
        return self.acceso.eliminar(id_usuario)