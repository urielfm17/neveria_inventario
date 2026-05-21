let tipoActivo  = '';
let nivelActivo = '';

// Límites por tipo y nivel (igual que en PHP)
const LIMITES = {
    1: { 1: 10, 2: 20, 3: 30, 4: 40, 5: 50 },
    2: { 1: 15, 2: 25, 3: 40, 4: 55, 5: 70 },
    3: { 1: 2,  2: 4,  3: 6,  4: 8,  5: 10 }
};

function seleccionarFiltro(boton) {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    tipoActivo = boton.dataset.tipo;
    cargarExistencias();
}

function seleccionarNivel(boton) {
    document.querySelectorAll('.btn-nivel').forEach(b => b.classList.remove('activo'));
    boton.classList.add('activo');
    nivelActivo = boton.dataset.nivel;
    cargarExistencias();
}

function cargarExistencias() {
    const buscar = document.getElementById('inputBuscar').value.trim();
    const params = new URLSearchParams();
    if (tipoActivo)  params.append('tipo',   tipoActivo);
    if (buscar)      params.append('buscar', buscar);

    fetch('../php/existencias.php?' + params.toString())
        .then(r => r.json())
        .then(datos => {
            // Filtro de nivel en cliente (más ágil que ir al servidor)
            if (nivelActivo) {
                datos = datos.filter(p => p.nivel_importancia == nivelActivo);
            }
            renderTabla(datos);
        })
        .catch(() => {
            document.getElementById('tablaExistencias').innerHTML =
                '<tr><td colspan="7" class="cargando">⚠ Error al cargar datos.</td></tr>';
        });
}

function cargarResumen() {
    fetch('../php/existencias.php')
        .then(r => r.json())
        .then(todos => {
            document.getElementById('totalProductos').textContent = todos.length;
            document.getElementById('enStock').textContent  = todos.filter(p => p.existencia >= 5).length;
            document.getElementById('stockBajo').textContent = todos.filter(p => p.existencia > 0 && p.existencia < 5).length;
            document.getElementById('sinStock').textContent  = todos.filter(p => p.existencia <= 0).length;
        })
        .catch(() => {});
}

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
        const estrellas             = '★'.repeat(p.nivel_importancia) + '☆'.repeat(5 - p.nivel_importancia);
        const max                   = LIMITES[p.tipo]?.[p.nivel_importancia] ?? '—';

        return `
        <tr>
            <td class="num-row">${i + 1}</td>
            <td><strong>${escapar(p.sabor)}</strong></td>
            <td><span class="tag ${tagClase}">${escapar(p.presentacion)}</span></td>
            <td>
                <span class="nivel-stars nivel-${p.nivel_importancia}" title="Nivel ${p.nivel_importancia}">
                    ${estrellas}
                </span>
                <span class="nivel-num">N${p.nivel_importancia}</span>
            </td>
            <td class="max-col">${max}</td>
            <td><span class="cant-num">${p.existencia}</span></td>
            <td><span class="badge ${badgeClase}">${texto}</span></td>
        </tr>`;
    }).join('');
}

function getEstado(cantidad) {
    if (cantidad <= 0) return { badgeClase: 'agotado', texto: 'Agotado' };
    if (cantidad < 5)  return { badgeClase: 'bajo',    texto: 'Stock Bajo' };
    return                    { badgeClase: 'ok',      texto: 'En Stock' };
}

function escapar(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    cargarResumen();
    cargarExistencias();
});