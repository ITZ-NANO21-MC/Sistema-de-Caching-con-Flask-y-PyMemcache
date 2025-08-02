// static/js/app.js

/**
 * Función para mostrar resultados con formato
 * @param {string} containerId - ID del contenedor donde mostrar los resultados
 * @param {string|object} data - Datos a mostrar
 * @param {string} source - Fuente de los datos (Caché o Base de datos)
 */
function displayResult(containerId, data, source) {
    const container = document.getElementById(containerId);
    
    // Limpiar contenido previo
    container.innerHTML = '';
    
    // Mostrar datos
    if (typeof data === 'string') {
        container.innerHTML = `<p>${data}</p>`;
    } else if (typeof data === 'object') {
        let html = '';
        for (const [key, value] of Object.entries(data)) {
            html += `<p><strong>${key}:</strong> ${value}</p>`;
        }
        container.innerHTML = html;
    }
    
    // Mostrar fuente
    const sourceElement = document.createElement('div');
    sourceElement.className = `source-tag ${source === 'Caché (pymemcache)' ? 'source-cache' : 'source-db'}`;
    sourceElement.textContent = `Fuente: ${source}`;
    container.appendChild(sourceElement);
}

/**
 * Función para mostrar mensaje de estado
 * @param {string} containerId - ID del contenedor donde mostrar el estado
 * @param {string} message - Mensaje a mostrar
 * @param {boolean} isSuccess - Indica si es un mensaje de éxito
 */
function displayStatus(containerId, message, isSuccess = true) {
    const container = document.getElementById(containerId);
    container.innerHTML = `<p>${message}</p>`;
    container.style.backgroundColor = isSuccess ? '#eafaf1' : '#fadbd8';
    
    // Limpiar después de 3 segundos
    setTimeout(() => {
        container.innerHTML = '';
        container.style.backgroundColor = '';
    }, 3000);
}

/**
 * Función para ejecutar la operación pesada
 */
async function runOperation() {
    const param = document.getElementById('param').value || 'default';
    try {
        const response = await fetch(`/operation?param=${encodeURIComponent(param)}`);
        const data = await response.json();
        
        displayResult('operation-result', data.result, data.source);
    } catch (error) {
        displayStatus('operation-result', 'Error al ejecutar la operación', false);
        console.error('Error:', error);
    }
}

/**
 * Función para obtener datos de usuario
 */
async function getUser() {
    const userId = document.getElementById('user-id').value || 1;
    try {
        const response = await fetch(`/user/${userId}`);
        const data = await response.json();
        
        displayResult('user-result', data.data, data.source);
    } catch (error) {
        displayStatus('user-result', 'Error al obtener el usuario', false);
        console.error('Error:', error);
    }
}

/**
 * Función para limpiar toda la caché
 */
async function clearCache() {
    try {
        const response = await fetch('/clear_cache');
        const data = await response.json();
        
        displayStatus('cache-status', data.status, true);
        
        // Limpiar resultados mostrados
        document.getElementById('operation-result').innerHTML = '';
        document.getElementById('user-result').innerHTML = '';
    } catch (error) {
        displayStatus('cache-status', 'Error al limpiar la caché', false);
        console.error('Error:', error);
    }
}

// Asignar eventos después de cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('run-operation').addEventListener('click', runOperation);
    document.getElementById('get-user').addEventListener('click', getUser);
    document.getElementById('clear-cache').addEventListener('click', clearCache);
});