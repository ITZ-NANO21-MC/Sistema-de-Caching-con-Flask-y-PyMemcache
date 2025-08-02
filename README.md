# Sistema-de-Caching-con-Flask-y-PyMemcache

Este proyecto demuestra cómo implementar un sistema de caching eficiente usando Flask y PyMemcache. La aplicación incluye un decorador personalizado para manejar el almacenamiento en caché de funciones, con soporte para caracteres especiales y serialización binaria segura.

## Características Principales

- ✅ Decorador personalizado para caching de funciones
- ✅ Manejo seguro de caracteres especiales (UTF-8)
- ✅ Serialización binaria con Pickle
- ✅ Generación de claves seguras mediante hashing SHA-256
- ✅ Interfaz web intuitiva para probar el sistema
- ✅ Limpieza completa de caché con un solo clic
- ✅ Visualización clara del origen de los datos (caché o base de datos)

## Requisitos Previos

- Python 3.11+
- Memcached 1.6+
- Pip (gestor de paquetes de Python)

## Instalación y Configuración

### 1. Instalar dependencias del sistema

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install memcached python3-pip python3-venv

# macOS (con Homebrew)
brew install memcached python
```

### 2. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/flask-pymemcache-caching.git
cd flask-pymemcache-caching
```

### 3. Crear entorno virtual e instalar dependencias

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 4. Iniciar Memcached

```bash
# Iniciar en primer plano (para ver logs)
memcached -vv

# Iniciar en segundo plano
memcached -d
```

## Estructura del Proyecto

```
flask-pymemcache-caching/
├── app.py                  # Aplicación principal Flask
├── requirements.txt        # Dependencias de Python
├── .env.example            # Ejemplo de variables de entorno
├── README.md
├── static/
│   ├── css/
│   │   └── style.css       # Estilos CSS
│   └── js/
│       └── app.js          # Lógica JavaScript
└── templates/
    └── index.html          # Plantilla principal
```

## Configuración

Crea un archivo `.env` basado en el ejemplo:

```bash
cp .env.example .env
```

Edita el archivo `.env` según tu configuración:

```env
# .env
MEMCACHED_HOST=localhost
MEMCACHED_PORT=11211
```

## Ejecutar la Aplicación

```bash
source venv/bin/activate
python app.py
```

Visita la aplicación en tu navegador:  
http://localhost:5000

## Uso de la Aplicación

### 1. Operación Pesada
- Ingresa un parámetro (puede contener caracteres especiales)
- Haz clic en "Ejecutar Operación"
- La primera ejecución será lenta (3s), las siguientes serán instantáneas

### 2. Datos de Usuario
- Ingresa un ID de usuario
- Haz clic en "Obtener Usuario"
- Observa la fuente de los datos (Base de datos o Caché)

### 3. Gestión de Caché
- Haz clic en "Limpiar Toda la Caché" para borrar todos los datos almacenados
- Verás un mensaje de confirmación

## Implementación de Caching

### Decorador Personalizado

El núcleo del sistema es el decorador `pymemcache_cached` que maneja:

```python
def pymemcache_cached(timeout=60, key_prefix=None):
    def decorator(f):
        @functools.wraps(f)
        def wrapper(*args, **kwargs):
            # Generar clave segura
            prefix = key_prefix or f.__name__
            cache_key = create_safe_key(prefix, args, kwargs)
            
            # Verificar caché
            cached_data = memcache_client.get(cache_key)
            if cached_data:
                return pickle.loads(cached_data), True
            
            # Ejecutar y almacenar si no está en caché
            result = f(*args, **kwargs)
            serialized_result = pickle.dumps(result)
            memcache_client.set(cache_key, serialized_result, expire=timeout)
            return result, False
        return wrapper
    return decorator
```

### Generación de Claves Seguras

Para evitar problemas con caracteres especiales y espacios:

```python
def create_safe_key(prefix, args, kwargs):
    args_repr = json.dumps(args, sort_keys=True)
    kwargs_repr = json.dumps(kwargs, sort_keys=True)
    arg_hash = hashlib.sha256(f"{args_repr}{kwargs_repr}".encode()).hexdigest()
    return f"{prefix}_{arg_hash}".encode('utf-8')
```

### Flujo de Trabajo

1. **Primera solicitud**:
   - Los datos se obtienen de la función original
   - Se serializan y almacenan en Memcached
   - Se muestra "Base de datos" como fuente

2. **Solicitudes posteriores**:
   - Los datos se recuperan de Memcached
   - Se deserializan y devuelven
   - Se muestra "Caché (pymemcache)" como fuente

## Tecnologías Utilizadas

- **Flask**: Microframework web para Python
- **PyMemcache**: Cliente Python para Memcached
- **Memcached**: Sistema de almacenamiento en caché de alto rendimiento
- **Pickle**: Serialización de objetos Python
- **SHA-256**: Algoritmo de hashing para generación de claves seguras
- **HTML/CSS/JS**: Interfaz de usuario moderna y responsive

## Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## Para Usar el Proyecto

1. Crea un repositorio en GitHub
2. Clona el repositorio en tu máquina local
3. Copia los archivos proporcionados en sus respectivas ubicaciones
4. Sigue las instrucciones de instalación en el README
5. Ejecuta la aplicación con `python app.py`

Este proyecto proporciona una base sólida para implementar sistemas de caching eficientes en aplicaciones Flask, con especial atención al manejo de caracteres especiales y generación segura de claves.
