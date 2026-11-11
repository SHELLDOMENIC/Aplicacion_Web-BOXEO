// Lee los deportistas guardados por registro.js (misma clave: "deportistas")
function obtenerDeportistas() {
  try {
    const datos = JSON.parse(localStorage.getItem("deportistas"));
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

const deportistas = obtenerDeportistas();

const inputBuscador = document.getElementById("buscador-deportistas");
const lista = document.getElementById("lista-deportistas");
const mensajeSinResultados = document.getElementById("sin-resultados");
const contador = document.getElementById("contador-deportistas");

// Quita tildes y pasa a minúsculas: "Pére" coincide con "Pérez"
function normalizar(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto ?? "";
  return div.innerHTML;
}

// Resalta la parte que coincide con lo escrito
function resaltar(texto, busqueda) {
  texto = String(texto ?? "");
  const seguro = escaparHTML(texto);
  if (!busqueda) return seguro;

  const textoNorm = normalizar(texto);
  const indice = textoNorm.indexOf(busqueda);
  if (indice === -1 || textoNorm.length !== texto.length) return seguro;

  const antes = escaparHTML(texto.slice(0, indice));
  const medio = escaparHTML(texto.slice(indice, indice + busqueda.length));
  const despues = escaparHTML(texto.slice(indice + busqueda.length));
  return `${antes}<mark>${medio}</mark>${despues}`;
}

function crearTarjeta(deportista, busqueda) {
  const nombre = deportista.nombres || deportista.nombre || "";
  const inicial = nombre.charAt(0).toUpperCase();
  return `
    <div class="caja">
      <div class="avatar">${escaparHTML(inicial)}</div>
      <h3>${resaltar(nombre, busqueda)}</h3>
      <p class="cedula"><i class="fa-solid fa-id-card"></i>${resaltar(
        deportista.cedula,
        busqueda
      )}</p>
      <p class="cedula"><i class="fa-solid fa-phone"></i>${escaparHTML(
        deportista.contacto
      )}</p>
      <span class="categoria">${escaparHTML(deportista.sexo)} · ${escaparHTML(
    deportista.peso
  )} kg</span>
    </div>
  `;
}

function mostrarDeportistas(textoBusqueda = "") {
  const busqueda = normalizar(textoBusqueda);

  const resultados = deportistas.filter(
    (d) =>
      normalizar(d.nombres || d.nombre).includes(busqueda) ||
      normalizar(d.cedula).includes(busqueda)
  );

  if (resultados.length === 0) {
    lista.innerHTML = "";
    lista.hidden = true;
    mensajeSinResultados.hidden = false;
    contador.textContent = "";
    return;
  }

  lista.hidden = false;
  mensajeSinResultados.hidden = true;
  lista.innerHTML = resultados.map((d) => crearTarjeta(d, busqueda)).join("");
  contador.textContent = busqueda
    ? `${resultados.length} resultado(s) encontrado(s)`
    : `${resultados.length} deportista(s) registrado(s)`;
}

// Búsqueda en tiempo real mientras el entrenador escribe
inputBuscador.addEventListener("input", (e) => {
  mostrarDeportistas(e.target.value);
});

// Al abrir la página se muestran todos
mostrarDeportistas();