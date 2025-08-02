from flask import Flask, render_template, request, jsonify
from pymemcache.client import base as pymemcache_base
import os
import time
import functools
import pickle
import hashlib
import json
from dotenv import load_dotenv

# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)

# Configurar cliente de Memcached
MEMCACHED_HOST = os.getenv('MEMCACHED_HOST', 'localhost')
MEMCACHED_PORT = int(os.getenv('MEMCACHED_PORT', 11211))
memcache_client = pymemcache_base.Client(
    (MEMCACHED_HOST, MEMCACHED_PORT),
    encoding='utf-8'
)

# Función para crear claves seguras
def create_safe_key(prefix, args, kwargs):
    # Convertir argumentos a representación JSON
    args_repr = json.dumps(args, sort_keys=True)
    kwargs_repr = json.dumps(kwargs, sort_keys=True)
    
    # Crear hash único de los argumentos
    arg_hash = hashlib.sha256(f"{args_repr}{kwargs_repr}".encode()).hexdigest()
    
    # Combinar prefijo y hash
    return f"{prefix}_{arg_hash}".encode('utf-8')

# Decorador mejorado que indica si se usó caché
def pymemcache_cached(timeout=60, key_prefix=None):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Generar clave segura
            prefix = key_prefix or f.__name__
            cache_key = create_safe_key(prefix, args, kwargs)
            
            # Intentar obtener del caché
            cached_data = memcache_client.get(cache_key)
            if cached_data:
                # Devolver datos y flag de caché
                return pickle.loads(cached_data), True
            
            # Ejecutar función si no está en caché
            result = f(*args, **kwargs)
            serialized_result = pickle.dumps(result)
            memcache_client.set(cache_key, serialized_result, expire=timeout)
            return result, False
        return wrapper
    return decorator

# Función de servicio pesada con caché personalizado
@pymemcache_cached(timeout=60, key_prefix='heavy_operation')
def heavy_operation(param):
    time.sleep(3)  # Simular operación costosa
    return f"Resultado de operación con parámetro: {param} (caracteres especiales: áéíóúñ)"

# Función con caché personalizado
@pymemcache_cached(timeout=45)
def get_user_data(user_id):
    time.sleep(2)  # Simular acceso a base de datos
    return {
        'user_id': user_id,
        'name': f'Usuario {user_id} (áéíóúñ)',
        'email': f'user{user_id}@example.com'
    }

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/operation')
def operation():
    param = request.args.get('param', 'default')
    result, from_cache = heavy_operation(param)
    
    return jsonify(
        result=result,
        source="Caché (pymemcache)" if from_cache else "Base de datos"
    )

@app.route('/user/<int:user_id>')
def user_profile(user_id):
    user_data, from_cache = get_user_data(user_id)
    
    return jsonify(
        data=user_data,
        source="Caché (pymemcache)" if from_cache else "Base de datos"
    )

@app.route('/clear_cache')
def clear_cache():
    memcache_client.flush_all()
    return jsonify(status="Caché completamente limpiada")

if __name__ == '__main__':
    app.run(debug=True)