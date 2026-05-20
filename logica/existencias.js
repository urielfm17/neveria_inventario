let tipoActivo = '';  // '' = Todos, '1'=Helados, '2'=Paletas, '3'=15L

// ── Seleccionar filtro de tipo ────────────────────────────────────────────
function seleccionarFiltro(boton) {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    tipoActivo = boton.dataset.tipo;
    cargarExistencias();
}

// ── Cargar datos desde el backend ────────────────────────────────────────
function cargarExistencias() {
    const buscar = document.getElementById('inputBuscar').value.trim();

    const params = new URLSearchParams();
    if (tipoActivo) params.append('tipo', tipoActivo);
    if (buscar)     params.append('buscar', buscar);

    fetch('../php/existencias.php?' + params.toString())
        .then(r => r.json())
        .then(datos => {
            renderTabla(datos);
        })
        .catch(err => {
            console.error('Error al cargar existencias:', err);
            document.getElementById('tablaExistencias').innerHTML =
                '<tr><td colspan="5" class="cargando">⚠ Error al cargar datos.</td></tr>';
        });
}

// ── Cargar resumen global (siempre sin filtros) ───────────────────────────
function cargarResumen() {
    fetch('../php/existencias.php')
        .then(r => r.json())
        .then(todos => {
            const total   = todos.length;
            const enStock = todos.filter(p => p.existencia >= 5).length;
            const bajo    = todos.filter(p => p.existencia > 0 && p.existencia < 5).length;
            const agotado = todos.filter(p => p.existencia <= 0).length;

            document.getElementById('totalProductos').textContent = total;
            document.getElementById('enStock').textContent        = enStock;
            document.getElementById('stockBajo').textContent      = bajo;
            document.getElementById('sinStock').textContent       = agotado;
        })
        .catch(() => {});
}

// ── Renderizar filas de la tabla ──────────────────────────────────────────
function renderTabla(datos) {
    const tbody     = document.getElementById('tablaExistencias');
    const sinResult = document.getElementById('sinResultados');
    const conteo    = document.getElementById('conteoResultados');

    conteo.textContent = datos.length + ' producto' + (datos.length !== 1 ? 's' : '');

    if (datos.length === 0) {
        tbody.innerHTML = '';
        sinResult.style.display = 'block';
        return;
    }

    sinResult.style.display = 'none';

    tbody.innerHTML = datos.map((p, i) => {
        const tagClase              = p.tipo === 2 ? 'paleta' : p.tipo === 3 ? 'quince' : '';
        const { badgeClase, texto } = getEstado(p.existencia);

        return `
        <tr>
            <td class="num-row">${i + 1}</td>
            <td><strong>${escapar(p.sabor)}</strong></td>
            <td><span class="tag ${tagClase}">${escapar(p.presentacion)}</span></td>
            <td><span class="cant-num">${p.existencia}</span></td>
            <td><span class="badge ${badgeClase}">${texto}</span></td>
        </tr>`;
    }).join('');
}

// ── Estado según cantidad ─────────────────────────────────────────────────
function getEstado(cantidad) {
    if (cantidad <= 0) return { badgeClase: 'agotado', texto: 'Agotado' };
    if (cantidad < 5)  return { badgeClase: 'bajo',    texto: 'Stock Bajo' };
    return                    { badgeClase: 'ok',      texto: 'En Stock' };
}

// ── Escapar HTML ──────────────────────────────────────────────────────────
function escapar(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Iniciar ───────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    cargarResumen();
    cargarExistencias();
});