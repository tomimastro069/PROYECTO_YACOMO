const BACKEND_URL = 'http://localhost:8080'; // tu backend

export async function buscarProductos(termino) {
    try {
        const res = await fetch(`${BACKEND_URL}/api/productos/buscar?termino=${encodeURIComponent(termino)}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (error) {
        console.error('❌ Error en buscarProductos:', error);
        throw error;
    }
}
