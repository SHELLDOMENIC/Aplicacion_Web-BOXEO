document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formDeportista");
  const lista = document.getElementById("listaDeportistas");
  const mensaje = document.getElementById("mensaje");
  const contador = document.getElementById("contador");

  // Recuperar deportistas guardados (misma clave que usa deportistas.js)
  function obtenerDeportistas() {
    try {
      const datos = JSON.parse(localStorage.getItem("deportistas"));
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  let deportistas = obtenerDeportistas();

  function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = "mensaje " + tipo;
  }

  // Dibujar la tabla
  function mostrarDeportistas() {
    lista.innerHTML = "";

    deportistas.forEach((deportista) => {
      const fila = document.createElement("tr");

      [
        deportista.nombres,
        deportista.cedula,
        deportista.fecha,
        deportista.peso,
        deportista.sexo,
        deportista.contacto,
      ].forEach((dato) => {
        const celda = document.createElement("td");
        celda.textContent = dato;
        fila.appendChild(celda);
      });

      lista.appendChild(fila);
    });

    contador.textContent = `Total: ${deportistas.length}`;
  }

  // Registrar deportista
  formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const nombres = document.getElementById("nombres").value.trim();
    const cedula = document.getElementById("cedula").value.trim();
    const fecha = document.getElementById("fecha").value;
    const peso = document.getElementById("peso").value;
    const sexo = document.getElementById("sexo").value;
    const contacto = document.getElementById("contacto").value.trim();

    if (!/^\d{10}$/.test(cedula)) {
      mostrarMensaje("Error: La cédula debe tener 10 dígitos.", "error");
      return;
    }

    if (deportistas.some((d) => d.cedula === cedula)) {
      mostrarMensaje("Error: Esta cédula ya se encuentra registrada.", "error");
      return;
    }

    deportistas.push({ nombres, cedula, fecha, peso, sexo, contacto });
    localStorage.setItem("deportistas", JSON.stringify(deportistas));

    mostrarDeportistas();
    mostrarMensaje("¡Deportista registrado correctamente!", "exito");
    formulario.reset();
  });

  // Limpiar mensaje al reiniciar el formulario
  formulario.addEventListener("reset", () => {
    mensaje.textContent = "";
  });

  // Mostrar la tabla al abrir la página
  mostrarDeportistas();
});