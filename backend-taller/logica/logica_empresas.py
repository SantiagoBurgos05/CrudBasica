from acceso.acceso_empresas import AccesoEmpresas

class LogicaEmpresas:
    def __init__(self):
        self.acceso = AccesoEmpresas()

    def validar_registro(self, empresa):
        campos = ['empresa', 'nombre', 'nit']
        for campo in campos:
            if not empresa.get(campo) or str(empresa.get(campo)).strip() == '':
                return False, f'El campo {campo} es obligatorio'
        self.acceso.registrar(empresa)
        return True, 'Empresa registrada con éxito'

    def consultar(self):
        return self.acceso.consultar()

    def modificar(self, codigo, empresa):
        return self.acceso.modificar(codigo, empresa)

    def eliminar(self, codigo):
        return self.acceso.eliminar(codigo)