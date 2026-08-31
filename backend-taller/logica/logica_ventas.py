from acceso.acceso_ventas import AccesoVentas
from acceso.acceso_personas import AccesoPersonas

# La columna Precio es DECIMAL(10,2): máximo 8 dígitos enteros + 2 decimales.
PRECIO_MAXIMO = 99999999.99

class LogicaVentas:
    def __init__(self):
        self.acceso = AccesoVentas()
        self.acceso_personas = AccesoPersonas()

    def _validar_producto(self, producto):
        if not producto.get('producto'):
            return False, 'El nombre del producto es obligatorio'
        try:
            cantidad = int(producto.get('cantidad'))
            precio = float(producto.get('precio'))
        except (ValueError, TypeError):
            return False, 'Cantidad y precio deben ser numéricos'
        if cantidad <= 0:
            return False, 'La cantidad debe ser mayor a 0'
        if precio <= 0:
            return False, 'El precio debe ser mayor a 0'
        if precio > PRECIO_MAXIMO:
            return False, f'El precio no puede ser mayor a {PRECIO_MAXIMO:,.2f}'
        return True, None

    def validar_registro(self, datos):
        producto = datos.get('producto', {})
        persona = datos.get('persona', {})

        ok, mensaje = self._validar_producto(producto)
        if not ok:
            return False, mensaje

        for campo in ['nombre', 'apellido', 'edad', 'telefono']:
            if not persona.get(campo) or str(persona.get(campo)).strip() == '':
                return False, f'El campo {campo} del cliente es obligatorio'
        try:
            edad = int(persona.get('edad'))
        except (ValueError, TypeError):
            return False, 'La edad debe ser un número'
        if edad <= 0:
            return False, 'La edad debe ser mayor a 0'

        id_persona = self.acceso_personas.registrar(persona)
        self.acceso.registrar(id_persona, producto)
        return True, 'Venta registrada con éxito'

    def consultar(self):
        return self.acceso.consultar()

    def consultar_detalle(self, id_venta):
        return self.acceso.consultar_detalle(id_venta)

    def modificar(self, id_venta, venta):
        ok, mensaje = self._validar_producto(venta)
        if not ok:
            return False, mensaje
        self.acceso.modificar(id_venta, venta)
        return True, 'Venta actualizada'

    def eliminar(self, id_venta):
        return self.acceso.eliminar(id_venta)