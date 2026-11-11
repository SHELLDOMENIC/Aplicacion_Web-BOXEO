// 1. Almacenamiento de horarios
const CLAVE_ALMACENAMIENTO = "vieja_escuela_horarios";

let horarios = [];

try {
    horarios = JSON.parse(
        localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]"
    );

    if (!Array.isArray(horarios)) {
        horarios = [];
    }

} catch (error) {
    horarios = [];
}

// 2. Referencias a los elementos del documento
const formulario = document.getElementById("formularioHorario");
const formularioContenedor = document.getElementById("formularioContenedor");
const nombreSesion = document.getElementById("nombreSesion");
const fechaSesion = document.getElementById("fechaSesion");
const horaInicio = document.getElementById("horaInicio");
const horaFin = document.getElementById("horaFin");
const grupoSesion = document.getElementById("grupoSesion");

const btnCrearHorario = document.getElementById("btnCrearHorario");
const btnCancelar = document.getElementById("btnCancelar");
const btnGuardar = document.getElementById("btnGuardar");
const tituloFormulario = document.getElementById("tituloFormulario");

const mensajeHorario = document.getElementById("mensajeHorario");
const listaSesiones = document.getElementById("listaSesiones");
const diasCalendario = document.getElementById("diasCalendario");
const mesActual = document.getElementById("mesActual");
const mesAnterior = document.getElementById("mesAnterior");
const mesSiguiente = document.getElementById("mesSiguiente");

// 3. Variables de control de la interfaz
let horarioEditando = null;
let fechaCalendario = new Date();

// Guarda la información actualizada en el almacenamiento del navegador.
function guardarHorarios() {
    localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(horarios)
    );
}

// Muestra el formulario y desplaza la vista hasta él.
function mostrarFormulario() {
    formularioContenedor.style.display = "block";

    formularioContenedor.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

// Restablece los campos y el estado del formulario.
function limpiarFormulario() {
    formulario.reset();

    horarioEditando = null;

    tituloFormulario.textContent = "Nuevo horario";
    btnGuardar.textContent = "Guardar horario";

    mensajeHorario.textContent = "";
    mensajeHorario.classList.remove("error");
}

// Oculta el formulario después de restablecer sus datos.
function cancelarFormulario() {
    limpiarFormulario();
    formularioContenedor.style.display = "none";
}

// Presenta mensajes informativos o de validación al usuario.
function mostrarMensaje(texto, esError = false) {
    mensajeHorario.textContent = texto;
    mensajeHorario.classList.toggle("error", esError);
}

// Convierte una hora en formato HH:MM a minutos.
function convertirMinutos(hora) {
    const partes = hora.split(":");

    const horas = Number(partes[0]);
    const minutos = Number(partes[1]);

    return horas * 60 + minutos;
}

// Comprueba que la fecha y el intervalo horario estén permitidos.
function validarHorario(fecha, inicio, fin) {
    const fechaSeleccionada = new Date(fecha + "T00:00:00");
    const dia = fechaSeleccionada.getDay();

    // Los entrenamientos se permiten únicamente de lunes a viernes.
    if (dia === 0 || dia === 6) {
        return "Solo se permiten entrenamientos de lunes a viernes.";
    }

    const horaInicial = convertirMinutos(inicio);
    const horaFinal = convertirMinutos(fin);

    if (horaFinal <= horaInicial) {
        return "La hora de fin debe ser mayor que la hora de inicio.";
    }

    // Valida los intervalos establecidos para mañana y tarde.
    const horarioManana = horaInicial >= 360 && horaFinal <= 510;
    const horarioTarde = horaInicial >= 1020 && horaFinal <= 1080;

    if (!horarioManana && !horarioTarde) {
        return "Selecciona un horario entre 6:00 AM y 8:30 AM, o entre 5:00 PM y 6:00 PM.";
    }

    return "";
}

// Registra un horario nuevo o actualiza uno existente.
formulario.addEventListener("submit", function(event) {
    event.preventDefault();

    const nombre = nombreSesion.value.trim();
    const fecha = fechaSesion.value;
    const inicio = horaInicio.value;
    const fin = horaFin.value;
    const grupo = grupoSesion.value;

    if (!nombre || !fecha || !inicio || !fin || !grupo) {
        mostrarMensaje("Completa todos los campos.", true);
        return;
    }

    const errorHorario = validarHorario(fecha, inicio, fin);

    if (errorHorario !== "") {
        mostrarMensaje(errorHorario, true);
        return;
    }

    if (horarioEditando !== null) {

        // Localiza el registro seleccionado para modificarlo.
        const posicion = horarios.findIndex(function(horario) {
            return horario.id === horarioEditando;
        });

        if (posicion !== -1) {
            horarios[posicion].nombre = nombre;
            horarios[posicion].fecha = fecha;
            horarios[posicion].inicio = inicio;
            horarios[posicion].fin = fin;
            horarios[posicion].grupo = grupo;
        }

        mostrarMensaje("Horario actualizado correctamente.");

    } else {

        // Construye el objeto que representa el nuevo horario.
        const nuevoHorario = {
            id: Date.now().toString(),
            nombre: nombre,
            fecha: fecha,
            inicio: inicio,
            fin: fin,
            grupo: grupo
        };

        horarios.push(nuevoHorario);
    }

    guardarHorarios();

    mostrarSesiones();
    mostrarCalendario();

    limpiarFormulario();
    formularioContenedor.style.display = "none";

    // Dirige al usuario al calendario después de guardar.
    window.location.hash = "calendario";

    document.getElementById("calendario").scrollIntoView({
        behavior: "smooth"
    });
});

// Renderiza los horarios registrados y ordenados por fecha y hora.
function mostrarSesiones() {
    listaSesiones.innerHTML = "";

    if (horarios.length === 0) {
        const mensajeVacio = document.createElement("p");

        mensajeVacio.className = "sin-sesiones";
        mensajeVacio.textContent = "No hay horarios registrados todavía.";

        listaSesiones.appendChild(mensajeVacio);

        return;
    }

    const horariosOrdenados = [...horarios].sort(function(a, b) {
        return (a.fecha + a.inicio).localeCompare(b.fecha + b.inicio);
    });

    horariosOrdenados.forEach(function(horario) {

        const tarjeta = document.createElement("div");
        tarjeta.className = "sesion-item";

        const informacion = document.createElement("div");
        informacion.className = "sesion-info";

        const titulo = document.createElement("h3");
        titulo.textContent = horario.nombre;

        const fecha = document.createElement("p");
        fecha.textContent = "Fecha: " + formatearFecha(horario.fecha);

        const hora = document.createElement("p");
        hora.textContent = "Hora: " + horario.inicio + " - " + horario.fin;

        const grupo = document.createElement("p");
        grupo.textContent = "Grupo: " + horario.grupo;

        informacion.appendChild(titulo);
        informacion.appendChild(fecha);
        informacion.appendChild(hora);
        informacion.appendChild(grupo);

        const botones = document.createElement("div");
        botones.className = "sesion-botones";

        const btnEditar = document.createElement("button");
        btnEditar.type = "button";
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";
        btnEditar.dataset.id = horario.id;

        const btnEliminar = document.createElement("button");
        btnEliminar.type = "button";
        btnEliminar.className = "btn-eliminar";
        btnEliminar.textContent = "Eliminar";
        btnEliminar.dataset.id = horario.id;

        botones.appendChild(btnEditar);
        botones.appendChild(btnEliminar);

        tarjeta.appendChild(informacion);
        tarjeta.appendChild(botones);

        listaSesiones.appendChild(tarjeta);
    });
}

// Convierte una fecha ISO (AAAA-MM-DD) al formato DD/MM/AAAA.
function formatearFecha(fecha) {
    const partes = fecha.split("-");

    return partes[2] + "/" + partes[1] + "/" + partes[0];
}

// Gestiona las acciones de edición y eliminación desde la lista.
listaSesiones.addEventListener("click", function(event) {
    const id = event.target.dataset.id;

    if (!id) {
        return;
    }

    if (event.target.classList.contains("btn-editar")) {
        editarHorario(id);
    }

    if (event.target.classList.contains("btn-eliminar")) {
        eliminarHorario(id);
    }
});

// Carga los datos del horario seleccionado en el formulario.
function editarHorario(id) {
    const horario = horarios.find(function(item) {
        return item.id === id;
    });

    if (!horario) {
        return;
    }

    horarioEditando = id;

    nombreSesion.value = horario.nombre;
    fechaSesion.value = horario.fecha;
    horaInicio.value = horario.inicio;
    horaFin.value = horario.fin;
    grupoSesion.value = horario.grupo;

    tituloFormulario.textContent = "Editar horario";
    btnGuardar.textContent = "Actualizar horario";

    mensajeHorario.textContent = "";
    mensajeHorario.classList.remove("error");

    mostrarFormulario();
}

// Solicita confirmación y elimina el horario seleccionado.
function eliminarHorario(id) {
    const confirmar = confirm(
        "¿Estás seguro de que deseas eliminar este horario?"
    );

    if (!confirmar) {
        return;
    }

    horarios = horarios.filter(function(horario) {
        return horario.id !== id;
    });

    guardarHorarios();

    if (horarioEditando === id) {
        cancelarFormulario();
    }

    mostrarSesiones();
    mostrarCalendario();

    mostrarMensaje("Horario eliminado correctamente.");
}

// Genera las celdas del calendario y ubica los entrenamientos registrados.
function mostrarCalendario() {
    diasCalendario.innerHTML = "";

    const anio = fechaCalendario.getFullYear();
    const mes = fechaCalendario.getMonth();

    const primerDia = new Date(anio, mes, 1).getDay();

    // Ajusta la posición inicial para que la semana comience el lunes.
    const inicio = (primerDia + 6) % 7;

    const ultimoDia = new Date(anio, mes + 1, 0).getDate();

    const nombreMes = fechaCalendario.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric"
    });

    mesActual.textContent = nombreMes;

    const hoy = new Date();

    for (let i = 0; i < 42; i++) {

        const numeroDia = i - inicio + 1;
        const fechaDia = new Date(anio, mes, numeroDia);

        const dia = document.createElement("div");
        dia.className = "dia-calendario";

        const numero = document.createElement("span");
        numero.className = "numero";
        numero.textContent = fechaDia.getDate();

        if (numeroDia < 1 || numeroDia > ultimoDia) {
            dia.classList.add("otro-mes");
        }

        if (
            fechaDia.getDate() === hoy.getDate() &&
            fechaDia.getMonth() === hoy.getMonth() &&
            fechaDia.getFullYear() === hoy.getFullYear()
        ) {
            dia.classList.add("hoy");
        }

        dia.appendChild(numero);

        const fechaCompleta =
            fechaDia.getFullYear() + "-" +
            String(fechaDia.getMonth() + 1).padStart(2, "0") + "-" +
            String(fechaDia.getDate()).padStart(2, "0");

        horarios.forEach(function(horario) {

            if (horario.fecha === fechaCompleta) {

                const evento = document.createElement("span");

                evento.className = "evento-calendario";
                evento.textContent =
                    horario.nombre + " (" + horario.inicio + ")";

                dia.appendChild(evento);
            }
        });

        diasCalendario.appendChild(dia);
    }
}

// Cambia al mes anterior sin alterar incorrectamente el día del calendario.
mesAnterior.addEventListener("click", function() {
    fechaCalendario = new Date(
        fechaCalendario.getFullYear(),
        fechaCalendario.getMonth() - 1,
        1
    );

    mostrarCalendario();
});

// Cambia al mes siguiente.
mesSiguiente.addEventListener("click", function() {
    fechaCalendario = new Date(
        fechaCalendario.getFullYear(),
        fechaCalendario.getMonth() + 1,
        1
    );

    mostrarCalendario();
});

// Prepara un formulario vacío para registrar un nuevo horario.
btnCrearHorario.addEventListener("click", function() {
    limpiarFormulario();
    mostrarFormulario();
});

// Cancela el registro o la edición actual.
btnCancelar.addEventListener("click", cancelarFormulario);

// Inicializa la interfaz con los datos almacenados.
mostrarSesiones();
mostrarCalendario();