
const formulario = document.getElementById("formDeportista");
const lista = document.getElementById("listaDeportistas");
const mensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");

// Recuperar deportistas guardados
let deportistas = JSON.parse(
    localStorage.getItem("deportistas")
) || [];

// Mostrar deportistas
function mostrarDeportistas() {

    lista.innerHTML = "";

    deportistas.forEach(deportista => {

        const fila = document.createElement("tr");

        const datos = [
            deportista.nombres,
            deportista.cedula,
            deportista.fecha,
            deportista.peso,
            deportista.sexo,
            deportista.contacto
        ];

        datos.forEach(dato => {
            const celda = document.createElement("td");
            celda.textContent = dato;
            fila.appendChild(celda);
        });

        lista.appendChild(fila);
    });

    contador.textContent =
        `Total de deportistas: ${deportistas.length}`;
}

// Registrar deportista
formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    const nombres = document.getElementById("nombres").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const fecha = document.getElementById("fecha").value;
    const peso = document.getElementById("peso").value;
    const sexo = document.getElementById("sexo").value;
    const contacto = document.getElementById("contacto").value.trim();

    // Validar cédula repetida
    const existe = deportistas.some(
        deportista => deportista.cedula === cedula
    );

    if (existe) {
        mostrarMensaje(
            "Error: Esta cédula ya se encuentra registrada.",
            "error"
        );
        return;
    }

    // Crear nuevo deportista
    const nuevoDeportista = {
        nombres,
        cedula,
        fecha,
        peso,
        sexo,
        contacto
    };

    // Guardar en el arreglo
    deportistas.push(nuevoDeportista);

    // Guardar en localStorage
    localStorage.setItem(
        "deportistas",
        JSON.stringify(deportistas)
    );

    // Actualizar la tabla
    mostrarDeportistas();

    mostrarMensaje(
        "¡Deportista registrado correctamente!",
        "exito"
    );

    formulario.reset();
});

// Mostrar mensajes
function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
}

// Inicializar tabla al abrir la página
mostrarDeportistas();

// Limpiar mensaje al reiniciar formulario
formulario.addEventListener("reset", function() {
    mensaje.textContent = "";
});
