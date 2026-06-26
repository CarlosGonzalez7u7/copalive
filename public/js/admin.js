// Variables globales
let torneoActivoId = null;
let nombreTorneoActivo = "";
let groupAssignments = {}; // Objeto para mantener el estado de los grupos localmente
let hasUnsavedChanges = false; // Se mantiene para comprobaciones rápidas
let unsavedChangeCount = 0; // Contador para la UI

document.addEventListener("DOMContentLoaded", () => {
  cargarSelectorAnos();
  cargarTorneoReciente();

  // ASIGNAR EVENTOS A BOTONES PRINCIPALES (una sola vez)
  const btnAdmin = document.getElementById("btnAdministrarTorneo");
  if (btnAdmin) {
    btnAdmin.addEventListener("click", abrirVistaAdministracion);
  }

  const btnFinalizar = document.getElementById("btnFinalizarAdmin");
  if (btnFinalizar) {
    btnFinalizar.addEventListener("click", cerrarVistaAdministracion);
  }

  const btnCrearEquipo = document.getElementById("btnCrearEquipoModal");
  if (btnCrearEquipo) {
    btnCrearEquipo.addEventListener("click", abrirModalCrearEquipo);
  }

  const btnAnadirGrupo = document.getElementById("btnAnadirGrupo");
  if (btnAnadirGrupo) {
    btnAnadirGrupo.addEventListener("click", anadirNuevoGrupo);
  }

  const btnGuardar = document.getElementById("btnGuardarCambios");
  if (btnGuardar) {
    btnGuardar.addEventListener("click", saveAllChanges);
  }

  const closeModalButton = document.querySelector(".modal .close");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", cerrarModalNuevoTorneo);
  }

  // --- EVENT LISTENER PARA GUARDAR CON F2 ---
  document.addEventListener("keydown", (event) => {
    const vistaAdmin = document.getElementById("vistaAdministracionEquipos");
    if (
      event.key === "F2" &&
      hasUnsavedChanges &&
      vistaAdmin &&
      vistaAdmin.style.display === "block"
    ) {
      event.preventDefault(); // Prevenir el comportamiento por defecto del navegador para F2
      saveAllChanges();
    }
  });

  // --- VISTA PREVIA DE LA IMAGEN EN VIVO ---
  const archivoBanderaInput = document.getElementById("archivoBandera");
  if (archivoBanderaInput) {
    archivoBanderaInput.addEventListener("change", function (event) {
      const file = event.target.files[0];
      const preview = document.getElementById("imgPreview");
      if (file && preview) {
        const reader = new FileReader();
        reader.onload = function (e) {
          preview.src = e.target.result;
          preview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else if (preview) {
        preview.style.display = "none";
        preview.src = "";
      }
    });
  }

  // --- LÓGICA DEL FORMULARIO DE CREAR EQUIPO (URL/FILE TOGGLE) ---
  const radios = document.querySelectorAll('input[name="tipo_bandera"]');
  const inputUrl = document.getElementById("input-url-bandera");
  const inputFile = document.getElementById("input-archivo-bandera");

  function toggleBanderaInputs() {
    if (document.getElementById("tipo_bandera_url").checked) {
      if (inputUrl) inputUrl.style.display = "block";
      if (inputFile) inputFile.style.display = "none";
    } else {
      if (inputUrl) inputUrl.style.display = "none";
      if (inputFile) inputFile.style.display = "block";
    }
  }

  radios.forEach((radio) =>
    radio.addEventListener("change", toggleBanderaInputs),
  );
  toggleBanderaInputs(); // Initial call

  // --- LÓGICA DEL MODAL PARA AÑADIR GRUPO ---
  const modalAnadirGrupo = document.getElementById("modalAnadirGrupo");
  const formAnadirGrupo = document.getElementById("formAnadirGrupo");
  if (formAnadirGrupo && modalAnadirGrupo) {
    formAnadirGrupo.addEventListener("submit", (e) => {
      e.preventDefault();
      const letraInput = document.getElementById("letraNuevoGrupo");
      const letraGrupo = letraInput.value.trim().toUpperCase();

      if (!letraGrupo || !/^[A-Z]$/.test(letraGrupo)) {
        mostrarMensaje(
          "msgGrupo",
          "Introduce una única letra válida (A-Z).",
          "error",
        );
        return;
      }

      if (groupAssignments[letraGrupo] !== undefined) {
        mostrarMensaje(
          "msgGrupo",
          `El grupo ${letraGrupo} ya existe.`,
          "error",
        );
        return;
      }

      groupAssignments[letraGrupo] = [];
      renderGrupos(groupAssignments);
      inicializarArrastre();
      updateUnsavedChanges("increment");

      modalAnadirGrupo.style.display = "none";
      letraInput.value = "";
    });
    modalAnadirGrupo
      .querySelector(".close-btn")
      .addEventListener(
        "click",
        () => (modalAnadirGrupo.style.display = "none"),
      );
  }

  // --- CREAR TORNEO ---
  const formTorneo = document.getElementById("formTorneo");
  if (formTorneo) {
    formTorneo.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nombre = document.getElementById("nombreTorneo").value;
      const datos = {
        nombre: nombre,
        año: document.getElementById("anoTorneo").value,
        tipo: document.getElementById("tipoTorneo").value,
      };

      try {
        const res = await fetch("../api/controladores/admin_torneos.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datos),
        });
        const resultado = await res.json();

        if (resultado.status === "success") {
          torneoActivoId = resultado.id;
          nombreTorneoActivo = nombre;
          mostrarMensaje("msgTorneo", "Torneo creado con éxito.", "success");
          cerrarModalNuevoTorneo();
          cargarTorneoReciente();
        } else {
          mostrarMensaje("msgTorneo", resultado.mensaje, "error");
        }
      } catch (error) {
        mostrarMensaje("msgTorneo", "Error de red.", "error");
      }
    });
  }

  // --- CREAR EQUIPO (SIN ASIGNAR) ---
  const formEquipoExpress = document.getElementById("formEquipoExpress");
  if (formEquipoExpress) {
    formEquipoExpress.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombreEq = document.getElementById("nombreEquipo").value;
      const tipoBanderaEl = document.querySelector(
        'input[name="tipo_bandera"]:checked',
      );
      const tipoBandera = tipoBanderaEl ? tipoBanderaEl.value : null;

      const formData = new FormData();
      formData.append("nombre", nombreEq);

      if (tipoBandera === "archivo") {
        const archivoInput = document.getElementById("archivoBandera");
        if (archivoInput.files.length === 0) {
          return mostrarMensaje(
            "msgEquipo",
            "Debes seleccionar un archivo.",
            "error",
          );
        }
        formData.append("tipo_bandera", "archivo");
        formData.append("archivo", archivoInput.files[0]);
      } else if (tipoBandera === "url") {
        const urlBandera = document.getElementById("urlBandera").value;
        if (!urlBandera) {
          return mostrarMensaje(
            "msgEquipo",
            "Debes ingresar una URL.",
            "error",
          );
        }
        formData.append("tipo_bandera", "url");
        formData.append("url", urlBandera);
      } else {
        return mostrarMensaje(
          "msgEquipo",
          "Debes seleccionar un tipo de bandera.",
          "error",
        );
      }

      try {
        const resEquipo = await fetch(
          "../api/controladores/admin_equipos.php",
          {
            method: "POST",
            body: formData,
          },
        );
        const dataEquipo = await resEquipo.json();

        if (dataEquipo.status === "success") {
          mostrarMensaje(
            "msgEquipo",
            "Equipo creado. Aparecerá en la lista de 'sin asignar'.",
            "success",
          );
          cerrarModalNuevoTorneo();
          // Recargamos los datos para que el nuevo equipo aparezca en la lista
          if (
            document.getElementById("vistaAdministracionEquipos").style
              .display === "block"
          ) {
            cargarDatosAdministracion();
          }
        } else {
          mostrarMensaje("msgEquipo", dataEquipo.mensaje, "error");
        }
      } catch (error) {
        mostrarMensaje("msgEquipo", "Error de conexión", "error");
      }
    });
  }
});

// --- GESTIÓN DE VISTAS Y MODALES ---
function abrirModalNuevoTorneo() {
  const modal = document.getElementById("miModal");
  if (modal) {
    modal.style.display = "block";
    document.getElementById("contenidoCrearTorneo").style.display = "block";
    document.getElementById("contenidoCrearEquipo").style.display = "none";
  }
}

function abrirModalCrearEquipo() {
  const modal = document.getElementById("miModal");
  if (modal) {
    modal.style.display = "block";
    document.getElementById("contenidoCrearTorneo").style.display = "none";
    document.getElementById("contenidoCrearEquipo").style.display = "block";
  }
}

function cerrarModalNuevoTorneo() {
  const modal = document.getElementById("miModal");
  if (modal) {
    modal.style.display = "none";
    document.getElementById("formTorneo").reset();
    document.getElementById("formEquipoExpress").reset();
    const imgPreview = document.getElementById("imgPreview");
    if (imgPreview) imgPreview.style.display = "none";
  }
}

function abrirVistaAdministracion() {
  if (!torneoActivoId) {
    showToast("No hay un torneo activo para administrar.", "error");
    return;
  }

  const vistaAdmin = document.getElementById("vistaAdministracionEquipos");
  if (!vistaAdmin) {
    console.error(
      "Error de Desarrollo: El elemento '#vistaAdministracionEquipos' no se encuentra en esta página. Asegúrate de que el bloque HTML para la administración de equipos esté presente.",
    );
    return;
  }

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    dashboardContainer.style.display = "none";
  }
  vistaAdmin.style.display = "block";

  const tituloAdmin = document.getElementById("tituloTorneoAdmin");
  if (tituloAdmin) {
    tituloAdmin.textContent = `Administrando: ${nombreTorneoActivo}`;
  }

  cargarDatosAdministracion();
}

function cerrarVistaAdministracion() {
  if (
    hasUnsavedChanges &&
    !confirm(
      "Tienes cambios sin guardar. ¿Estás seguro de que quieres cerrar? Los cambios se perderán.",
    )
  ) {
    return; // No cerrar si el usuario cancela
  }

  const dashboardContainer = document.querySelector(".dashboard-container");
  if (dashboardContainer) {
    dashboardContainer.style.display = "block";
  }
  const vistaAdmin = document.getElementById("vistaAdministracionEquipos");
  if (vistaAdmin) {
    vistaAdmin.style.display = "none";
  }
  const formEquipo = document.getElementById("formEquipoExpress");
  if (formEquipo) {
    formEquipo.reset();
  }
  const imgPreview = document.getElementById("imgPreview");
  if (imgPreview) {
    imgPreview.style.display = "none";
  }
  updateUnsavedChanges("reset"); // Reseteamos el contador al cerrar
  cargarTorneoReciente();
}

function updateUnsavedChanges(operation) {
  if (operation === "increment") {
    unsavedChangeCount++;
  } else if (operation === "reset") {
    unsavedChangeCount = 0;
  }

  const btnGuardar = document.getElementById("btnGuardarCambios");
  if (btnGuardar) {
    if (unsavedChangeCount > 0) {
      btnGuardar.style.display = "inline-block";
      btnGuardar.textContent = `Guardar Cambios (${unsavedChangeCount})`;
    } else {
      btnGuardar.style.display = "none";
    }
  }
  hasUnsavedChanges = unsavedChangeCount > 0;
}

function cargarSelectorAnos() {
  const selectAno = document.getElementById("anoTorneo");
  const anoActual = new Date().getFullYear();
  for (let i = anoActual - 2; i <= anoActual + 6; i++) {
    selectAno.innerHTML += `<option value="${i}">${i}</option>`;
    selectAno.innerHTML += `<option value="${i}-${i + 1}">${i}-${i + 1}</option>`;
  }
}

function mostrarMensaje(idElemento, texto, estado) {
  const div = document.getElementById(idElemento);
  div.textContent = texto;
  div.style.display = "block";
  div.className = `mensaje ${estado === "success" ? "exito" : "error"}`;
  setTimeout(() => {
    div.style.display = "none";
  }, 3000);
}

/**
 * Muestra una notificación toast personalizada en la esquina de la pantalla.
 * @param {string} message El mensaje a mostrar.
 * @param {string} type El tipo de toast: 'success', 'error', o 'info'.
 */
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  // Animar la entrada
  setTimeout(() => toast.classList.add("show"), 100);

  // Animar la salida y eliminar el elemento
  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove());
  }, 4000); // La notificación es visible por 4 segundos
}

// --- CARGAR EL TORNEO EN EL DASHBOARD ---
async function cargarTorneoReciente() {
  try {
    const res = await fetch("../api/controladores/admin_inicio.php");
    const data = await res.json();
    if (data.status === "success") {
      torneoActivoId = data.torneo.id;
      nombreTorneoActivo = data.torneo.nombre;
      document.getElementById("tituloTorneoActual").textContent =
        nombreTorneoActivo;
      document.getElementById("detallesTorneoActual").textContent =
        `Temporada ${data.torneo.año} | Modalidad: ${data.torneo.tipo}`;
      document.getElementById("btnAdministrarTorneo").style.display = "block"; // Mostramos el botón
    } else {
      document.getElementById("tituloTorneoActual").textContent =
        "Ningún Torneo Activo";
      document.getElementById("detallesTorneoActual").textContent =
        "Comienza creando uno nuevo.";
      document.getElementById("btnAdministrarTorneo").style.display = "none";
    }

    // Los eventos ahora se asignan en DOMContentLoaded para evitar duplicados
  } catch (error) {
    console.error(error);
  }
}

// --- LÓGICA DE LA VISTA DE ADMINISTRACIÓN (DRAG & DROP) ---

async function cargarDatosAdministracion() {
  updateUnsavedChanges("reset"); // Resetea el contador cada vez que se cargan los datos
  const url = `../api/controladores/admin_vista_grupos.php?torneo_id=${torneoActivoId}`;
  try {
    const res = await fetch(url);
    const resultado = await res.json();

    if (resultado.status === "success") {
      const { equiposSinGrupo, grupos } = resultado.data;
      groupAssignments = { ...grupos, sinAsignar: equiposSinGrupo };
      renderEquiposSinGrupo(groupAssignments.sinAsignar);
      renderGrupos(grupos);
      inicializarArrastre();
    } else {
      showToast(`Error al cargar datos: ${resultado.mensaje}`, "error");
    }
  } catch (error) {
    showToast("Error de red al cargar los datos.", "error");
  }
}

function renderEquiposSinGrupo(equipos) {
  const contenedor = document.getElementById("lista-equipos-sin-grupo");
  contenedor.innerHTML = "";
  equipos.forEach((equipo) => {
    const urlBandera = equipo.bandera_url.startsWith("http")
      ? equipo.bandera_url
      : `../${equipo.bandera_url}`;
    contenedor.innerHTML += `
            <div class="equipo-item" data-id-equipo="${equipo.id}">
                <img src="${urlBandera}" alt="Bandera">
                <span>${equipo.nombre}</span>
            </div>
        `;
  });
}

function renderGrupos(grupos) {
  const contenedor = document.getElementById("contenedor-grupos");
  if (!contenedor) return;
  contenedor.innerHTML = "";
  const gruposExistentes = Object.keys(grupos)
    .filter((g) => g !== "sinAsignar")
    .sort();

  if (gruposExistentes.length === 0) {
    contenedor.innerHTML =
      '<p style="color: #666; text-align: center; grid-column: 1 / -1;">No hay grupos con equipos. Usa el botón "+ Añadir Grupo" para empezar.</p>';
    return; // Importante para no continuar
  }

  gruposExistentes.forEach((letraGrupo) => {
    const equiposDelGrupo = grupos[letraGrupo] || [];
    let equiposHTML = "";
    equiposDelGrupo.forEach((equipo) => {
      const urlBandera = equipo.bandera_url.startsWith("http")
        ? equipo.bandera_url
        : `../${equipo.bandera_url}`;
      equiposHTML += `
                <div class="equipo-item" data-id-equipo="${equipo.id}">
                    <img src="${urlBandera}" alt="Bandera">
                    <span>${equipo.nombre}</span>
                </div>
            `;
    });

    const grupoDiv = document.createElement("div");
    grupoDiv.className = "grupo-contenedor";
    grupoDiv.innerHTML = `
                <h4>Grupo ${letraGrupo}</h4>
                <div class="lista-equipos lista-equipos-en-grupo" data-id-grupo="${letraGrupo}">
                    ${equiposHTML}
                </div>
            `;
    contenedor.appendChild(grupoDiv);
  });
}

function inicializarArrastre() {
  const listaSinGrupo = document.getElementById("lista-equipos-sin-grupo");
  if (!listaSinGrupo) return;
  const listasDeGrupos = document.querySelectorAll(".lista-equipos-en-grupo");

  const opcionesSortable = {
    group: "equipos",
    animation: 150,
    ghostClass: "sortable-ghost",
    onEnd: handleDragEnd,
  };

  new Sortable(listaSinGrupo, opcionesSortable);

  listasDeGrupos.forEach((lista) => {
    new Sortable(lista, opcionesSortable);
  });
}

/**
 * Lógica que se ejecuta al soltar un equipo en una nueva lista.
 * @param {Event} evt - El evento que dispara SortableJS.
 */
async function handleDragEnd(evt) {
  // Esta función ya no hace un fetch, solo actualiza el estado local.
  const equipoId = evt.item.dataset.idEquipo;
  const fromListEl = evt.from;
  const toListEl = evt.to;

  const fromGrupo = fromListEl.dataset.idGrupo || "sinAsignar";
  const toGrupo = toListEl.dataset.idGrupo || "sinAsignar";

  // Busca el equipo movido en nuestro estado local
  const equipoMovido = groupAssignments[fromGrupo]?.find(
    (eq) => eq.id == equipoId,
  );
  if (!equipoMovido) return; // No debería pasar

  // 1. Quitar del grupo de origen
  groupAssignments[fromGrupo] = groupAssignments[fromGrupo].filter(
    (eq) => eq.id != equipoId,
  );
  // 2. Añadir al grupo de destino en la posición correcta
  if (!groupAssignments[toGrupo]) groupAssignments[toGrupo] = [];
  groupAssignments[toGrupo].splice(evt.newDraggableIndex, 0, equipoMovido);

  updateUnsavedChanges("increment");
}

/**
 * Crea un nuevo contenedor de grupo vacío en la interfaz.
 */
function anadirNuevoGrupo() {
  const modal = document.getElementById("modalAnadirGrupo");
  if (modal) {
    modal.style.display = "block";
    document.getElementById("letraNuevoGrupo").focus();
  }
}

async function saveAllChanges() {
  const btnGuardar = document.getElementById("btnGuardarCambios");
  btnGuardar.disabled = true;
  btnGuardar.textContent = "Guardando...";

  // Preparamos los datos para el backend, excluyendo la lista de 'sinAsignar'
  const dataToSend = { ...groupAssignments };
  delete dataToSend.sinAsignar;

  try {
    const res = await fetch("../api/controladores/admin_guardar_grupos.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        torneo_id: torneoActivoId,
        grupos: dataToSend,
      }),
    });
    const resultado = await res.json();
    if (resultado.status === "success") {
      showToast("¡Cambios guardados con éxito!", "success");
      updateUnsavedChanges("reset");
    } else {
      showToast(`Error al guardar: ${resultado.mensaje}`, "error");
    }
  } catch (error) {
    showToast("Error de red al guardar los cambios.", "error");
  } finally {
    btnGuardar.disabled = false;
    btnGuardar.textContent = "Guardar Cambios";
  }
}
