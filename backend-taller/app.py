from flask import Flask, request, jsonify
from flask_cors import CORS
from logica.logica_usuarios import LogicaUsuarios
from logica.logica_ventas import LogicaVentas
from logica.logica_empresas import LogicaEmpresas

app = Flask(__name__)
CORS(app)

import traceback

@app.errorhandler(Exception)
def manejar_error(e):
    traceback.print_exc()  # esto sí lo verás completo en la terminal
    return jsonify({'mensaje': 'Error interno del servidor'}), 500

logica_usuarios = LogicaUsuarios()
logica_ventas = LogicaVentas()
logica_empresas = LogicaEmpresas()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    ok = logica_usuarios.validar_login(data.get('login'), data.get('password'))
    return jsonify({'success': ok})

# --- Usuarios ---
@app.route('/api/usuarios', methods=['POST'])
def registrar_usuario():
    data = request.json
    ok, mensaje = logica_usuarios.validar_registro(data, requiere_password=True)
    return (jsonify({'mensaje': mensaje}), 201) if ok else (jsonify({'mensaje': mensaje}), 400)

@app.route('/api/usuarios', methods=['GET'])
def listar_usuarios():
    return jsonify(logica_usuarios.consultar())

@app.route('/api/usuarios/<int:id_usuario>', methods=['PUT'])
def modificar_usuario(id_usuario):
    ok, mensaje = logica_usuarios.modificar(id_usuario, request.json)
    return (jsonify({'mensaje': mensaje}), 200) if ok else (jsonify({'mensaje': mensaje}), 400)

@app.route('/api/usuarios/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    logica_usuarios.eliminar(id_usuario)
    return jsonify({'mensaje': 'Usuario eliminado'})

# --- Empresas ---
@app.route('/api/empresas', methods=['GET'])
def listar_empresas():
    return jsonify(logica_empresas.consultar())

@app.route('/api/empresas', methods=['POST'])
def registrar_empresa():
    data = request.json
    ok, mensaje = logica_empresas.validar_registro(data)
    return (jsonify({'mensaje': mensaje}), 201) if ok else (jsonify({'mensaje': mensaje}), 400)

@app.route('/api/empresas/<int:codigo>', methods=['PUT'])
def modificar_empresa(codigo):
    logica_empresas.modificar(codigo, request.json)
    return jsonify({'mensaje': 'Empresa actualizada'})

@app.route('/api/empresas/<int:codigo>', methods=['DELETE'])
def eliminar_empresa(codigo):
    logica_empresas.eliminar(codigo)
    return jsonify({'mensaje': 'Empresa eliminada'})

# --- Ventas ---
@app.route('/api/ventas', methods=['GET'])
def listar_ventas():
    return jsonify(logica_ventas.consultar())

@app.route('/api/ventas/<int:id_venta>', methods=['GET'])
def detalle_venta(id_venta):
    detalle = logica_ventas.consultar_detalle(id_venta)
    return jsonify(detalle) if detalle else (jsonify({'mensaje': 'Venta no encontrada'}), 404)

@app.route('/api/ventas', methods=['POST'])
def registrar_venta():
    data = request.json
    ok, mensaje = logica_ventas.validar_registro(data)
    return (jsonify({'mensaje': mensaje}), 201) if ok else (jsonify({'mensaje': mensaje}), 400)

@app.route('/api/ventas/<int:id_venta>', methods=['PUT'])
def modificar_venta(id_venta):
    ok, mensaje = logica_ventas.modificar(id_venta, request.json)
    return (jsonify({'mensaje': mensaje}), 200) if ok else (jsonify({'mensaje': mensaje}), 400)

@app.route('/api/ventas/<int:id_venta>', methods=['DELETE'])
def eliminar_venta(id_venta):
    logica_ventas.eliminar(id_venta)
    return jsonify({'mensaje': 'Venta eliminada'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)