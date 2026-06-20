// app.js — Lógica principal de la aplicación Portal RTM Alpura.
// Aquí se controla: navegación entre pantallas, validación de campos,
// comportamiento dinámico de los selectores y generación de archivos descargables.

document.addEventListener("alpuraDataLoaded", () => {
  // Referencia a cada pantalla de la app (menú principal y cada formulario).
  const views = {
    home: document.getElementById("home-view"),
    individual: document.getElementById("individual-view"),
    sucursal: document.getElementById("sucursal-view"),
    masivo: document.getElementById("masivo-view"),
    cambioFactura: document.getElementById("cambio-factura-view"),
    cambioCanal: document.getElementById("cambio-canal-view"),
    reactivacion: document.getElementById("reactivacion-view")
  };

  // Función de navegación: oculta todas las pantallas y muestra solo la pedida.
  // También sube el scroll hasta arriba para que el usuario empiece desde el tope.
  function switchView(viewName) {
    Object.keys(views).forEach(key => {
      if (key === viewName) {
        if(views[key]) views[key].classList.add("active");
      } else {
        if(views[key]) views[key].classList.remove("active");
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Cada botón del menú principal lleva a su formulario correspondiente.
  document.getElementById("btn-to-individual").addEventListener("click", () => switchView("individual"));
  document.getElementById("btn-to-sucursal").addEventListener("click", () => switchView("sucursal"));
  document.getElementById("btn-to-masivo").addEventListener("click", () => switchView("masivo"));
  if (document.getElementById("btn-to-cambio-factura")) document.getElementById("btn-to-cambio-factura").addEventListener("click", () => switchView("cambioFactura"));
  if (document.getElementById("btn-to-cambio-canal")) document.getElementById("btn-to-cambio-canal").addEventListener("click", () => switchView("cambioCanal"));
  if (document.getElementById("btn-to-reactivacion")) document.getElementById("btn-to-reactivacion").addEventListener("click", () => switchView("reactivacion"));

  // Botón "Volver" del formulario individual: limpia todo antes de regresar al menú.
  document.getElementById("btn-back-1").addEventListener("click", () => {
    if (confirm("¿Desea regresar al menú principal y limpiar el formulario?")) {
      // Limpia el formulario completo (igual que si presionaras "Limpiar Formulario")
      form.reset();
      diasPagoCheckboxes.forEach(chk => chk.checked = false);
      diasPagoTrigger.textContent = "Seleccione días...";
      clearGeoFields();
      updateComercialFields("");
      regimenSelect.disabled = false;
      regimenSelect.classList.remove("locked");
      usoCfdiSelect.disabled = false;
      usoCfdiSelect.classList.remove("locked");
      document.querySelectorAll(".field-group").forEach(g => g.classList.remove("has-error"));
      dateInput.value = formattedDate;
      obsCounter.textContent = "0";
      window.scrollTo({ top: 0, behavior: "smooth" });
      const nombreInput = document.getElementById("nombre-social");
      if (nombreInput) nombreInput.focus();
      switchView("home");
    }
  });


  // Pone la fecha de hoy en el campo de fecha del formulario. El usuario no puede editarla.
  const dateInput = document.getElementById("fecha");
  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  dateInput.value = formattedDate;

  // Los catálogos (CEDIS, canales, CP, etc.) ya fueron cargados por mockData.js.
  // Aquí los usamos para llenar los selectores al iniciar.
  const data = window.ALPURA_MOCK_DATA;

  function initSelect(id, list) {
    const select = document.getElementById(id);
    // Vacía las opciones anteriores y pone la opción por defecto antes de llenar.
    select.innerHTML = '<option value="">Seleccione...</option>';
    list.forEach(item => {
      const option = document.createElement("option");
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  }

  // Llena cada selector del formulario individual con su lista de opciones.
  initSelect("tipo-cliente", data.tiposCliente);
  initSelect("forma-pago", data.formasPago);
  initSelect("tipo-factura", data.tiposFactura);
  initSelect("grupo-concentrador", data.gruposConcentradores);
  initSelect("zona-cobranza", data.zonasCobranza);
  initSelect("responsable-cobranza", data.responsablesCobranza);
  initSelect("cedis-asignado", Object.keys(data.cedis));
  initSelect("tipo-entrega", data.tiposEntrega);
  initSelect("regional-responsable", data.regionalesResponsables);
  initSelect("zona-nielsen", data.zonasNielsen);
  initSelect("clasificacion-interna", data.clasificacionesInternas);
  initSelect("segmentacion-mercado", data.segmentacionesMercado);
  initSelect("tipo-cuenta", data.tiposCuenta);
  initSelect("canal-venta", Object.keys(data.canalesVenta));

  // Llena el selector de Régimen Fiscal con todas las claves disponibles.
  initSelect("regimen-fiscal", Object.keys(data.regimenesFiscales));

  // Llena los selectores de las pantallas de Cambio de Factura, Cambio de Canal y Reactivación.
  if (document.getElementById("cf-forma-pago")) initSelect("cf-forma-pago", data.formasPago);
  if (document.getElementById("cf-regimen-fiscal")) initSelect("cf-regimen-fiscal", Object.keys(data.regimenesFiscales));
  if (document.getElementById("cc-canal-actual")) initSelect("cc-canal-actual", Object.keys(data.canalesVenta));
  if (document.getElementById("cc-canal-nuevo")) initSelect("cc-canal-nuevo", Object.keys(data.canalesVenta));
  if (document.getElementById("rc-cedis-global")) initSelect("rc-cedis-global", Object.keys(data.cedis));

  // Selector de días de pago: funciona como un menú con casillas de verificación (checkboxes).
  // Al hacer clic en el botón, se muestra/oculta el menú con los días de la semana.
  const diasPagoTrigger = document.getElementById("dias-pago-trigger");
  const diasPagoDropdown = document.getElementById("dias-pago-dropdown");

  diasPagoTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    diasPagoDropdown.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".custom-multiselect")) {
      diasPagoDropdown.classList.remove("active");
    }
  });

  const diasPagoCheckboxes = diasPagoDropdown.querySelectorAll("input[type='checkbox']");
  diasPagoCheckboxes.forEach(chk => {
    chk.addEventListener("change", () => {
      const selected = [];
      diasPagoCheckboxes.forEach(c => {
        if (c.checked) selected.push(c.value);
      });
      diasPagoTrigger.textContent = selected.length > 0 ? selected.join(", ") : "Seleccione días...";
    });
  });


  // Validación en tiempo real: cada vez que el usuario escribe, se limpian y
  // reformatean los datos automáticamente (mayúsculas, sin acentos, solo caracteres permitidos).

  // Quita los acentos de un texto (ej. "á" → "a"). Necesario porque los sistemas SAP
  // no aceptan caracteres acentuados.
  function removeAccents(str) {
    const map = {
      'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U',
      'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
      'ü': 'u', 'Ü': 'U'
    };
    return str.replace(/[áéíóúüÁÉÍÓÚÜ]/g, match => map[match] || match);
  }

  // Bloquea la acción de pegar (Ctrl+V) en todos los campos excepto el área de carga masiva.
  // Esto es una política RTM para asegurar que los datos se capturen y revisen manualmente.
  document.querySelectorAll("input, textarea, select").forEach(element => {
    // El área de carga masiva sí permite pegar datos desde Excel.
    if (element.id === "pasteAreaMasivo") return;

    element.addEventListener("paste", (e) => {
      e.preventDefault();
      alert("Por seguridad y políticas de captura RTM, no se permite pegar información. Ingrese los datos manualmente.");
    });
  });

  // Calcula la distancia en kilómetros entre dos pares de coordenadas (latitud/longitud).
  // Usa la fórmula de Haversine, que tiene en cuenta la curvatura de la Tierra.
  const calcularDistanciaKm = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radio de la Tierra en km
    const toRad = deg => deg * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const validarGeoDistanciaEnTiempoReal = (latInput, lonInput, cpInput) => {
    if (!latInput || !lonInput || !cpInput) return;

    const groupLat = latInput.closest(".field-group");
    const groupLon = lonInput.closest(".field-group");
    if (groupLat) {
      groupLat.classList.remove("has-error");
      const err = groupLat.querySelector(".error-msg");
      if (err && err.textContent.includes("Distancia")) err.textContent = "Requerido. Formato numérico ##.######";
    }
    if (groupLon) {
      groupLon.classList.remove("has-error");
      const err = groupLon.querySelector(".error-msg");
      if (err && err.textContent.includes("Distancia")) err.textContent = "Requerido. Formato numérico con signo negativo.";
    }

    const latVal = latInput.value.trim();
    const lonVal = lonInput.value.trim();
    const cpVal = cpInput.value.trim();

    if (!latVal || !lonVal || !cpVal || !data.codigosPostales[cpVal]) return;

    let formatoValido = true;
    if (!/^\d{2}\.\d{6}$/.test(latVal)) formatoValido = false;
    if (!/^-\d{2}\.\d{6}$/.test(lonVal) && !/^-\d{3}\.\d{5}$/.test(lonVal)) formatoValido = false;

    if (!formatoValido) return;

    const ref = data.codigosPostales[cpVal];
    if (ref.latitud && ref.longitud && !isNaN(parseFloat(latVal)) && !isNaN(parseFloat(lonVal))) {
      const distancia = calcularDistanciaKm(parseFloat(latVal), parseFloat(lonVal), parseFloat(ref.latitud), parseFloat(ref.longitud));
      const zona = (ref.zona || "URBANA").toUpperCase();
      const umbral = zona === "RURAL" ? 10 : 5;

      if (distancia > umbral) {
        if (groupLat) {
          groupLat.classList.add("has-error");
          const err = groupLat.querySelector(".error-msg");
          if (err) err.textContent = `Distancia: ${distancia.toFixed(2)} km supera umbral de ${umbral} km para zona ${zona}.`;
        }
        if (groupLon) {
          groupLon.classList.add("has-error");
          const err = groupLon.querySelector(".error-msg");
          if (err) err.textContent = `Distancia: ${distancia.toFixed(2)} km supera umbral de ${umbral} km para zona ${zona}.`;
        }
      }
    }
  };

  // Se aplican los filtros de caracteres a todos los campos de texto de los formularios.
  // También borra el borde rojo de error cuando el usuario empieza a corregir un campo.
  const inputs = document.querySelectorAll("#individual-client-form input, #individual-client-form textarea, #cambio-factura-form input, #cambio-canal-form input, #reactivacion-form input");

  inputs.forEach(input => {
    if (input.id === "fecha") return; // El campo de fecha lo llena la app, no el usuario.

    input.addEventListener("input", (e) => {
      let val = input.value;

      val = removeAccents(val); // Elimina acentos primero

      if (input.type === "email") {
        // Email: solo permite minúsculas y caracteres válidos para direcciones de correo
        val = val.toLowerCase().replace(/[^a-z0-9@._\-+]/g, "");
      } else {
        // Cualquier otro campo de texto: convierte todo a mayúsculas
        val = val.toUpperCase();

        if (input.id === "numero" || input.name === "rc-numero") {
          // Campo Número de calle: permite letras, números y "/" para "S/N"
          val = val.replace(/[^A-Z0-9 Ñ\/]/g, "");
        } else if (input.id === "latitud" || input.id === "longitud" || input.name === "rc-lat" || input.name === "rc-lon") {
          // Latitud y Longitud: solo se permiten números, punto decimal y signo menos
          val = val.replace(/[^0-9.\-]/g, "");
        } else if (input.id === "codigo-postal" || input.id === "rep-telefono" || input.id === "fac-telefono" || input.id === "com-telefono" || input.id === "cf-fac-telefono" || input.name === "rc-cp" || input.id === "limite-credito") {
          // Teléfonos, CP y Límite de Crédito: solo se permiten números (y punto para el crédito)
          if (input.id === "limite-credito") {
            val = val.replace(/[^0-9.]/g, "");
          } else {
            val = val.replace(/[^0-9]/g, "");
          }
        } else {
          // Para cualquier otro campo: solo letras A-Z, números, Ñ y espacios.
          val = val.replace(/[^A-Z0-9 Ñ]/g, "");
        }
      }

      input.value = val; // Guarda el valor ya limpio en el campo

      // Quita el borde rojo del campo mientras el usuario va escribiendo.
      const group = input.closest(".field-group");
      if (group) group.classList.remove("has-error");
    });
  });

  // Contador de caracteres en observaciones
  const obsTextArea = document.getElementById("observaciones");
  const obsCounter = document.getElementById("observaciones-count");
  obsTextArea.addEventListener("input", () => {
    obsCounter.textContent = obsTextArea.value.length;
  });


  // Cuando el usuario escribe un Código Postal de 5 dígitos, busca automáticamente
  // el estado, municipio y colonias disponibles en el catálogo SEPOMEX.
  // Si el CP no existe, marca el campo en rojo.
  const cpInput = document.getElementById("codigo-postal");
  const coloniaSelect = document.getElementById("colonia");
  const estadoInput = document.getElementById("estado");
  const municipioInput = document.getElementById("municipio");

  cpInput.addEventListener("input", () => {
    const cp = cpInput.value;
      if (cp.length === 5) {
        const dbCp = data.codigosPostales[cp];
        if (dbCp) {
          // CP encontrado en el catálogo: carga estado, municipio y colonias
        estadoInput.value = dbCp.estado;
        municipioInput.value = dbCp.municipio;

          // Llena el selector de colonias con las opciones de ese CP
        coloniaSelect.innerHTML = '<option value="">Seleccione Colonia...</option>';
        dbCp.colonias.forEach(col => {
          const opt = document.createElement("option");
          opt.value = col;
          opt.textContent = col;
          coloniaSelect.appendChild(opt);
        });

        cpInput.closest(".field-group").classList.remove("has-error");
        validarGeoDistanciaEnTiempoReal(document.getElementById("latitud"), document.getElementById("longitud"), cpInput);
        } else {
          // CP no encontrado en el catálogo: borra los campos y marca error
        clearGeoFields();
        cpInput.closest(".field-group").classList.add("has-error");
      }
    } else {
      clearGeoFields();
    }
  });

  function clearGeoFields() {
    estadoInput.value = "";
    municipioInput.value = "";
    coloniaSelect.innerHTML = '<option value="">Seleccione un C.P. primero</option>';
  }


  // Cuando el usuario termina de escribir (sale del campo), formatea automáticamente
  // la latitud y longitud con el número correcto de decimales.
  // Latitud: siempre 6 decimales (ej. 19.421897)
  // Longitud: 6 decimales si tiene 2 enteros, 5 si tiene 3 enteros (ej. -99.167539 o -100.12345)
  const latInput = document.getElementById("latitud");
  const lonInput = document.getElementById("longitud");

  latInput.addEventListener("blur", () => {
    let val = latInput.value.trim();
    if (!val) return;

    // Elimina cualquier carácter que no sea número, punto o signo menos
    val = val.replace(/[^0-9.-]/g, "");

    // Separa la parte entera de los decimales para procesarlos por separado
    const parts = val.split(".");
    let integerPart = parts[0] || "0";
    let decimalPart = parts[1] || "";

    // Completa con ceros hasta tener exactamente 6 decimales
    decimalPart = (decimalPart + "000000").substring(0, 6);
    latInput.value = `${integerPart}.${decimalPart}`;
    validarGeoDistanciaEnTiempoReal(latInput, document.getElementById("longitud"), document.getElementById("codigo-postal"));
  });

  lonInput.addEventListener("blur", () => {
    let val = lonInput.value.trim();
    if (!val) return;

    // Asegura que la longitud tenga signo negativo (en México siempre es negativa)
    let isNegative = val.startsWith("-");
    let cleaned = val.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");
    let integerPart = parts[0] || "0";
    let decimalPart = parts[1] || "";

    let forcedDecimals = 6;
    if (integerPart.length === 2) {
      forcedDecimals = 6;
    } else if (integerPart.length === 3) {
      forcedDecimals = 5;
    }

    // Rellena con ceros hasta el número correcto de decimales
    const padding = "0".repeat(forcedDecimals);
    decimalPart = (decimalPart + padding).substring(0, forcedDecimals);

    lonInput.value = `-${integerPart}.${decimalPart}`;
    validarGeoDistanciaEnTiempoReal(document.getElementById("latitud"), lonInput, document.getElementById("codigo-postal"));
  });


  // Cuando el usuario selecciona un CEDIS, la app busca sus datos en el catálogo
  // y llena automáticamente: Plaza, Tipo de Entrega, Regional Responsable y Zona Nielsen.
  // Para la mayoría de los CEDIS estos campos quedan bloqueados (no editables).
  const cedisSelect = document.getElementById("cedis-asignado");
  const plazaSelect = document.getElementById("plaza-distribucion");
  const rutaSelect = document.getElementById("ruta");
  const tipoEntregaSelect = document.getElementById("tipo-entrega");
  const regionalResponsableSelect = document.getElementById("regional-responsable");
  const zonaNielsenSelect = document.getElementById("zona-nielsen");

  cedisSelect.addEventListener("change", () => {
    const cedisVal = cedisSelect.value;

    // Primero borra los valores anteriores para empezar limpio
    plazaSelect.innerHTML = '<option value="">Seleccione Plaza...</option>';
    rutaSelect.innerHTML = '<option value="">Seleccione Ruta...</option>';
    plazaSelect.disabled = false;
    plazaSelect.classList.remove("locked");
    if (tipoEntregaSelect) {
      tipoEntregaSelect.value = "";
      tipoEntregaSelect.disabled = false;
      tipoEntregaSelect.classList.remove("locked");
    }
    if (regionalResponsableSelect) {
      regionalResponsableSelect.value = "";
      regionalResponsableSelect.disabled = false;
      regionalResponsableSelect.classList.remove("locked");
    }
    if (zonaNielsenSelect) {
      zonaNielsenSelect.value = "";
      zonaNielsenSelect.disabled = false;
      zonaNielsenSelect.classList.remove("locked");
    }

    if (cedisVal && data.cedis[cedisVal]) {
      const mapping = data.cedis[cedisVal];

      if (cedisVal !== "ANDEN PLANTA" && cedisVal !== "DISTRIBUIDORES") {
          // Para la mayoría de CEDIS: la plaza se asigna sola y queda bloqueada
        plazaSelect.innerHTML = '';
        mapping.plazas.forEach(plaza => {
          const opt = document.createElement("option");
          opt.value = plaza;
          opt.textContent = plaza;
          plazaSelect.appendChild(opt);
        });
        if (mapping.plazas.length > 0) {
          plazaSelect.value = mapping.plazas[0];
          plazaSelect.disabled = true;
          plazaSelect.classList.add("locked");
        }
      } else {
          // ANDEN PLANTA y DISTRIBUIDORES permiten elegir plaza manualmente
        mapping.plazas.forEach(plaza => {
          const opt = document.createElement("option");
          opt.value = plaza;
          opt.textContent = plaza;
          plazaSelect.appendChild(opt);
        });
      }

      // Llena el selector de rutas con las disponibles para ese CEDIS
      mapping.rutas.forEach(ruta => {
        const opt = document.createElement("option");
        opt.value = ruta;
        opt.textContent = ruta;
        rutaSelect.appendChild(opt);
      });

      // Si el CEDIS tiene Tipo de Entrega, Regional y Zona Nielsen definidos,
      // los asigna automáticamente y los bloquea para que no se cambien.
      if (mapping.tipoEntrega && tipoEntregaSelect) {
        tipoEntregaSelect.value = mapping.tipoEntrega;
        tipoEntregaSelect.disabled = true;
        tipoEntregaSelect.classList.add("locked");
      }
      if (mapping.regionalResponsable && regionalResponsableSelect) {
        regionalResponsableSelect.value = mapping.regionalResponsable;
        regionalResponsableSelect.disabled = true;
        regionalResponsableSelect.classList.add("locked");
      }
      if (mapping.zonaNielsen && zonaNielsenSelect) {
        zonaNielsenSelect.value = mapping.zonaNielsen;
        zonaNielsenSelect.disabled = true;
        zonaNielsenSelect.classList.add("locked");
      }
    }
  });


  // Cuando el usuario selecciona un Canal de Venta, la app busca sus datos
  // y llena automáticamente: Macrocanal, Canal IBP, Giro, Subcanal, Agrupaciones.
  const canalVentaSelect = document.getElementById("canal-venta");
  const macroInput = document.getElementById("macrocanal");
  const canalIbpInput = document.getElementById("canal-venta-ibp");
  const giroSelect = document.getElementById("giro");
  const agrupacionSelect = document.getElementById("agrupacion-clientes");
  const subcanalSelect = document.getElementById("subcanal");
  const agrupacionIbpSelect = document.getElementById("agrupacion-ibp");

  function updateComercialFields(canalVal) {
    // Borra los campos dependientes antes de cargar los nuevos valores
    macroInput.value = "";
    canalIbpInput.value = "";
    if (giroSelect) giroSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (agrupacionSelect) agrupacionSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (subcanalSelect) subcanalSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (agrupacionIbpSelect) agrupacionIbpSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';

    if (canalVal && data.canalesVenta && data.canalesVenta[canalVal]) {
      const channelData = data.canalesVenta[canalVal];

      // Macrocanal y Canal IBP se asignan solos y quedan bloqueados
      macroInput.value = channelData.macrocanal || "";
      canalIbpInput.value = channelData.canalIbp || "";

      // Llena el selector de Giros con las opciones del canal
      const girosList = Array.isArray(channelData.giros) ? channelData.giros : (channelData.giros ? [channelData.giros] : []);
      if (giroSelect && girosList.length > 0) {
        giroSelect.innerHTML = '<option value="">Seleccione...</option>';
        girosList.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          giroSelect.appendChild(opt);
        });
      }

      // Llena el selector de Agrupación de Clientes
      const agrupacionesList = Array.isArray(channelData.agrupaciones) ? channelData.agrupaciones : (channelData.agrupaciones ? [channelData.agrupaciones] : []);
      if (agrupacionSelect && agrupacionesList.length > 0) {
        agrupacionSelect.innerHTML = '<option value="">Seleccione...</option>';
        agrupacionesList.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          agrupacionSelect.appendChild(opt);
        });
      }

      // Llena el selector de Subcanal (antes llamado "Grupo Comercial" en versiones anteriores)
      const subcanalesList = Array.isArray(channelData.subcanales) ? channelData.subcanales : (channelData.subcanales ? [channelData.subcanales] : (Array.isArray(channelData.gruposComerciales) ? channelData.gruposComerciales : []));
      if (subcanalSelect && subcanalesList.length > 0) {
        subcanalSelect.innerHTML = '<option value="">Seleccione...</option>';
        subcanalesList.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          subcanalSelect.appendChild(opt);
        });
      }

      // Llena el selector de Agrupación IBP
      const agrupacionesIbpList = Array.isArray(channelData.agrupacionesIbp) ? channelData.agrupacionesIbp : (channelData.agrupacionesIbp ? [channelData.agrupacionesIbp] : []);
      if (agrupacionIbpSelect && agrupacionesIbpList.length > 0) {
        agrupacionIbpSelect.innerHTML = '<option value="">Seleccione...</option>';
        agrupacionesIbpList.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          agrupacionIbpSelect.appendChild(opt);
        });
      }
    }
  }

  if (canalVentaSelect) {
    canalVentaSelect.addEventListener("change", () => {
      updateComercialFields(canalVentaSelect.value);
    });
  }

  // Lo mismo que la función anterior pero para el formulario de Cambio de Canal.
  // Al elegir el canal nuevo, rellena los campos de la nueva estructura comercial.
  const ccCanalNuevoSelect = document.getElementById("cc-canal-nuevo");
  function updateComercialFieldsCambioCanal(canalVal) {
    const macroInput = document.getElementById("cc-macrocanal");
    const canalIbpInput = document.getElementById("cc-canal-ibp");
    const giroSelect = document.getElementById("cc-giro");
    const agrupacionSelect = document.getElementById("cc-agrupacion");
    const subcanalSelect = document.getElementById("cc-subcanal");
    const agrupacionIbpSelect = document.getElementById("cc-agrupacion-ibp");

    macroInput.value = "";
    canalIbpInput.value = "";
    if (giroSelect) giroSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (agrupacionSelect) agrupacionSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (subcanalSelect) subcanalSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';
    if (agrupacionIbpSelect) agrupacionIbpSelect.innerHTML = '<option value="">Seleccione Canal primero...</option>';

    if (canalVal && data.canalesVenta && data.canalesVenta[canalVal]) {
      const channelData = data.canalesVenta[canalVal];

      macroInput.value = channelData.macrocanal || "";
      canalIbpInput.value = channelData.canalIbp || "";

      const girosList = Array.isArray(channelData.giros) ? channelData.giros : (channelData.giros ? [channelData.giros] : []);
      if (giroSelect && girosList.length > 0) {
        giroSelect.innerHTML = '<option value="">Seleccione...</option>';
        girosList.forEach(item => {
          const opt = document.createElement("option"); opt.value = item; opt.textContent = item; giroSelect.appendChild(opt);
        });
      }

      const agrupacionesList = Array.isArray(channelData.agrupaciones) ? channelData.agrupaciones : (channelData.agrupaciones ? [channelData.agrupaciones] : []);
      if (agrupacionSelect && agrupacionesList.length > 0) {
        agrupacionSelect.innerHTML = '<option value="">Seleccione...</option>';
        agrupacionesList.forEach(item => {
          const opt = document.createElement("option"); opt.value = item; opt.textContent = item; agrupacionSelect.appendChild(opt);
        });
      }

      const subcanalesList = Array.isArray(channelData.subcanales) ? channelData.subcanales : (channelData.subcanales ? [channelData.subcanales] : (Array.isArray(channelData.gruposComerciales) ? channelData.gruposComerciales : []));
      if (subcanalSelect && subcanalesList.length > 0) {
        subcanalSelect.innerHTML = '<option value="">Seleccione...</option>';
        subcanalesList.forEach(item => {
          const opt = document.createElement("option"); opt.value = item; opt.textContent = item; subcanalSelect.appendChild(opt);
        });
      }

      const agrupacionesIbpList = Array.isArray(channelData.agrupacionesIbp) ? channelData.agrupacionesIbp : (channelData.agrupacionesIbp ? [channelData.agrupacionesIbp] : []);
      if (agrupacionIbpSelect && agrupacionesIbpList.length > 0) {
        agrupacionIbpSelect.innerHTML = '<option value="">Seleccione...</option>';
        agrupacionesIbpList.forEach(item => {
          const opt = document.createElement("option"); opt.value = item; opt.textContent = item; agrupacionIbpSelect.appendChild(opt);
        });
      }
    }
  }

  if (ccCanalNuevoSelect) {
    ccCanalNuevoSelect.addEventListener("change", () => {
      updateComercialFieldsCambioCanal(ccCanalNuevoSelect.value);
    });
  }


  // Maneja los cambios en el campo Tipo de Factura:
  // - GLOBAL: bloquea RFC (usa el genérico), Régimen y CFDI con valores fijos.
  // - INDIVIDUAL o CONCENTRADA: habilita esos campos para captura manual.
  const tipoFacturaSelect = document.getElementById("tipo-factura");
  const rfcInput = document.getElementById("rfc");
  const regimenSelect = document.getElementById("regimen-fiscal");
  const usoCfdiSelect = document.getElementById("uso-cfdi");

  // Cuando el usuario cambia el tipo de factura se ajustan los campos fiscales
  tipoFacturaSelect.addEventListener("change", () => {
    const tipoVal = tipoFacturaSelect.value;
    const lblReq = document.querySelector(".lbl-factura-req");

    if (lblReq) {
      lblReq.style.display = (tipoVal === "INDIVIDUAL") ? "inline" : "none";
    }

    if (tipoVal === "GLOBAL") {
      // GLOBAL: RFC genérico automático, Régimen y CFDI bloqueados con valor fijo
      regimenSelect.value = "616 - SIN OBLIGACIONES FISCALES";
      regimenSelect.disabled = true;
      regimenSelect.classList.add("locked");

      // RFC genérico para facturas globales (estándar del SAT)
      usoCfdiSelect.innerHTML = '<option value="S01 - SIN EFECTOS FISCALES">S01 - SIN EFECTOS FISCALES</option>';
      usoCfdiSelect.value = "S01 - SIN EFECTOS FISCALES";
      usoCfdiSelect.disabled = true;
      usoCfdiSelect.classList.add("locked");

      // RFC genérico para clientes con factura global, requerido por el SAT
      rfcInput.value = "XAXX010101000";
      rfcInput.readOnly = true;
      rfcInput.classList.add("locked");
    } else {
      // INDIVIDUAL o CONCENTRADA: habilita todos los campos para que el usuario los llene
      regimenSelect.disabled = false;
      regimenSelect.classList.remove("locked");
      regimenSelect.value = "";

      usoCfdiSelect.disabled = false;
      usoCfdiSelect.classList.remove("locked");
      usoCfdiSelect.innerHTML = '<option value="">Seleccione Régimen primero...</option>';

      if (rfcInput.value === "XAXX010101000") {
        rfcInput.value = "";
      }
      rfcInput.readOnly = false;
      rfcInput.classList.remove("locked");
    }
  });

  // Cuando el usuario elige un Régimen Fiscal, se cargan solo los Usos de CFDI
  // que son válidos para ese régimen (no todos los usos aplican a todos los regímenes).
  regimenSelect.addEventListener("change", () => {
    const regimenVal = regimenSelect.value;
    usoCfdiSelect.innerHTML = '<option value="">Seleccione...</option>';

    if (regimenVal && data.regimenesFiscales[regimenVal]) {
      const usos = data.regimenesFiscales[regimenVal];
      usos.forEach(uso => {
        const opt = document.createElement("option");
        opt.value = uso;
        opt.textContent = uso;
        usoCfdiSelect.appendChild(opt);
      });
    }
  });

  // Lo mismo pero para el formulario de Cambio a Factura Individual,
  // que tiene sus propios selectores de Régimen y Uso de CFDI.
  const cfRegimenSelect = document.getElementById("cf-regimen-fiscal");
  const cfUsoCfdiSelect = document.getElementById("cf-uso-cfdi");
  if (cfRegimenSelect && cfUsoCfdiSelect) {
    cfRegimenSelect.addEventListener("change", () => {
      const regimenVal = cfRegimenSelect.value;
      cfUsoCfdiSelect.innerHTML = '<option value="">Seleccione...</option>';
      if (regimenVal && data.regimenesFiscales[regimenVal]) {
        data.regimenesFiscales[regimenVal].forEach(uso => {
          const opt = document.createElement("option");
          opt.value = uso;
          opt.textContent = uso;
          cfUsoCfdiSelect.appendChild(opt);
        });
      }
    });
  }


  // Función principal de validación del formulario de Alta Individual.
  // Revisa todos los campos requeridos, formatos y reglas de negocio.
  // Devuelve si el formulario es válido y la lista de campos con error.
  function validateForm() {
    let isValid = true;
    const errors = [];

    // Borra todos los bordes rojos anteriores para empezar la validación limpio
    document.querySelectorAll(".field-group, .field-group-inline").forEach(g => g.classList.remove("has-error"));

    // Marca un campo en rojo y registra su ID en la lista de errores
    function setError(inputId, message = "") {
      const input = document.getElementById(inputId);
      const group = input.closest(".field-group") || input.closest(".field-group-inline");
      if (group) {
        group.classList.add("has-error");
        if (message) {
          const errSpan = group.querySelector(".error-msg");
          if (errSpan) errSpan.textContent = message;
        }
      }
      isValid = false;
      errors.push(inputId);
    }

    // Lista de campos que SIEMPRE son obligatorios en el formulario individual
    const requiredIds = [
      "nombre-social", "nombre-comercial", "calle", "numero",
      "codigo-postal", "colonia",
      "tipo-cliente", "forma-pago", "tipo-factura",
      "cedis-asignado", "plaza-distribucion",
      "canal-venta", "giro", "tipo-cuenta", "agrupacion-clientes",
      "subcanal", "tipo-entrega", "regional-responsable",
      "zona-nielsen", "clasificacion-interna", "segmentacion-mercado",
      "agrupacion-ibp", "solicito"
    ];

    // Los canales OTROS y EXPORTACION no requieren coordenadas geográficas
    const canalVentaVal = document.getElementById("canal-venta").value.trim().toUpperCase();
    if (canalVentaVal !== "OTROS" && canalVentaVal !== "EXPORTACION") {
      requiredIds.push("latitud", "longitud");
    }

    requiredIds.forEach(id => {
      const input = document.getElementById(id);
      if (!input || !input.value.trim()) {
        setError(id, "Este campo es obligatorio.");
      }
    });

    // Si el tipo de factura es INDIVIDUAL, también son obligatorios RFC, Régimen, CFDI y contacto de facturación
    if (tipoFacturaSelect.value === "INDIVIDUAL") {
      if (!rfcInput.value.trim()) setError("rfc", "El RFC es obligatorio para facturación individual.");
      if (!regimenSelect.value) setError("regimen-fiscal", "El Régimen Fiscal es obligatorio.");
      if (!usoCfdiSelect.value) setError("uso-cfdi", "El Uso de CFDI es obligatorio.");

      // Requerir Nombre y Correo para "ENVIO DE FACTURAS"
      const facNombre = document.getElementById("fac-nombre");
      const facEmail = document.getElementById("fac-email");
      if (!facNombre.value.trim()) setError("fac-nombre", "Requerido para INDIVIDUAL.");
      if (!facEmail.value.trim()) setError("fac-email", "Requerido para INDIVIDUAL.");
    }

    // El CP debe tener exactamente 5 dígitos y existir en el catálogo SEPOMEX
    const cpVal = cpInput.value.trim();
    if (cpVal && (!/^\d{5}$/.test(cpVal) || !data.codigosPostales[cpVal])) {
      setError("codigo-postal", "El código postal debe tener 5 dígitos y existir en el catálogo.");
    }

    // Los teléfonos deben tener exactamente 10 dígitos numéricos
    const telIds = ["rep-telefono", "fac-telefono", "com-telefono"];
    telIds.forEach(id => {
      const val = document.getElementById(id).value.trim();
      // Si el teléfono es opcional y está vacío, se permite. Si tiene algo, debe ser válido.
      const isReq = document.getElementById(id).hasAttribute("required");
      if (val) {
        if (!/^\d{10}$/.test(val)) {
          setError(id, "El teléfono debe contener exactamente 10 dígitos numéricos.");
        }
      } else if (isReq) {
        setError(id, "Este teléfono es obligatorio.");
      }
    });

    // Los correos electrónicos deben tener formato válido (usuario@dominio.ext)
    const emailIds = ["rep-email", "fac-email", "com-email"];
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    emailIds.forEach(id => {
      const val = document.getElementById(id).value.trim();
      const isReq = document.getElementById(id).hasAttribute("required");
      if (val) {
        if (!emailRegex.test(val)) {
          setError(id, "La estructura del correo electrónico es inválida.");
        }
      } else if (isReq) {
        setError(id, "El correo electrónico es obligatorio.");
      }
    });

    // El RFC debe tener la estructura del SAT: 3-4 letras + 6 números + 3 alfanuméricos
    const rfcVal = rfcInput.value.trim();
    if (rfcVal) {
      const rfcRegex = /^[A-ZÑ]{3,4}\d{6}[A-Z0-9]{3}$/;
      if (!rfcRegex.test(rfcVal)) {
        setError("rfc", "El RFC debe tener 12 o 13 caracteres estructurados: 3-4 letras, 6 números y homoclave.");
      }
    }

    // Latitud: debe ser ##.###### (exactamente 2 enteros y 6 decimales)
    const latVal = latInput.value.trim();
    if (latVal) {
      const latRegex = /^\d{2}\.\d{6}$/;
      if (!latRegex.test(latVal)) {
        setError("latitud", "El formato debe ser ##.###### (exactamente 6 decimales).");
      }
    }

    // Longitud: puede ser -##.###### (2 enteros) o -###.##### (3 enteros)
    const lonVal = lonInput.value.trim();
    if (lonVal) {
      const lonRegex2 = /^-\d{2}\.\d{6}$/;
      const lonRegex3 = /^-\d{3}\.\d{5}$/;
      if (!lonRegex2.test(lonVal) && !lonRegex3.test(lonVal)) {
        setError("longitud", "El formato debe ser -##.###### (6 dec.) o -###.##### (5 dec.).");
      }
    }

    // Valida que las coordenadas estén cerca del Código Postal declarado.
    // Si la distancia supera el umbral (5 km urbano / 10 km rural), se avisa al usuario.
    const cpValGeo = cpInput.value.trim();
    if (latVal && lonVal && cpValGeo && data.codigosPostales[cpValGeo]) {
      const ref = data.codigosPostales[cpValGeo];
      if (ref.latitud && ref.longitud && !isNaN(parseFloat(latVal)) && !isNaN(parseFloat(lonVal))) {
        const distancia = calcularDistanciaKm(parseFloat(latVal), parseFloat(lonVal), parseFloat(ref.latitud), parseFloat(ref.longitud));
        const zona = (ref.zona || "URBANA").toUpperCase();
        const umbral = zona === "RURAL" ? 10 : 5;
        if (distancia > umbral) {
          setError("latitud", `Distancia: ${distancia.toFixed(2)} km supera umbral de ${umbral} km para zona ${zona}.`);
          setError("longitud", `Distancia: ${distancia.toFixed(2)} km supera umbral de ${umbral} km para zona ${zona}.`);
        }
      }
    }

    // El límite de crédito no puede ser un número negativo
    const limCredInput = document.getElementById("limite-credito");
    if (limCredInput.value && parseFloat(limCredInput.value) < 0) {
      setError("limite-credito", "El límite de crédito no puede ser negativo.");
    }

    return { isValid, errors };
  }


  // Cuando el usuario presiona "Descargar Solicitud", se valida el formulario.
  // Si hay errores, se muestran en rojo. Si todo está bien, se genera el HTML.
  const form = document.getElementById("individual-client-form");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const { isValid, errors } = validateForm();

    if (!isValid) {
      // Caso especial: si el único error es la distancia de geolocalización,
      // se puede confirmar y continuar de todas formas (no bloquea la descarga)
      const isOnlyGeoDistance = errors.every(e => e === "latitud" || e === "longitud") &&
        errors.length > 0 &&
        document.getElementById("latitud").closest(".field-group").querySelector(".error-msg").textContent.includes("Distancia");

      const firstErrorElement = document.getElementById(errors[0]);
      const doScroll = () => {
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => firstErrorElement.focus(), 500);
        }
      };

      if (isOnlyGeoDistance) {
        if (!confirm("Advertencia: La distancia de la geolocalización supera el umbral permitido. ¿Desea continuar exportando el formulario?")) {
          doScroll();
          return;
        }
      } else {
        doScroll();
        alert("Por favor corrija los campos marcados en rojo antes de generar la solicitud.");
        return;
      }
    }


    // Clona el formulario visible, guarda los valores de los campos
    // y bloquea todos los inputs para que el archivo descargado no sea editable.
    const originalContainer = document.querySelector("#individual-view .form-container");
    const containerClone = originalContainer.cloneNode(true);

    // Copia los valores actuales al clon (el clon no los tiene por ser una copia estructural)
    const originalInputs = originalContainer.querySelectorAll("input, select, textarea");
    const clonedInputs = containerClone.querySelectorAll("input, select, textarea");

    for (let i = 0; i < originalInputs.length; i++) {
      const orig = originalInputs[i];
      const clone = clonedInputs[i];

      if (orig.tagName === "SELECT") {
        const selectedIndex = orig.selectedIndex;
        if (selectedIndex >= 0) {
          clone.options[selectedIndex].setAttribute("selected", "selected");
        }
      } else if (orig.type === "checkbox" || orig.type === "radio") {
        if (orig.checked) clone.setAttribute("checked", "checked");
      } else if (orig.tagName === "TEXTAREA") {
        clone.textContent = orig.value;
      } else {
        clone.setAttribute("value", orig.value);
      }

      // Deshabilita el campo para que no se pueda editar en el archivo descargado
      clone.setAttribute("disabled", "disabled");
      clone.setAttribute("readonly", "readonly");
      // Borra cualquier borde rojo de error que pudiera haberse copiado
      const parentGroup = clone.closest(".field-group") || clone.closest(".field-group-inline");
      if (parentGroup) parentGroup.classList.remove("has-error");
    }

    // Oculta los botones de acción en el archivo descargado (no deben aparecer en el formato final)
    const actionsBar = containerClone.querySelector(".form-actions-bar");
    if (actionsBar) actionsBar.style.display = "none";

    const backBtn = containerClone.querySelector(".btn-back");
    if (backBtn) backBtn.style.display = "none";

    const commercialName = document.getElementById("nombre-comercial").value.trim().replace(/[^A-Z0-9]/g, "_");
    const filename = `Solicitud_RTM_Alta_${commercialName}_${dateInput.value.replace(/\//g, "-")}.html`;

    // Intenta cargar el CSS para incrustarlo dentro del HTML.
    // Así el archivo descargado mantiene el mismo diseño visual aunque no esté conectado.
    fetch('styles.css')
      .then(res => res.text())
      .then(cssContent => {
        generateHtmlDownload(cssContent, containerClone.outerHTML);
      })
      .catch(err => {
        generateHtmlDownload('', containerClone.outerHTML, true);
      });

    function generateHtmlDownload(inlineCss, contentHtml, useFallback = false) {
      const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Solicitud RTM - ${commercialName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  ${useFallback ? '<link rel="stylesheet" href="styles.css">' : `<style>${inlineCss}</style>`}
  <style>
    body { 
      background-color: #f1f5f9; 
      display: flex; 
      justify-content: center; 
      padding: 30px; 
      margin: 0; 
      font-family: 'Inter', sans-serif;
    }
    .form-container { width: 100%; max-width: 1100px; }
    
    /* Los campos deshabilitados por defecto se ven grises en el navegador.
       Esto los hace ver legibles como si fueran texto normal. */
    input:disabled, select:disabled, textarea:disabled {
      background-color: #f8fafc !important;
      color: #1a202c !important;
      border-color: #cbd5e1 !important;
      -webkit-text-fill-color: #1a202c !important;
      opacity: 1 !important;
      cursor: default !important;
    }
    
    .multiselect-trigger {
      pointer-events: none;
      background-color: #f8fafc !important;
      color: #1a202c !important;
    }
    
    .multiselect-trigger::after { display: none; }

    @media print {
      body { background-color: white; padding: 0; }
      .form-container { box-shadow: none; border-top: 8px solid #084475; padding: 0; }
    }
  </style>
</head>
<body>
  ${contentHtml}
  <script>
  // Script que se ejecuta al abrir el archivo HTML descargado: muestra el diálogo de impresión.
    window.onload = function() {
      setTimeout(function() { window.print(); }, 500);
    };
  </script>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      alert("Su solicitud se ha descargado en formato HTML.");

      // Después de descargar, limpia todo el formulario para dejarlo listo para la siguiente captura
      form.reset();
      diasPagoCheckboxes.forEach(chk => chk.checked = false);
      diasPagoTrigger.textContent = "Seleccione días...";
      clearGeoFields();
      updateComercialFields("");
      regimenSelect.disabled = false;
      regimenSelect.classList.remove("locked");
      usoCfdiSelect.disabled = false;
      usoCfdiSelect.classList.remove("locked");
      document.querySelectorAll(".field-group").forEach(g => g.classList.remove("has-error"));
      dateInput.value = formattedDate;
      obsCounter.textContent = "0";

      // Manda el foco al primer campo del formulario para facilitar la siguiente captura
      window.scrollTo({ top: 0, behavior: "smooth" });
      const nombreInput = document.getElementById("nombre-social");
      if (nombreInput) nombreInput.focus();

      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  });


  // Botón "Limpiar Formulario": pide confirmación y borra todos los datos capturados.
  // También restablece los campos dependientes (geo, comercial, fiscal) a su estado inicial.
  document.getElementById("btn-clear-form").addEventListener("click", () => {
    if (confirm("¿Está seguro de que desea limpiar todos los datos del formulario?")) {
      form.reset();

      // Desmarca todas las casillas de verificación de días de pago
      diasPagoCheckboxes.forEach(chk => chk.checked = false);
      diasPagoTrigger.textContent = "Seleccione días...";

      // Borra estado, municipio y colonias del selector de CP
      clearGeoFields();
      updateComercialFields("");

      // Reinicia los selectores de Plaza y Ruta que dependen del CEDIS seleccionado
      plazaSelect.innerHTML = '<option value="">Seleccione CEDIS primero...</option>';
      rutaSelect.innerHTML = '<option value="">Seleccione Ruta...</option>';

      // Si el tipo de factura era GLOBAL, los campos fiscales quedaron bloqueados.
      // Los habilitamos de nuevo para que el formulario esté listo.
      regimenSelect.disabled = false;
      regimenSelect.classList.remove("locked");
      usoCfdiSelect.disabled = false;
      usoCfdiSelect.classList.remove("locked");

      // Quita todos los bordes rojos de error que pudieran quedar visibles
      document.querySelectorAll(".field-group").forEach(g => g.classList.remove("has-error"));

      // Restaura la fecha a la fecha de hoy y reinicia el contador de caracteres
      dateInput.value = formattedDate;
      obsCounter.textContent = "0";

      // Scroll to top and focus on first field
      window.scrollTo({ top: 0, behavior: "smooth" });
      const nombreInput = document.getElementById("nombre-social");
      if (nombreInput) nombreInput.focus();

      alert("Formulario limpio.");
    }
  });

  // Botón "Regresar al Menú": pide confirmación y lleva al menú principal limpiando el formulario.
  document.getElementById("btn-back-menu").addEventListener("click", () => {
    if (confirm("¿Desea regresar al menú principal y limpiar el formulario?")) {
      // Limpia todo antes de navegar (misma lógica que "Limpiar Formulario")
      form.reset();
      diasPagoCheckboxes.forEach(chk => chk.checked = false);
      diasPagoTrigger.textContent = "Seleccione días...";
      clearGeoFields();
      updateComercialFields("");
      regimenSelect.disabled = false;
      regimenSelect.classList.remove("locked");
      usoCfdiSelect.disabled = false;
      usoCfdiSelect.classList.remove("locked");
      document.querySelectorAll(".field-group").forEach(g => g.classList.remove("has-error"));
      dateInput.value = formattedDate;
      obsCounter.textContent = "0";

      // Navegar al menú principal
      switchView("home");
    }
  });



  // Lógica del formulario de Alta con Sucursales.
  // Permite registrar múltiples puntos de entrega bajo un mismo cliente.
  const sucursalForm = document.getElementById("sucursal-form");
  const sucursalesContainer = document.getElementById("sucursales-container");
  const btnAddSucursal = document.getElementById("btn-add-sucursal");
  const btnGenerateSucursal = document.getElementById("btn-generate-sucursal");
  const numClienteInput = document.getElementById("suc-num-cliente");
  const razonSocialInput = document.getElementById("suc-razon-social");

  if (numClienteInput && razonSocialInput) {
    // Validación del número de cliente en tiempo real (5 o 6 dígitos)
    numClienteInput.addEventListener("input", (e) => {
      let val = e.target.value.replace(/[^0-9]/g, "");
      if (val.length > 6) val = val.substring(0, 6);
      e.target.value = val;
      const group = e.target.closest(".field-group");
      if (val.length === 5 || val.length === 6) {
        group.classList.remove("has-error");
      } else {
        group.classList.add("has-error");
      }
    });

    razonSocialInput.addEventListener("input", (e) => {
      let val = removeAccents(e.target.value).toUpperCase();
      val = val.replace(/[^A-Z0-9 Ñ]/g, "");
      e.target.value = val;
    });

    // Inicializa los selectores y eventos de un bloque de sucursal.
    // Se llama tanto para el primer bloque como para cada bloque nuevo que se agrega.
    function initSucursalBlock(block) {
      // Obtiene referencias a todos los selectores del bloque
      const selectCedis = block.querySelector(".select-cedis");
      const selectPlaza = block.querySelector(".select-plaza");
      const selectZona = block.querySelector(".select-zona");
      const selectEntrega = block.querySelector(".select-entrega");
      const selectRegional = block.querySelector(".select-regional");
      const selectClasif = block.querySelector(".select-clasif");
      const selectSegmentacion = block.querySelector(".select-segmentacion");

      function populate(select, list) {
        if (!select) return;
        select.innerHTML = '<option value="">Seleccione...</option>';
        list.forEach(item => {
          const opt = document.createElement("option");
          opt.value = item;
          opt.textContent = item;
          select.appendChild(opt);
        });
      }

      if (data.cedis) populate(selectCedis, Object.keys(data.cedis));
      if (data.zonasNielsen) populate(selectZona, data.zonasNielsen);
      if (data.tiposEntrega) populate(selectEntrega, data.tiposEntrega);
      if (data.regionalesResponsables) populate(selectRegional, data.regionalesResponsables);
      if (data.clasificacionesInternas) populate(selectClasif, data.clasificacionesInternas);
      if (data.segmentacionesMercado) populate(selectSegmentacion, data.segmentacionesMercado);

      // Al cambiar el CEDIS del bloque, actualiza la plaza y datos logísticos
      if (selectCedis && selectPlaza) {
        selectCedis.addEventListener("change", () => {
          const cedisVal = selectCedis.value;
          selectPlaza.innerHTML = '<option value="">Seleccione Plaza...</option>';
          selectPlaza.disabled = false;
          selectPlaza.classList.remove("locked");

          if (selectEntrega) {
            selectEntrega.value = "";
            selectEntrega.disabled = false;
            selectEntrega.classList.remove("locked");
          }
          if (selectRegional) {
            selectRegional.value = "";
            selectRegional.disabled = false;
            selectRegional.classList.remove("locked");
          }
          if (selectZona) {
            selectZona.value = "";
            selectZona.disabled = false;
            selectZona.classList.remove("locked");
          }

          if (cedisVal && data.cedis && data.cedis[cedisVal]) {
            const mapping = data.cedis[cedisVal];
            // Para la mayoría de CEDIS: plaza única asignada automáticamente y bloqueada
            if (cedisVal !== "ANDEN PLANTA" && cedisVal !== "DISTRIBUIDORES") {
              selectPlaza.innerHTML = '';
              mapping.plazas.forEach(plaza => {
                const opt = document.createElement("option");
                opt.value = plaza;
                opt.textContent = plaza;
                selectPlaza.appendChild(opt);
              });
              if (mapping.plazas.length > 0) {
                selectPlaza.value = mapping.plazas[0];
                selectPlaza.disabled = true;
                selectPlaza.classList.add("locked");
              }
            } else {
              mapping.plazas.forEach(plaza => {
                const opt = document.createElement("option");
                opt.value = plaza;
                opt.textContent = plaza;
                selectPlaza.appendChild(opt);
              });
            }

            if (mapping.tipoEntrega && selectEntrega) {
              selectEntrega.value = mapping.tipoEntrega;
              selectEntrega.disabled = true;
              selectEntrega.classList.add("locked");
            }
            if (mapping.regionalResponsable && selectRegional) {
              selectRegional.value = mapping.regionalResponsable;
              selectRegional.disabled = true;
              selectRegional.classList.add("locked");
            }
            if (mapping.zonaNielsen && selectZona) {
              selectZona.value = mapping.zonaNielsen;
              selectZona.disabled = true;
              selectZona.classList.add("locked");
            }
          }
        });
      }

      // Limpia el valor de cada campo del bloque mientras el usuario escribe.
      // Aplica las mismas reglas de caracteres que el formulario individual.
      block.querySelectorAll("input").forEach(input => {
        input.addEventListener("input", (e) => {
          let val = e.target.value;
          const name = e.target.name;

          val = removeAccents(val).toUpperCase();

          if (name === "sucursal-numero") {
            val = val.replace(/[^A-Z0-9 Ñ\/]/g, "");
          } else if (name === "sucursal-latitud" || name === "sucursal-longitud") {
            val = val.replace(/[^0-9.\-]/g, "");
          } else if (name === "sucursal-codigo-postal" || name === "sucursal-retek" || name === "sucursal-gln") {
            val = val.replace(/[^0-9]/g, "");
          } else {
            val = val.replace(/[^A-Z0-9 Ñ]/g, "");
          }

          e.target.value = val;
          const group = e.target.closest(".field-group");
          if (group) group.classList.remove("has-error");
        });
      });

      // Formatea latitud y longitud al salir del campo, igual que en el formulario individual.
      const latInput = block.querySelector("input[name='sucursal-latitud']");
      const lonInput = block.querySelector("input[name='sucursal-longitud']");

      if (latInput) {
        latInput.addEventListener("blur", () => {
          let val = latInput.value.trim();
          if (!val) return;
          val = val.replace(/[^0-9.-]/g, "");
          const parts = val.split(".");
          let integerPart = parts[0] || "0";
          let decimalPart = parts[1] || "";
          decimalPart = (decimalPart + "000000").substring(0, 6);
          latInput.value = `${integerPart}.${decimalPart}`;
          validarGeoDistanciaEnTiempoReal(latInput, block.querySelector("input[name='sucursal-longitud']"), block.querySelector("input[name='sucursal-codigo-postal']"));
        });
      }

      if (lonInput) {
        lonInput.addEventListener("blur", () => {
          let val = lonInput.value.trim();
          if (!val) return;
          let isNegative = val.startsWith("-");
          let cleaned = val.replace(/[^0-9.]/g, "");
          const parts = cleaned.split(".");
          let integerPart = parts[0] || "0";
          let decimalPart = parts[1] || "";
          let forcedDecimals = 6;
          if (integerPart.length === 2) forcedDecimals = 6;
          else if (integerPart.length === 3) forcedDecimals = 5;
          const padding = "0".repeat(forcedDecimals);
          decimalPart = (decimalPart + padding).substring(0, forcedDecimals);
          lonInput.value = `-${integerPart}.${decimalPart}`;
          validarGeoDistanciaEnTiempoReal(block.querySelector("input[name='sucursal-latitud']"), lonInput, block.querySelector("input[name='sucursal-codigo-postal']"));
        });
      }

      // Lógica de Código Postal para el bloque de sucursal:
      // al escribir 5 dígitos, carga estado, municipio y colonias automáticamente.
      const cpInput = block.querySelector("input[name='sucursal-codigo-postal']");
      const coloniaSelect = block.querySelector("select[name='sucursal-colonia']");
      const estadoInput = block.querySelector("input[name='sucursal-estado']");
      const municipioInput = block.querySelector("input[name='sucursal-municipio']");

      if (cpInput && coloniaSelect && estadoInput && municipioInput) {
        cpInput.addEventListener("input", () => {
          const cp = cpInput.value;
          if (cp.length === 5) {
            const dbCp = data.codigosPostales && data.codigosPostales[cp];
            if (dbCp) {
              estadoInput.value = dbCp.estado;
              municipioInput.value = dbCp.municipio;
              coloniaSelect.innerHTML = '<option value="">Seleccione Colonia...</option>';
              dbCp.colonias.forEach(col => {
                const opt = document.createElement("option");
                opt.value = col;
                opt.textContent = col;
                coloniaSelect.appendChild(opt);
              });
              cpInput.closest(".field-group").classList.remove("has-error");
              validarGeoDistanciaEnTiempoReal(block.querySelector("input[name='sucursal-latitud']"), block.querySelector("input[name='sucursal-longitud']"), cpInput);
            } else {
              clearGeoBlock();
              cpInput.closest(".field-group").classList.add("has-error");
            }
          } else {
            clearGeoBlock();
          }
        });

        function clearGeoBlock() {
          estadoInput.value = "";
          municipioInput.value = "";
          coloniaSelect.innerHTML = '<option value="">Seleccione un C.P. primero</option>';
        }
      }
    }

    // El primer bloque ya está en el HTML; lo inicializamos aquí al arrancar.
    const firstBlock = document.querySelector(".sucursal-block");
    if (firstBlock) initSucursalBlock(firstBlock);

    // Valida todos los campos de un bloque de sucursal antes de agregar otro o descargar.
    function validateBlock(block) {
      let isValid = true;
      block.querySelectorAll(".field-group").forEach(g => g.classList.remove("has-error"));

      const requiredNames = [
        "sucursal-calle", "sucursal-numero", "sucursal-codigo-postal", "sucursal-colonia",
        "sucursal-nombre", "sucursal-cedis",
        "sucursal-plaza", "sucursal-zona-nielsen", "sucursal-tipo-entrega",
        "sucursal-regional", "sucursal-clasif", "sucursal-segmentacion"
      ];

      const canalVentaVal = document.getElementById("canal-venta").value.trim().toUpperCase();
      if (canalVentaVal !== "OTROS" && canalVentaVal !== "EXPORTACION") {
        requiredNames.push("sucursal-latitud", "sucursal-longitud");
      }

      requiredNames.forEach(name => {
        const input = block.querySelector(`[name='${name}']`);
        if (input && !input.value.trim()) {
          const group = input.closest(".field-group");
          if (group) group.classList.add("has-error");
          isValid = false;
        }
      });

      // Validar formato CP, Lat, Lon si tienen valor
      const cpInput = block.querySelector("input[name='sucursal-codigo-postal']");
      if (cpInput) {
        const cpVal = cpInput.value.trim();
        if (cpVal && (!/^\d{5}$/.test(cpVal) || !data.codigosPostales[cpVal])) {
          cpInput.closest(".field-group").classList.add("has-error");
          isValid = false;
        }
      }

      const latInput = block.querySelector("input[name='sucursal-latitud']");
      let latVal = "";
      let lonVal = "";
      if (latInput) {
        latVal = latInput.value.trim();
        if (latVal && !/^\d{2}\.\d{6}$/.test(latVal)) {
          latInput.closest(".field-group").classList.add("has-error");
          isValid = false;
        }
      }

      const lonInput = block.querySelector("input[name='sucursal-longitud']");
      if (lonInput) {
        lonVal = lonInput.value.trim();
        if (lonVal) {
          if (!/^-\d{2}\.\d{6}$/.test(lonVal) && !/^-\d{3}\.\d{5}$/.test(lonVal)) {
            lonInput.closest(".field-group").classList.add("has-error");
            isValid = false;
          }
        }
      }

      // Validar Distancia Geográfica (Sucursal)
      if (latVal && lonVal && cpInput) {
        const cpValGeo = cpInput.value.trim();
        if (cpValGeo && data.codigosPostales[cpValGeo]) {
          const ref = data.codigosPostales[cpValGeo];
          if (ref.latitud && ref.longitud && !isNaN(parseFloat(latVal)) && !isNaN(parseFloat(lonVal))) {
            const distancia = calcularDistanciaKm(parseFloat(latVal), parseFloat(lonVal), parseFloat(ref.latitud), parseFloat(ref.longitud));
            const zona = (ref.zona || "URBANA").toUpperCase();
            const umbral = zona === "RURAL" ? 10 : 5;
            if (distancia > umbral) {
              latInput.closest(".field-group").classList.add("has-error");
              lonInput.closest(".field-group").classList.add("has-error");
              const msg = `Distancia: ${distancia.toFixed(2)} km supera umbral de ${umbral} km para zona ${zona}.`;
              const errLat = latInput.closest(".field-group").querySelector(".error-msg");
              if (errLat) errLat.textContent = msg;
              const errLon = lonInput.closest(".field-group").querySelector(".error-msg");
              if (errLon) errLon.textContent = msg;
              isValid = false;
            }
          }
        }
      }

      return isValid;
    }

    // Botón "Agregar Sucursal": valida el bloque actual y, si es correcto, duplica
    // el bloque HTML creando una nueva sucursal limpia al final del formulario.
    if (btnAddSucursal) {
      btnAddSucursal.addEventListener("click", () => {
        // Verifica que el número de cliente tenga 5 o 6 dígitos antes de agregar
        const numCliente = numClienteInput.value.trim();
        if (numCliente.length !== 5 && numCliente.length !== 6) {
          numClienteInput.closest(".field-group").classList.add("has-error");
          alert("El NUM. CLIENTE debe tener 5 o 6 dígitos numéricos.");
          return;
        }

        // Valida todos los bloques de sucursal que ya existen antes de agregar uno nuevo
        const blocks = document.querySelectorAll(".sucursal-block");
        let allValid = true;
        let onlyGeoErrors = true;
        blocks.forEach(block => {
          if (!validateBlock(block)) {
            allValid = false;
            block.querySelectorAll(".field-group.has-error").forEach(group => {
              const err = group.querySelector(".error-msg");
              const input = group.querySelector("input");
              if (!input || (input.name !== "sucursal-latitud" && input.name !== "sucursal-longitud")) {
                onlyGeoErrors = false;
              } else if (err && !err.textContent.includes("Distancia")) {
                onlyGeoErrors = false;
              }
            });
          }
        });

        if (!allValid) {
          if (onlyGeoErrors) {
            if (!confirm("Advertencia: La distancia de la geolocalización supera el umbral permitido. ¿Desea continuar agregando otra sucursal?")) {
              return;
            }
          } else {
            alert("Complete y corrija los campos requeridos en las sucursales existentes antes de agregar otra.");
            return;
          }
        }

        if (confirm("¿Desea agregar una nueva sucursal?")) {
          const newIndex = blocks.length + 1;
          const firstBlock = document.querySelector(".sucursal-block");
          const newBlock = firstBlock.cloneNode(true);

          newBlock.setAttribute("data-index", newIndex);
          newBlock.querySelector(".sucursal-number").textContent = newIndex;

          // Limpia todos los valores del nuevo bloque para empezar en blanco
          newBlock.querySelectorAll("input, select").forEach(input => {
            input.value = "";
            if (input.name === "sucursal-colonia") input.innerHTML = '<option value="">Registre un C.P. primero</option>';
            if (input.name === "sucursal-plaza") input.innerHTML = '<option value="">Seleccione...</option>';
            if (input.name === "sucursal-unidad-facturacion") input.value = "PIEZAS";

            input.closest(".field-group").classList.remove("has-error");
            input.disabled = false;
            input.classList.remove("locked");
            if (input.name.includes("estado") || input.name.includes("municipio")) {
              input.setAttribute("readonly", "readonly");
              input.classList.add("locked");
            }
          });

          sucursalesContainer.appendChild(newBlock);
          initSucursalBlock(newBlock);
          newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }

    // Botón "Limpiar / Eliminar": Si hay más de una sucursal, borra la última. 
    // Si solo hay una, limpia todos sus campos y la cabecera.
    const btnClearSucursal = document.getElementById("btn-clear-sucursal");
    if (btnClearSucursal) {
      btnClearSucursal.addEventListener("click", () => {
        const blocks = document.querySelectorAll(".sucursal-block");
        if (blocks.length > 1) {
          if (confirm("¿Está seguro de que desea eliminar la última sucursal agregada?")) {
            blocks[blocks.length - 1].remove();
            // Desplazar a la nueva última sucursal
            const newLastBlock = document.querySelectorAll(".sucursal-block")[blocks.length - 2];
            if (newLastBlock) newLastBlock.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        } else {
          if (confirm("¿Está seguro de que desea limpiar todos los datos de la sucursal y la cabecera?")) {
            const firstBlock = blocks[0];
            if (firstBlock) {
              firstBlock.querySelectorAll("input").forEach(input => {
                input.value = "";
                const grp = input.closest(".field-group");
                if (grp) grp.classList.remove("has-error");
              });
              firstBlock.querySelectorAll("select").forEach(select => {
                if (select.name === "sucursal-colonia") select.innerHTML = '<option value="">Registre un C.P. primero</option>';
                else if (select.name === "sucursal-plaza") { select.innerHTML = '<option value="">Seleccione...</option>'; select.disabled = false; select.classList.remove("locked"); }
                else if (select.name === "sucursal-unidad-facturacion") select.value = "PIEZAS";
                else select.value = "";
                const grp = select.closest(".field-group");
                if (grp) grp.classList.remove("has-error");
              });
            }
            if (numClienteInput) {
              numClienteInput.value = "";
              const grp = numClienteInput.closest(".field-group");
              if (grp) grp.classList.remove("has-error");
            }
            if (razonSocialInput) razonSocialInput.value = "";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      });
    }

    // Botón "Descargar Solicitud" de Sucursales: valida todos los bloques y
    // genera el HTML descargable con todos los datos de todas las sucursales.
    if (btnGenerateSucursal) {
      btnGenerateSucursal.addEventListener("click", () => {
        // Verifica número de cliente antes de descargar
        const numCliente = numClienteInput.value.trim();
        if (numCliente.length !== 5 && numCliente.length !== 6) {
          numClienteInput.closest(".field-group").classList.add("has-error");
          alert("El NUM. CLIENTE debe tener 5 o 6 dígitos numéricos.");
          return;
        }

        const blocks = document.querySelectorAll(".sucursal-block");
        let allValid = true;
        let onlyGeoErrors = true;

        blocks.forEach(block => {
          if (!validateBlock(block)) {
            allValid = false;
            block.querySelectorAll(".field-group.has-error").forEach(group => {
              const err = group.querySelector(".error-msg");
              const input = group.querySelector("input");
              if (!input || (input.name !== "sucursal-latitud" && input.name !== "sucursal-longitud")) {
                onlyGeoErrors = false;
              } else if (err && !err.textContent.includes("Distancia")) {
                onlyGeoErrors = false;
              }
            });
          }
        });

        if (!allValid) {
          if (onlyGeoErrors) {
            if (!confirm("Advertencia: La distancia de la geolocalización supera el umbral permitido en una o más sucursales. ¿Desea continuar exportando el formulario?")) {
              return;
            }
          } else {
            alert("Por favor corrija los campos marcados en rojo antes de generar la solicitud.");
            return;
          }
        }

        // Clona el formulario de sucursales, congela los valores y genera el HTML
        const originalContainer = document.querySelector("#sucursal-view .form-container");
        const containerClone = originalContainer.cloneNode(true);

        // Copia los valores al clon y bloquea todos los campos
        const originalInputs = originalContainer.querySelectorAll("input, select, textarea");
        const clonedInputs = containerClone.querySelectorAll("input, select, textarea");

        for (let i = 0; i < originalInputs.length; i++) {
          const orig = originalInputs[i];
          const clone = clonedInputs[i];

          if (orig.tagName === "SELECT") {
            const selectedIndex = orig.selectedIndex;
            if (selectedIndex >= 0) {
              clone.options[selectedIndex].setAttribute("selected", "selected");
            }
          } else {
            clone.setAttribute("value", orig.value);
          }

          // Bloquear
          clone.setAttribute("disabled", "disabled");
          clone.setAttribute("readonly", "readonly");
          const parentGroup = clone.closest(".field-group");
          if (parentGroup) parentGroup.classList.remove("has-error");
        }

        const actionsBar = containerClone.querySelector(".form-actions-bar");
        if (actionsBar) actionsBar.style.display = "none";
        const backBtn = containerClone.querySelector(".btn-back");
        if (backBtn) backBtn.style.display = "none";

        const filename = `Solicitud_RTM_Sucursales_${numCliente}.html`;

        fetch('styles.css')
          .then(res => res.text())
          .then(cssContent => generateHtmlDownload(cssContent, containerClone.outerHTML))
          .catch(err => generateHtmlDownload('', containerClone.outerHTML, true));

        function generateHtmlDownload(inlineCss, contentHtml, useFallback = false) {
          const htmlContent = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Solicitud RTM Sucursales - ${numCliente}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
      ${useFallback ? '<link rel="stylesheet" href="styles.css">' : `<style>${inlineCss}</style>`}
      <style>
        body { background-color: #f1f5f9; display: flex; justify-content: center; padding: 30px; margin: 0; font-family: 'Inter', sans-serif; }
        .form-container { width: 100%; max-width: 1100px; }
        input:disabled, select:disabled, textarea:disabled { background-color: #f8fafc !important; color: #1a202c !important; border-color: #cbd5e1 !important; -webkit-text-fill-color: #1a202c !important; opacity: 1 !important; cursor: default !important; }
        @media print { body { background-color: white; padding: 0; } .form-container { box-shadow: none; border-top: 8px solid #084475; padding: 0; } }
      </style>
    </head>
    <body>
      ${contentHtml}
      <script>window.onload = function() { setTimeout(function() { window.print(); }, 500); };</script>
    </body>
    </html>`;

          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          alert("Su solicitud se ha descargado en formato HTML.");

          // Después de descargar, regresa el formulario a su estado inicial
          resetSucursalForm();
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        }
      });
    }

    function resetSucursalForm() {
      sucursalForm.reset();
      numClienteInput.closest(".field-group").classList.remove("has-error");

      // Borra todos los bloques de sucursal adicionales y deja solo el primero en blanco.
      const blocks = document.querySelectorAll(".sucursal-block");
      for (let i = 1; i < blocks.length; i++) {
        blocks[i].remove();
      }

      // Reinicia el primer bloque de sucursal a sus valores vacíos
      const firstBlock = document.querySelector(".sucursal-block");
      if (firstBlock) {
        firstBlock.querySelectorAll("input").forEach(input => {
          input.value = "";
          const grp = input.closest(".field-group");
          if (grp) grp.classList.remove("has-error");
        });
        firstBlock.querySelectorAll("select").forEach(select => {
          if (select.name === "sucursal-colonia") select.innerHTML = '<option value="">Registre un C.P. primero</option>';
          else if (select.name === "sucursal-plaza") { select.innerHTML = '<option value="">Seleccione...</option>'; select.disabled = false; select.classList.remove("locked"); }
          else if (select.name === "sucursal-unidad-facturacion") select.value = "PIEZAS";
          else select.value = "";
          const grp = select.closest(".field-group");
          if (grp) grp.classList.remove("has-error");
        });
      }

      numClienteInput.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const btnBackSuc = document.getElementById("btn-back-menu-suc");
    if (btnBackSuc) {
      btnBackSuc.addEventListener("click", () => {
        if (confirm("¿Desea regresar al menú principal y limpiar el formulario?")) {
          resetSucursalForm();
          document.getElementById("home-view").classList.add("active");
          document.getElementById("sucursal-view").classList.remove("active");
        }
      });
    }

    const btnBack2 = document.getElementById("btn-back-2");
    if (btnBack2) {
      // Remover listener previo si existe (para evitar doble evento)
      const newBtnBack2 = btnBack2.cloneNode(true);
      btnBack2.parentNode.replaceChild(newBtnBack2, btnBack2);
      newBtnBack2.addEventListener("click", () => {
        if (confirm("¿Desea regresar al menú principal y limpiar el formulario?")) {
          resetSucursalForm();
          document.getElementById("home-view").classList.add("active");
          document.getElementById("sucursal-view").classList.remove("active");
        }
      });
    }
  }

  // =========================================================================
  // INTEGRACIÓN DE REGISTRO MASIVO
  // =========================================================================

  function initMasivo() {
    let sepomex = {}, cedisInfo = {}, canalesVenta = {}, diccionarioAbreviaturas = {};
    const HEADERS_ESPERADOS = [
      "RAZON SOCIAL", "NOMBRE NEGOCIO", "CALLE", "EXT", "INT", "ENTRE CALLE",
      "ENTRE CALLE 2", "CODIGO POSTAL", "COLONIA", "LATITUD", "LONGITUD", "SUBCANAL", "GIRO COMERCIAL",
      "CLASIFICACION INTERNA", "SEGMENTACION DE MERCADO"
    ];

    const downloadTemplateBtnMasivo = document.getElementById("downloadTemplateBtnMasivo");
    if (downloadTemplateBtnMasivo) {
      downloadTemplateBtnMasivo.addEventListener("click", async () => {
        if (!window.ExcelJS) return alert("La librería ExcelJS no está cargada.");
        const workbook = new ExcelJS.Workbook();

        const subcanales = canalesVenta["DETALLE"]?.subcanales || [];
        const giros = canalesVenta["DETALLE"]?.giros || [];
        const clasificaciones = window.ALPURA_MOCK_DATA?.clasificacionesInternas || [];
        const segmentaciones = window.ALPURA_MOCK_DATA?.segmentacionesMercado || [];

        const ws = workbook.addWorksheet('Plantilla');
        ws.columns = HEADERS_ESPERADOS.map(header => ({
          header: header,
          width: header.length + 6 // Ajuste de ancho para legibilidad
        }));
        ws.getRow(1).font = { bold: true };

        const subcanalesStr = '"' + subcanales.join(',') + '"';
        const girosStr = '"' + giros.join(',') + '"';
        const clasifStr = '"' + clasificaciones.join(',') + '"';
        const segStr = '"' + segmentaciones.join(',') + '"';

        for (let i = 2; i <= 1000; i++) {
          if (subcanales.length > 0) {
            ws.getCell(`L${i}`).dataValidation = {
              type: 'list', allowBlank: true, formulae: [subcanalesStr]
            };
          }
          if (giros.length > 0) {
            ws.getCell(`M${i}`).dataValidation = {
              type: 'list', allowBlank: true, formulae: [girosStr]
            };
          }
          if (clasificaciones.length > 0) {
            ws.getCell(`N${i}`).dataValidation = {
              type: 'list', allowBlank: true, formulae: [clasifStr]
            };
          }
          if (segmentaciones.length > 0) {
            ws.getCell(`O${i}`).dataValidation = {
              type: 'list', allowBlank: true, formulae: [segStr]
            };
          }
        }

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Plantilla_Masivo_RTM.xlsx");
      });
    }

    const btnBackMasivo = document.getElementById("btn-back-masivo");
    if (btnBackMasivo) {
      btnBackMasivo.addEventListener("click", () => {
        if (confirm("¿Desea regresar al menú principal? Se perderán los datos no exportados.")) {
          const tbody = document.querySelector("#dataTableMasivo tbody");
          if (tbody) tbody.innerHTML = "";
          const cedisSelect = document.getElementById("cedisSelectMasivo");
          if (cedisSelect) cedisSelect.value = "";
          const ticketInput = document.getElementById("ticketInputMasivo");
          if (ticketInput) ticketInput.value = "";
          const pasteArea = document.getElementById("pasteAreaMasivo");
          if (pasteArea) pasteArea.value = "";

          document.getElementById("home-view").classList.add("active");
          document.getElementById("masivo-view").classList.remove("active");
        }
      });
    }

    function aMayusculasSinAcentosYUnEspacio(str) {
      if (!str) return "";
      return str.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").replace(/\s+/g, " ").toUpperCase().trim();
    }

    function downloadCsv(nombre, filas) {
      const csv = filas.map(arr =>
        arr.map(val => {
          if (typeof val === "string" && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
            val = '"' + val.replace(/"/g, '""') + '"';
          }
          return val;
        }).join(",")
      ).join("\r\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nombre + ".csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    // Usar los catálogos ya cargados por mockData.js
    canalesVenta = window.ALPURA_MOCK_DATA?.canalesVenta || {};
    sepomex = window.ALPURA_MOCK_DATA?.codigosPostales || {};
    cedisInfo = window.ALPURA_MOCK_DATA?.cedis || {};
    diccionarioAbreviaturas = window.ALPURA_MOCK_DATA?.abreviaturas || {};

    const cedisSelect = document.getElementById("cedisSelectMasivo");
    if (cedisSelect) {
      cedisSelect.innerHTML = '<option value="">-- Selecciona un CEDIS --</option>';
      Object.keys(cedisInfo).forEach(cedis => {
        const option = document.createElement("option");
        option.value = cedis;
        option.textContent = cedis;
        cedisSelect.appendChild(option);
      });
    }

    const contieneCaracteresEspeciales = texto => /[^A-ZÑ0-9\s]/.test(texto);
    const abreviaturas = [
      "COL", "AV", "AVE", "BLVD", "BLV", "NUM", "NO", "EXT", "INT", "ENTRE",
      "CDA", "MZ", "LT", "DEPTO", "EDIF", "PISO", "DEP", "OF", "PRIV", "BLVD",
      "BLVR", "BLVAR", "BULEVAR", "BULEVARD", "BULEVAR", "AVDA", "BLDV", "BVAD",
      "BOULEVAR", "CARR", "CAR", "CARRE", "CALZ", "CLZD", "DOM", "CTO", "HDA",
      "REP", "RET", "FRACC", "ESQ", "PROL", "AND", "CJON"
    ];
    const contieneAbreviaturas = texto => {
      const pattern = "\\b(" + abreviaturas.join("|") + ")\\b";
      return new RegExp(pattern, "i").test(texto);
    };

    const corregirCoordenada = (valor, tipo) => {
      if (!valor) return null;
      const match = valor.match(/^(-?\d{2,3})\.(\d{1,10})$/);
      if (!match) return null;
      const enterosConSigno = match[1];
      const enteros = enterosConSigno.replace('-', '');
      let decimales = match[2];
      let esperado = tipo === 'lng' && enteros.length === 3 ? 5 : 6;
      decimales = decimales.slice(0, esperado).padEnd(esperado, '0');
      return `${enterosConSigno}.${decimales}`;
    };

    const pasteArea = document.getElementById("pasteAreaMasivo");
    const tableBody = document.querySelector("#dataTableMasivo tbody");

    if (pasteArea && tableBody) {
      pasteArea.addEventListener("paste", e => {
        e.preventDefault();
        const cedis = document.getElementById("cedisSelectMasivo").value;
        if (!cedis) return alert("⚠️ Debes seleccionar un CEDIS antes de pegar datos.");
        const canal = "DETALLE"; // Fijo como solicitó el usuario
        const ticketValue = document.getElementById("ticketInputMasivo").value.trim();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        // Usar replace en lugar de trim() para evitar perder tabulaciones finales (celdas vacías) en la última fila
        const cleanText = text.replace(/[\r\n]+$/, "");
        const rows = cleanText.split(/\r?\n/).map(r => r.split("\t"));
        if (rows.length < 2) {
          return alert("⚠️ Los datos pegados deben incluir los encabezados y al menos una fila de datos.");
        }
        const encabezadosPegados = rows[0].map(aMayusculasSinAcentosYUnEspacio);
        const headersNormalizados = HEADERS_ESPERADOS.map(aMayusculasSinAcentosYUnEspacio);

        let coinciden = true;
        for (let i = 0; i < headersNormalizados.length; i++) {
          if (encabezadosPegados[i] !== headersNormalizados[i]) {
            coinciden = false;
            break;
          }
        }

        if (!coinciden) {
          return alert("⚠️ Los encabezados pegados no coinciden con los requeridos:\n\n" + HEADERS_ESPERADOS.join("\n"));
        }

        const expandirAbreviaturas = (texto) => {
          if (!texto) return texto;
          return texto.split(/\s+/).map(palabra => {
            let pLimpia = palabra.replace(/[^A-ZÑ]/g, "");
            if (diccionarioAbreviaturas[pLimpia]) {
              return palabra.replace(pLimpia, diccionarioAbreviaturas[pLimpia]);
            }
            return palabra;
          }).join(" ");
        };

        for (let rowIdx = 1; rowIdx < rows.length; rowIdx++) {
          const cols = rows[rowIdx].map(aMayusculasSinAcentosYUnEspacio).map(expandirAbreviaturas);
          if (cols.length < 15) continue;
          const tr = document.createElement("tr");
          for (let i = 0; i < 15; i++) {
            const td = document.createElement("td");
            td.contentEditable = true;
            td.textContent = cols[i] || "";
            tr.appendChild(td);
          }
          // Validación: 15
          tr.appendChild(document.createElement("td"));
          // Geo-distancia: 16
          tr.appendChild(document.createElement("td"));
          // Comentarios: 17
          const tdComentarios = document.createElement("td");
          tdComentarios.contentEditable = true;
          tdComentarios.spellcheck = true;
          tr.appendChild(tdComentarios);

          const canalCve = canalesVenta[canal]?.canalIbp || canal || "";

          // Ocultas 16-21
          const canalTd = document.createElement("td");
          canalTd.textContent = canalCve;
          canalTd.className = "col-oculta";
          tr.appendChild(canalTd);

          const tdCedis = document.createElement("td");
          tdCedis.textContent = cedis; // o clave si existe
          tdCedis.className = "col-oculta";
          tr.appendChild(tdCedis);

          const tdPlaza = document.createElement("td");
          tdPlaza.textContent = cedisInfo[cedis] && cedisInfo[cedis].plazas ? (Array.isArray(cedisInfo[cedis].plazas) ? cedisInfo[cedis].plazas[0] : cedisInfo[cedis].plazas) : "";
          tdPlaza.className = "col-oculta";
          tr.appendChild(tdPlaza);

          const tdZona = document.createElement("td");
          tdZona.textContent = cedisInfo[cedis]?.zonaNielsen || "";
          tdZona.className = "col-oculta";
          tr.appendChild(tdZona);

          const tdRegional = document.createElement("td");
          tdRegional.textContent = cedisInfo[cedis]?.regionalResponsable || "";
          tdRegional.className = "col-oculta";
          tr.appendChild(tdRegional);

          const tdEntrega = document.createElement("td");
          tdEntrega.textContent = cedisInfo[cedis]?.tipoEntrega || "";
          tdEntrega.className = "col-oculta";
          tr.appendChild(tdEntrega);

          // ID CLIENTE y TICKET 22-23
          const tdIdCliente = document.createElement("td");
          tdIdCliente.contentEditable = true;
          tdIdCliente.classList.add("id-cliente");
          tr.appendChild(tdIdCliente);

          const tdTicket = document.createElement("td");
          tdTicket.textContent = ticketValue;
          tr.appendChild(tdTicket);

          // Ocultas 24-32
          const tdIdSucursal = document.createElement("td");
          tdIdSucursal.textContent = "0";
          tdIdSucursal.className = "col-oculta";
          tr.appendChild(tdIdSucursal);

          const tdRfc1 = document.createElement("td");
          tdRfc1.textContent = "XAXX";
          tdRfc1.className = "col-oculta";
          tr.appendChild(tdRfc1);

          const tdRfc2 = document.createElement("td");
          tdRfc2.textContent = "010101";
          tdRfc2.className = "col-oculta";
          tr.appendChild(tdRfc2);

          const tdRfc3 = document.createElement("td");
          tdRfc3.textContent = "000";
          tdRfc3.className = "col-oculta";
          tr.appendChild(tdRfc3);

          const tdEstructuraVentas = document.createElement("td");
          tdEstructuraVentas.textContent = "MTT"; // default
          tdEstructuraVentas.className = "col-oculta";
          tr.appendChild(tdEstructuraVentas);

          const tdCanalIbp = document.createElement("td");
          tdCanalIbp.textContent = canalCve;
          tdCanalIbp.className = "col-oculta";
          tr.appendChild(tdCanalIbp);

          const tdSubcanalIbp = document.createElement("td");
          tdSubcanalIbp.textContent = canalesVenta[canal]?.macrocanal || ""; // Asignar el macrocanal u otra lógica
          tdSubcanalIbp.className = "col-oculta";
          tr.appendChild(tdSubcanalIbp);

          const tdAgrupadorIbp = document.createElement("td");
          tdAgrupadorIbp.textContent = (canalesVenta[canal]?.agrupacionesIbp && canalesVenta[canal].agrupacionesIbp[0]) ? canalesVenta[canal].agrupacionesIbp[0] : "";
          tdAgrupadorIbp.className = "col-oculta";
          tr.appendChild(tdAgrupadorIbp);

          const tdClienteIbp = document.createElement("td");
          tdClienteIbp.textContent = "";
          tdClienteIbp.className = "col-oculta";
          tr.appendChild(tdClienteIbp);

          const tdCheck = document.createElement("td");
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.className = "row-checkbox-masivo";
          tdCheck.appendChild(checkbox);
          tr.appendChild(tdCheck);

          tableBody.appendChild(tr);
          validarFila(tr);
          agregarValidacionTiempoReal(tr);
        }

        // IDs automáticos
        const idClienteCells = tableBody.querySelectorAll("tr .id-cliente");
        if (idClienteCells.length) {
          idClienteCells[0].addEventListener("blur", function () {
            let val = parseInt(this.textContent.trim());
            if (!isNaN(val)) {
              for (let i = 1; i < idClienteCells.length; i++) {
                idClienteCells[i].textContent = val + i;
              }
            }
          });
        }
      });
    }

    function getCaretCharacterOffsetWithin(element) {
      let caretOffset = 0;
      let doc = element.ownerDocument || element.document;
      let win = doc.defaultView || doc.parentWindow;
      let sel;
      if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
          let range = sel.getRangeAt(0);
          let preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(element);
          preCaretRange.setEnd(range.endContainer, range.endOffset);
          caretOffset = preCaretRange.toString().length;
        }
      }
      return caretOffset;
    }

    function setCaretPosition(element, chars) {
      if (chars >= 0) {
        let selection = window.getSelection();
        let range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(true);
        let node = element;
        let charIndex = 0, foundStart = false;

        function traverseNodes(node) {
          if (node.nodeType === 3) {
            let nextCharIndex = charIndex + node.length;
            if (!foundStart && chars <= nextCharIndex) {
              range.setStart(node, chars - charIndex);
              range.collapse(true);
              foundStart = true;
            }
            charIndex = nextCharIndex;
          } else {
            for (let i = 0; i < node.childNodes.length; i++) {
              traverseNodes(node.childNodes[i]);
              if (foundStart) break;
            }
          }
        }
        traverseNodes(node);
        if (!foundStart) range.setStart(node, node.childNodes.length);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }

    function validarFila(tr) {
      const cells = tr.querySelectorAll("td");
      const errores = [];
      const [
        razon, negocio, calle, ext, int, entre1, entre2,
        cp, col, lat, lng, subcanal, giro, clasif, seg
      ] = Array.from(cells).slice(0, 15).map(td => td.textContent.trim().toUpperCase());

      const canal = "DETALLE";
      const cpValido = /^\d{5}$/.test(cp);
      const ref = sepomex[cp] || {};
      const cpExiste = cpValido && Object.keys(ref).length > 0;
      const coloniasValidas = Array.isArray(ref.colonias) ? ref.colonias.map(c => c.toUpperCase()) : [];

      const setBgColor = (i, isVal) => {
        cells[i].style.backgroundColor = isVal ? "#d7ffd9" : "#ffd6d6";
      };

      const marcar = (i, condicion, mensaje) => {
        setBgColor(i, condicion);
        if (!condicion && mensaje) errores.push(mensaje);
      };

      marcar(0, razon && !contieneCaracteresEspeciales(razon), "RAZÓN inválida");
      marcar(1, negocio && !contieneCaracteresEspeciales(negocio), "NEGOCIO inválida");
      marcar(2, calle && !contieneCaracteresEspeciales(calle) && !contieneAbreviaturas(calle), "CALLE inválida");
      marcar(3, /^[A-ZÑ0-9\s]+$/.test(ext), "EXT inválido");
      marcar(4, !int || /^[A-ZÑ0-9\s]+$/.test(int), "INT inválido");
      marcar(5, !entre1 || (!contieneCaracteresEspeciales(entre1) && !contieneAbreviaturas(entre1)), "ENTRE CALLE inválida");
      marcar(6, !entre2 || (!contieneCaracteresEspeciales(entre2) && !contieneAbreviaturas(entre2)), "ENTRE CALLE 2 inválida");
      marcar(7, cpExiste, "CP inválido o inexistente");

      // Validación Colonia
      if (cpExiste && !coloniasValidas.includes(col)) {
        const currentTd = cells[8];
        let originalValue = col;
        if (currentTd.querySelector("select")) {
          const existingSelect = currentTd.querySelector("select");
          const selectedOption = existingSelect.options[0];
          if (selectedOption && selectedOption.disabled) {
            originalValue = selectedOption.value;
          }
        }
        currentTd.innerHTML = "";
        const select = document.createElement("select");
        select.style.maxWidth = "180px";
        const optIngresado = document.createElement("option");
        optIngresado.value = optIngresado.textContent = originalValue;
        optIngresado.selected = true;
        optIngresado.disabled = true;
        select.appendChild(optIngresado);
        const normalizar = str => str.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").replace(/\s+/g, " ").trim().toUpperCase();
        const colNormalizada = normalizar(originalValue);
        (ref.colonias || []).forEach(option => {
          const optNormalizada = normalizar(option);
          if (optNormalizada !== colNormalizada) {
            const opt = document.createElement("option");
            opt.textContent = opt.value = optNormalizada;
            select.appendChild(opt);
          }
        });
        select.addEventListener("change", () => {
          currentTd.textContent = select.value.toUpperCase();
          validarFila(tr);
        });
        currentTd.appendChild(select);
        setBgColor(8, false);
        errores.push("COLONIA no coincide con CP");
      } else {
        cells[8].innerHTML = col;
        marcar(8, coloniasValidas.includes(col), "COLONIA inválida");
      }

      // Coordenadas
      const tdLat = cells[9];
      const tdLng = cells[10];
      const latFix = corregirCoordenada(lat, 'lat');
      const lngFix = corregirCoordenada(lng, 'lng');
      if (document.activeElement !== tdLat && latFix && lat !== latFix) {
        tdLat.textContent = latFix;
      }
      if (document.activeElement !== tdLng && lngFix && lng !== lngFix) {
        tdLng.textContent = lngFix;
      }
      setBgColor(9, !!latFix);
      setBgColor(10, !!lngFix);
      if (!latFix) errores.push("LATITUD inválida");
      if (!lngFix) errores.push("LONGITUD inválida");

      // GEO-DISTANCIA
      let mensajeDistancia = "❌ Sin validar";
      let latVal = Number(tdLat.textContent.replace(',', '.'));
      let lngVal = Number(tdLng.textContent.replace(',', '.'));
      // Utilizamos 'latitud' y 'longitud' según geoSEPOMEX.json adaptado
      if (latVal && lngVal && ref.latitud && ref.longitud && !isNaN(latVal) && !isNaN(lngVal)) {
        const distancia = calcularDistanciaKm(latVal, lngVal, parseFloat(ref.latitud), parseFloat(ref.longitud));
        const zona = (ref.zona || "URBANA").toUpperCase();
        const umbral = zona === "RURAL" ? 10 : 5;
        mensajeDistancia = distancia <= umbral
          ? `✔️ ${distancia.toFixed(2)} km`
          : `⚠️ ${distancia.toFixed(2)} km (límite ${umbral} km)`;
      } else {
        errores.push("Faltan coordenadas de CP o Locales");
      }
      cells[16].textContent = mensajeDistancia;
      setBgColor(16, mensajeDistancia.startsWith("✔️"));

      // SUBCANAL
      const subcanales = canalesVenta[canal]?.subcanales || [];
      if (!subcanales.includes(subcanal)) {
        const currentTd = cells[11];
        let originalValue = subcanal;
        if (currentTd.querySelector("select")) {
          originalValue = currentTd.querySelector("select").options[0].value;
        }
        const select = document.createElement("select");
        select.style.maxWidth = "140px";
        const optIngresado = document.createElement("option");
        optIngresado.value = optIngresado.textContent = originalValue;
        optIngresado.selected = true;
        optIngresado.disabled = true;
        select.appendChild(optIngresado);
        subcanales.forEach(option => {
          if (option !== originalValue) {
            const opt = document.createElement("option");
            opt.value = opt.textContent = option;
            select.appendChild(opt);
          }
        });
        select.addEventListener("change", () => {
          cells[11].textContent = select.value.toUpperCase();
          validarFila(tr);
        });
        currentTd.innerHTML = "";
        currentTd.appendChild(select);
        setBgColor(11, false);
        errores.push("SUBCANAL no corresponde");
      } else {
        cells[11].classList.remove("valid", "invalid");
        setBgColor(11, subcanales.includes(subcanal));
        if (!subcanales.includes(subcanal)) errores.push("SUBCANAL inválido");
      }

      // GIRO COMERCIAL
      const giros = canalesVenta[canal]?.giros || [];
      if (!giros.includes(giro)) {
        const currentTd = cells[12];
        let originalValue = giro;
        if (currentTd.querySelector("select")) {
          originalValue = currentTd.querySelector("select").options[0].value;
        }
        const select = document.createElement("select");
        select.style.maxWidth = "140px";
        const optIngresado = document.createElement("option");
        optIngresado.value = optIngresado.textContent = originalValue;
        optIngresado.selected = true;
        optIngresado.disabled = true;
        select.appendChild(optIngresado);
        giros.forEach(option => {
          if (option !== originalValue) {
            const opt = document.createElement("option");
            opt.value = opt.textContent = option;
            select.appendChild(opt);
          }
        });
        select.addEventListener("change", () => {
          cells[12].textContent = select.value.toUpperCase();
          validarFila(tr);
        });
        currentTd.innerHTML = "";
        currentTd.appendChild(select);
        setBgColor(12, false);
        errores.push("GIRO COMERCIAL no corresponde");
      } else {
        setBgColor(12, giros.includes(giro));
        if (!giros.includes(giro)) errores.push("GIRO COMERCIAL inválido");
      }

      // CLASIFICACION INTERNA
      const clasificaciones = window.ALPURA_MOCK_DATA?.clasificacionesInternas || [];
      if (!clasificaciones.includes(clasif)) {
        const currentTd = cells[13];
        let originalValue = clasif;
        if (currentTd.querySelector("select")) {
          originalValue = currentTd.querySelector("select").options[0].value;
        }
        const select = document.createElement("select");
        select.style.maxWidth = "140px";
        const optIngresado = document.createElement("option");
        optIngresado.value = optIngresado.textContent = originalValue;
        optIngresado.selected = true;
        optIngresado.disabled = true;
        select.appendChild(optIngresado);
        clasificaciones.forEach(option => {
          if (option !== originalValue) {
            const opt = document.createElement("option");
            opt.value = opt.textContent = option;
            select.appendChild(opt);
          }
        });
        select.addEventListener("change", () => {
          cells[13].textContent = select.value.toUpperCase();
          validarFila(tr);
        });
        currentTd.innerHTML = "";
        currentTd.appendChild(select);
        setBgColor(13, false);
        errores.push("CLASIFICACION INTERNA no corresponde");
      } else {
        setBgColor(13, clasificaciones.includes(clasif));
        if (!clasificaciones.includes(clasif)) errores.push("CLASIFICACION INTERNA inválida");
      }

      // SEGMENTACION DE MERCADO
      const segmentaciones = window.ALPURA_MOCK_DATA?.segmentacionesMercado || [];
      if (!segmentaciones.includes(seg)) {
        const currentTd = cells[14];
        let originalValue = seg;
        if (currentTd.querySelector("select")) {
          originalValue = currentTd.querySelector("select").options[0].value;
        }
        const select = document.createElement("select");
        select.style.maxWidth = "140px";
        const optIngresado = document.createElement("option");
        optIngresado.value = optIngresado.textContent = originalValue;
        optIngresado.selected = true;
        optIngresado.disabled = true;
        select.appendChild(optIngresado);
        segmentaciones.forEach(option => {
          if (option !== originalValue) {
            const opt = document.createElement("option");
            opt.value = opt.textContent = option;
            select.appendChild(opt);
          }
        });
        select.addEventListener("change", () => {
          cells[14].textContent = select.value.toUpperCase();
          validarFila(tr);
        });
        currentTd.innerHTML = "";
        currentTd.appendChild(select);
        setBgColor(14, false);
        errores.push("SEGMENTACION DE MERCADO no corresponde");
      } else {
        setBgColor(14, segmentaciones.includes(seg));
        if (!segmentaciones.includes(seg)) errores.push("SEGMENTACION DE MERCADO inválida");
      }

      // VALIDACIÓN GENERAL
      cells[15].textContent = errores.length ? `❌ ${errores.join(", ")}` : "✔️ VÁLIDO";
      setBgColor(15, errores.length === 0);
    }

    function agregarValidacionTiempoReal(tr) {
      tr.querySelectorAll("td[contenteditable='true']").forEach((td, idx) => {
        if (idx === 7) {
          td.addEventListener("blur", function () {
            td.textContent = td.textContent.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").toUpperCase();
            const cp = td.textContent.trim();
            const ref = sepomex[cp];
            const tdColonia = tr.children[8];

            let valorColonia = tdColonia.querySelector("select")
              ? tdColonia.querySelector("select").options[0].value
              : tdColonia.textContent.trim();

            const normalizar = s => s.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").replace(/\s+/g, " ").toUpperCase().trim();

            if (ref && Array.isArray(ref.colonias) && ref.colonias.length > 0) {
              const coloniasValidas = ref.colonias.map(normalizar);
              if (!coloniasValidas.includes(normalizar(valorColonia))) {
                const select = document.createElement("select");
                select.style.maxWidth = "180px";
                const optIngresado = document.createElement("option");
                optIngresado.value = optIngresado.textContent = valorColonia;
                optIngresado.selected = true;
                optIngresado.disabled = true;
                select.appendChild(optIngresado);

                coloniasValidas.forEach(col => {
                  if (col !== normalizar(valorColonia)) {
                    const opt = document.createElement("option");
                    opt.value = opt.textContent = col;
                    select.appendChild(opt);
                  }
                });
                select.addEventListener("change", function () {
                  tdColonia.innerHTML = this.value;
                  validarFila(tr);
                });
                tdColonia.innerHTML = "";
                tdColonia.appendChild(select);
              } else {
                tdColonia.innerHTML = valorColonia;
              }
            }
            validarFila(tr);
          });
        }
        else if (idx === 9 || idx === 10) {
          td.addEventListener("input", function () { validarFila(tr); });
          td.addEventListener("blur", function () {
            let txt = td.textContent;
            td.textContent = txt.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").toUpperCase();
            validarFila(tr);
          });
        }
        else if ([0, 1, 2, 5, 6].includes(idx)) {
          td.addEventListener("input", function (e) {
            let pos = getCaretCharacterOffsetWithin(td);
            let txt = td.textContent;
            let nuevoTxt = txt.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").toUpperCase();
            if (txt !== nuevoTxt) {
              td.textContent = nuevoTxt;
              setCaretPosition(td, pos);
            }
            validarFila(tr);
          });
          td.addEventListener("blur", function () {
            let txt = td.textContent;
            td.textContent = txt.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").replace(/\s+/g, " ").toUpperCase().trim();
            validarFila(tr);
          });
        }
        else {
          td.addEventListener("input", function () { validarFila(tr); });
          td.addEventListener("blur", function () {
            if (!td.classList.contains("id-cliente")) {
              let txt = td.textContent;
              td.textContent = txt.replace(/Ñ/gi, "&&NTILDE&&").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&&NTILDE&&/gi, "Ñ").toUpperCase();
            }
            validarFila(tr);
          });
        }
      });
    }

    // Botones Masivo
    const btnExport = document.getElementById("exportBtnMasivo");
    const btnCsv = document.getElementById("exportCsvBtnMasivo");
    const btnDel = document.getElementById("deleteRowsBtnMasivo");
    const btnClear = document.getElementById("clearAllBtnMasivo");

    if (btnExport) {
      btnExport.addEventListener("click", async () => {
        if (!window.ExcelJS) return alert("La librería ExcelJS no está cargada.");
        const filas = document.querySelectorAll("#dataTableMasivo tbody tr");
        if (filas.length === 0) return alert("No hay datos para exportar.");

        let hasErrors = false;
        let hasGeoWarnings = false;
        filas.forEach(tr => {
          const tds = tr.querySelectorAll("td");
          const validacionText = tds[15] ? tds[15].textContent : "";
          const geoText = tds[16] ? tds[16].textContent : "";
          if (validacionText.includes("❌")) hasErrors = true;
          if (geoText.includes("⚠️")) hasGeoWarnings = true;
        });

        if (hasErrors) {
          return alert("Existen errores de validación en los datos. Por favor corrígelos antes de generar el requerimiento.");
        }
        if (hasGeoWarnings) {
          if (!confirm("Existen advertencias de geo-distancia en algunas filas. ¿Desea continuar con la descarga de todos modos?")) {
            return;
          }
        }

        const columnasDeseadas = [
          { titulo: "CEDIS ASIGNADO", idx: 19 },
          { titulo: "RAZÓN SOCIAL", idx: 0 }, { titulo: "NOMBRE NEGOCIO", idx: 1 }, { titulo: "CALLE", idx: 2 },
          { titulo: "EXT", idx: 3 }, { titulo: "INT", idx: 4 }, { titulo: "ENTRE CALLE", idx: 5 },
          { titulo: "ENTRE CALLE 2", idx: 6 }, { titulo: "CODIGO POSTAL", idx: 7 }, { titulo: "COLONIA", idx: 8 },
          { titulo: "LATITUD", idx: 9 }, { titulo: "LONGITUD", idx: 10 }, { titulo: "SUBCANAL", idx: 11 },
          { titulo: "GIRO COMERCIAL", idx: 12 }, { titulo: "CLASIFICACION INTERNA", idx: 13 },
          { titulo: "SEGMENTACION DE MERCADO", idx: 14 }, { titulo: "VALIDACION", idx: 15 },
          { titulo: "GEO-DISTANCIA", idx: 16 }, { titulo: "COMENTARIOS", idx: 17 }
        ];

        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Requerimiento');
        const headers = columnasDeseadas.map(col => col.titulo);
        ws.columns = headers.map(header => ({
          header: header,
          width: header.length + 6 // Ajuste de ancho para legibilidad
        }));
        ws.getRow(1).font = { bold: true };

        filas.forEach(tr => {
          const tds = tr.querySelectorAll("td");
          const rowData = columnasDeseadas.map(col => {
            const td = tds[col.idx];
            if (!td) return "";
            if ([8, 11, 12, 13, 14].includes(col.idx)) {
              const select = td.querySelector("select");
              if (select) return select.options[select.selectedIndex]?.value || select.options[0]?.value || "";
            }
            return td.textContent.replace(/\s+/g, " ").trim();
          });
          ws.addRow(rowData);
        });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer]), "Requerimiento_Masivo_RTM.xlsx");
      });
    }

    if (btnCsv) {
      btnCsv.addEventListener("click", () => {
        const filas = Array.from(document.querySelectorAll("#dataTableMasivo tbody tr"));
        if (filas.length === 0) return alert("No hay datos para exportar.");
        function valor(td) {
          if (!td) return "";
          const sel = td.querySelector("select");
          return sel ? (sel.options[sel.selectedIndex]?.value || sel.options[0]?.value || "") : td.textContent.trim();
        }
        const idx = {
          "ID CLIENTE": 24, "ID SUCURSAL": 26, "RAZON SOCIAL": 0, "CALLE": 2, "INT": 4, "EXT": 3,
          "COLONIA": 8, "CODIGO POSTAL": 7, "RFC1": 27, "RFC2": 28, "RFC3": 29, "NOMBRE NEGOCIO": 1,
          "NUMERO DE TICKET": 25, "CVE CEDIS": 19, "PLAZA DE DISTRIBUCION": 20, "LATITUD": 9, "LONGITUD": 10,
          "ZONA NIELSEN": 21, "TIPO DE ENTREGA": 23, "REGIONAL RESPONSABLE": 22, "ESTRUCTURA DE VENTAS": 30,
          "CANAL IBP": 31, "SUBCANAL IBP": 32, "AGRUPADOR IBP": 33, "CLIENTE IBP": 34
        };
        downloadCsv("registroClientesMasivo", filas.map(tr => {
          const tds = tr.querySelectorAll("td");
          return [
            valor(tds[idx["ID CLIENTE"]]), valor(tds[idx["ID SUCURSAL"]]), valor(tds[idx["RAZON SOCIAL"]]),
            valor(tds[idx["CALLE"]]), valor(tds[idx["INT"]]), valor(tds[idx["EXT"]]), valor(tds[idx["COLONIA"]]),
            valor(tds[idx["CODIGO POSTAL"]]), valor(tds[idx["RFC1"]]), valor(tds[idx["RFC2"]]), valor(tds[idx["RFC3"]]),
            valor(tds[idx["NOMBRE NEGOCIO"]]), valor(tds[idx["NUMERO DE TICKET"]])
          ];
        }));
      });
    }

    if (btnDel) {
      btnDel.addEventListener("click", () => {
        const checkboxes = document.querySelectorAll(".row-checkbox-masivo:checked");
        if (checkboxes.length === 0) return alert("Selecciona filas usando los checkboxes de la derecha.");
        checkboxes.forEach(chk => {
          const tr = chk.closest("tr");
          if (tr) tr.remove();
        });
      });
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => {
        if (confirm("¿Borrar todos los registros de la tabla?")) {
          const tbody = document.querySelector("#dataTableMasivo tbody");
          if (tbody) tbody.innerHTML = "";
          const cedisSelect = document.getElementById("cedisSelectMasivo");
          if (cedisSelect) cedisSelect.value = "";
        }
      });
    }
  }

  // Inicializar módulo masivo
  initMasivo();

  // --- LÓGICA VISTA CAMBIO FACTURA ---
  function initCambioFactura() {
    const btnBack = document.getElementById("btn-back-factura");
    const btnMenu = document.getElementById("btn-menu-factura");
    const btnClear = document.getElementById("btn-clear-factura");
    const form = document.getElementById("cambio-factura-form");

    function updateFecha() {
      const fechaInput = document.getElementById("cf-fecha");
      if (fechaInput) {
        const today = new Date();
        fechaInput.value = today.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    updateFecha();

    function clearFactura() {
      if (confirm("¿Limpiar todo el formulario?")) {
        form.reset();
        document.querySelectorAll("#cambio-factura-form .field-group").forEach(g => g.classList.remove("has-error"));
        const cfUsoCfdiSelect = document.getElementById("cf-uso-cfdi");
        if (cfUsoCfdiSelect) cfUsoCfdiSelect.innerHTML = '<option value="">Seleccione Régimen primero...</option>';
        updateFecha();
        document.getElementById("cf-comentarios-counter").innerText = "0/500";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    if (btnBack) btnBack.addEventListener("click", () => switchView("home"));
    if (btnMenu) btnMenu.addEventListener("click", () => switchView("home"));
    if (btnClear) btnClear.addEventListener("click", clearFactura);

    if (form) {
        form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        updateFecha();
        
        let hasError = false;
        document.querySelectorAll("#cambio-factura-form .field-group, #cambio-factura-form .field-group-inline").forEach(g => g.classList.remove("has-error"));
        
        const numCliente = document.getElementById("cf-num-cliente").value;
        if (!/^\d{5,6}$/.test(numCliente)) { document.getElementById("cf-num-cliente").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const razonSocial = document.getElementById("cf-razon-social").value;
        if (!razonSocial.trim()) { document.getElementById("cf-razon-social").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const solicitante = document.getElementById("cf-solicitante").value;
        if (!solicitante.trim()) { document.getElementById("cf-solicitante").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const formaPago = document.getElementById("cf-forma-pago").value;
        if (!formaPago) { document.getElementById("cf-forma-pago").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const rfc = document.getElementById("cf-rfc").value;
        const rfcRegex = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i;
        if (!rfcRegex.test(rfc)) { document.getElementById("cf-rfc").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const regimenFiscal = document.getElementById("cf-regimen-fiscal").value;
        if (!regimenFiscal) { document.getElementById("cf-regimen-fiscal").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const usoCfdi = document.getElementById("cf-uso-cfdi").value;
        if (!usoCfdi) { document.getElementById("cf-uso-cfdi").closest(".field-group").classList.add("has-error"); hasError = true; }
        
        const facNombre = document.getElementById("cf-fac-nombre").value;
        if (!facNombre.trim()) {
          const group = document.getElementById("cf-fac-nombre").closest(".field-group-inline") || document.getElementById("cf-fac-nombre").closest(".field-group");
          if (group) group.classList.add("has-error");
          hasError = true;
        }

        const email = document.getElementById("cf-fac-email").value;
        const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
        if (!emailRegex.test(email)) { 
          const group = document.getElementById("cf-fac-email").closest(".field-group-inline") || document.getElementById("cf-fac-email").closest(".field-group");
          if (group) group.classList.add("has-error"); 
          hasError = true; 
        }

        if (hasError) {
          alert("Por favor corrija o complete los campos marcados antes de generar la solicitud.");
          return;
        }

        let stylesText = "";
        try {
          const stylesResponse = await fetch('styles.css');
          stylesText = await stylesResponse.text();
        } catch (err) {
          console.warn("No se pudo cargar styles.css para el PDF/HTML", err);
        }

        const viewElement = document.getElementById("cambio-factura-view");
        const viewClone = viewElement.cloneNode(true);

        const actionsBar = viewClone.querySelector('.form-actions-bar');
        if (actionsBar) actionsBar.remove();

        const btnBack = viewClone.querySelector('.btn-back');
        if (btnBack) btnBack.remove();

        const originalInputs = viewElement.querySelectorAll('input, select, textarea');
        const clonedInputs = viewClone.querySelectorAll('input, select, textarea');

        originalInputs.forEach((orig, index) => {
          const clone = clonedInputs[index];
          if (orig.tagName === 'SELECT') {
            const selectedText = orig.options[orig.selectedIndex]?.text || '';
            const inputReplacement = document.createElement('input');
            inputReplacement.type = 'text';
            inputReplacement.setAttribute('value', selectedText);
            inputReplacement.className = clone.className;
            inputReplacement.setAttribute('readonly', 'true');
            inputReplacement.style.width = '100%';
            inputReplacement.style.padding = '8px 12px';
            inputReplacement.style.border = '1px solid #ccc';
            inputReplacement.style.borderRadius = '4px';
            inputReplacement.style.backgroundColor = '#f9fafb';
            clone.parentNode.replaceChild(inputReplacement, clone);
          } else if (orig.tagName === 'TEXTAREA') {
            clone.textContent = orig.value;
            clone.setAttribute('readonly', 'true');
            clone.style.backgroundColor = '#f9fafb';
          } else {
            clone.setAttribute('value', orig.value);
            clone.setAttribute('readonly', 'true');
            clone.style.backgroundColor = '#f9fafb';
          }
        });

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Solicitud Cambio Factura - ${numCliente}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${stylesText}
    body { background-color: #eef2f5; padding: 30px; margin: 0; font-family: 'Inter', sans-serif; }
    .view { display: block; position: static; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; background: white; padding-bottom: 30px; }
    input[readonly] { color: #111 !important; font-weight: 500; border-color: #d1d5db !important; cursor: default; }
    .form-header { padding: 20px 30px; }
  </style>
</head>
<body>
  ${viewClone.outerHTML}
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        window.saveAs(blob, `CambioFactura_${numCliente}.html`);
        alert("Solicitud descargada exitosamente.");
        form.reset();
        switchView("home");
      });
    }
  }

  // --- LÓGICA VISTA CAMBIO CANAL ---
  function initCambioCanal() {
    const btnBack = document.getElementById("btn-back-canal");
    const btnMenu = document.getElementById("btn-menu-canal");
    const btnClear = document.getElementById("btn-clear-canal");
    const form = document.getElementById("cambio-canal-form");

    function updateFechaCanal() {
      const fechaInput = document.getElementById("cc-fecha");
      if (fechaInput) {
        const today = new Date();
        fechaInput.value = today.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' });
      }
    }
    updateFechaCanal();

    function clearCanal() {
      if (confirm("¿Limpiar todo el formulario?")) {
        form.reset();
        document.querySelectorAll("#cambio-canal-form .field-group").forEach(g => g.classList.remove("has-error"));
        updateFechaCanal();
        document.getElementById("cc-comentarios-counter").innerText = "0/500";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    if (btnBack) btnBack.addEventListener("click", () => switchView("home"));
    if (btnMenu) btnMenu.addEventListener("click", () => switchView("home"));
    if (btnClear) btnClear.addEventListener("click", clearCanal);

    if (form) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        updateFechaCanal();
        
        let hasError = false;
        document.querySelectorAll("#cambio-canal-form .field-group").forEach(g => g.classList.remove("has-error"));

        const requiredIds = [
          "cc-num-cliente", "cc-razon-social", "cc-canal-actual",
          "cc-canal-nuevo", "cc-subcanal", "cc-giro", "cc-agrupacion", "cc-agrupacion-ibp", "cc-solicitante"
        ];

        requiredIds.forEach(id => {
          const el = document.getElementById(id);
          if (el && !el.value.trim()) {
            el.closest(".field-group").classList.add("has-error");
            hasError = true;
          }
        });

        const numCliente = document.getElementById("cc-num-cliente").value;
        if (!/^\d{5,6}$/.test(numCliente)) {
          document.getElementById("cc-num-cliente").closest(".field-group").classList.add("has-error");
          hasError = true;
        }

        if (hasError) {
          alert("Por favor corrija los campos requeridos antes de generar la solicitud.");
          return;
        }

        let stylesText = "";
        try {
          const stylesResponse = await fetch('styles.css');
          stylesText = await stylesResponse.text();
        } catch (err) {
          console.warn("No se pudo cargar styles.css para el HTML", err);
        }

        const viewElement = document.getElementById("cambio-canal-view");
        const viewClone = viewElement.cloneNode(true);

        const actionsBar = viewClone.querySelector('.form-actions-bar');
        if (actionsBar) actionsBar.remove();
        const btnBackEl = viewClone.querySelector('.btn-back');
        if (btnBackEl) btnBackEl.remove();

        const originalInputs = viewElement.querySelectorAll('input, select, textarea');
        const clonedInputs = viewClone.querySelectorAll('input, select, textarea');

        originalInputs.forEach((orig, index) => {
          const clone = clonedInputs[index];
          if (orig.tagName === 'SELECT') {
            const selectedText = orig.options[orig.selectedIndex]?.text || '';
            const inputReplacement = document.createElement('input');
            inputReplacement.type = 'text';
            inputReplacement.setAttribute('value', selectedText);
            inputReplacement.className = clone.className;
            inputReplacement.setAttribute('readonly', 'true');
            inputReplacement.style.width = '100%';
            inputReplacement.style.padding = '8px 12px';
            inputReplacement.style.border = '1px solid #ccc';
            inputReplacement.style.borderRadius = '4px';
            inputReplacement.style.backgroundColor = '#f9fafb';
            clone.parentNode.replaceChild(inputReplacement, clone);
          } else if (orig.tagName === 'TEXTAREA') {
            clone.textContent = orig.value;
            clone.setAttribute('readonly', 'true');
            clone.style.backgroundColor = '#f9fafb';
          } else {
            clone.setAttribute('value', orig.value);
            clone.setAttribute('readonly', 'true');
            clone.style.backgroundColor = '#f9fafb';
          }
        });

        const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Solicitud Cambio Canal - ${numCliente}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    ${stylesText}
    body { background-color: #eef2f5; padding: 30px; margin: 0; font-family: 'Inter', sans-serif; }
    .view { display: block; position: static; max-width: 900px; margin: 0 auto; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border-radius: 8px; background: white; padding-bottom: 30px; }
    input[readonly], textarea[readonly] { color: #111 !important; font-weight: 500; border-color: #d1d5db !important; cursor: default; }
    .form-header { padding: 20px 30px; }
  </style>
</head>
<body>
  ${viewClone.outerHTML}
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
        window.saveAs(blob, `CambioCanal_${numCliente}.html`);
        alert("Solicitud descargada exitosamente.");
        form.reset();
        document.querySelectorAll("#cambio-canal-form .field-group").forEach(g => g.classList.remove("has-error"));
        updateFechaCanal();
        document.getElementById("cc-comentarios-counter").innerText = "0/500";
        switchView("home");
      });
    }
  }

  // --- LÓGICA VISTA REACTIVACIÓN ---
  function initReactivacion() {
    const btnBack = document.getElementById("btn-back-react");
    const btnMenu = document.getElementById("btn-menu-react");
    const btnClear = document.getElementById("btn-clear-react");
    const form = document.getElementById("reactivacion-form");
    const cedisGlobal = document.getElementById("rc-cedis-global");

    if (btnBack) btnBack.addEventListener("click", () => switchView("home"));
    if (btnMenu) btnMenu.addEventListener("click", () => switchView("home"));
    if (btnClear) btnClear.addEventListener("click", () => {
      if (confirm("¿Limpiar todo el formulario?")) { form.reset(); }
    });

    if (cedisGlobal) {
      cedisGlobal.addEventListener("change", () => {
        const cedisVal = cedisGlobal.value;
        const inputCedis = document.querySelector('input[name="rc-cedis"]');
        const plazaSelect = document.querySelector('select[name="rc-plaza"]');
        const rutaSelect = document.querySelector('select[name="rc-ruta"]');

        if (inputCedis) inputCedis.value = cedisVal;
        
        if (plazaSelect) plazaSelect.innerHTML = '<option value=""></option>';
        if (rutaSelect) rutaSelect.innerHTML = '<option value=""></option>';

        if (cedisVal && data.cedis[cedisVal]) {
          const mapping = data.cedis[cedisVal];
          if (plazaSelect) {
            mapping.plazas.forEach(plaza => {
              const opt = document.createElement("option"); opt.value = plaza; opt.textContent = plaza; plazaSelect.appendChild(opt);
            });
            if (cedisVal !== "ANDEN PLANTA" && cedisVal !== "DISTRIBUIDORES" && mapping.plazas.length > 0) {
              plazaSelect.value = mapping.plazas[0];
            }
          }
          if (rutaSelect) {
            mapping.rutas.forEach(ruta => {
              const opt = document.createElement("option"); opt.value = ruta; opt.textContent = ruta; rutaSelect.appendChild(opt);
            });
          }
        }
      });
    }

    const cpInput = document.querySelector('input[name="rc-cp"]');
    const latInput = document.querySelector('input[name="rc-lat"]');
    const lonInput = document.querySelector('input[name="rc-lon"]');

    function checkRealTimeGeo() {
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      const cp = cpInput.value;

      latInput.style.border = "";
      lonInput.style.border = "";
      latInput.title = "";
      lonInput.title = "";

      if (latInput.value && lonInput.value && cp && data.codigosPostales[cp]) {
        const dbCp = data.codigosPostales[cp];
        const distancia = calcularDistanciaKm(lat, lon, parseFloat(dbCp.latitud), parseFloat(dbCp.longitud));
        const umbral = dbCp.zona === "RURAL" ? 15 : 2.5;
        if (distancia > umbral) {
           latInput.style.border = "2px solid #d32f2f";
           lonInput.style.border = "2px solid #d32f2f";
           latInput.title = `Geo-alerta: Distancia de ${distancia.toFixed(2)}km excede el umbral de ${umbral}km.`;
           lonInput.title = latInput.title;
        }
      }
    }

    if (latInput) {
      latInput.addEventListener("input", checkRealTimeGeo);
      latInput.addEventListener("blur", () => {
        let val = latInput.value.trim();
        if (!val) return;
        val = val.replace(/[^0-9.-]/g, "");
        const parts = val.split(".");
        let integerPart = parts[0] || "0";
        let decimalPart = parts[1] || "";
        decimalPart = (decimalPart + "000000").substring(0, 6);
        latInput.value = `${integerPart}.${decimalPart}`;
        checkRealTimeGeo();
      });
    }
    
    if (lonInput) {
      lonInput.addEventListener("input", checkRealTimeGeo);
      lonInput.addEventListener("blur", () => {
        let val = lonInput.value.trim();
        if (!val) return;
        let cleaned = val.replace(/[^0-9.]/g, "");
        const parts = cleaned.split(".");
        let integerPart = parts[0] || "0";
        let decimalPart = parts[1] || "";
        let forcedDecimals = 6;
        if (integerPart.length === 2) forcedDecimals = 6;
        else if (integerPart.length === 3) forcedDecimals = 5;
        const padding = "0".repeat(forcedDecimals);
        decimalPart = (decimalPart + padding).substring(0, forcedDecimals);
        lonInput.value = `-${integerPart}.${decimalPart}`;
        checkRealTimeGeo();
      });
    }

    if (cpInput) {
      cpInput.addEventListener("input", () => {
        const cp = cpInput.value;
        const colSelect = document.querySelector('select[name="rc-colonia"]');
        if (cp.length === 5 && data.codigosPostales[cp]) {
          if (colSelect) {
            colSelect.innerHTML = '<option value=""></option>';
            data.codigosPostales[cp].colonias.forEach(col => {
              const opt = document.createElement("option"); opt.value = col; opt.textContent = col; colSelect.appendChild(opt);
            });
          }
        }
        checkRealTimeGeo();
      });
    }


    
    function validateGeo() {
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      const cp = document.querySelector('input[name="rc-cp"]').value;
      if (lat && lon && cp && data.codigosPostales[cp]) {
        const dbCp = data.codigosPostales[cp];
        const distancia = calcularDistanciaKm(lat, lon, parseFloat(dbCp.latitud), parseFloat(dbCp.longitud));
        const umbral = dbCp.zona === "RURAL" ? 15 : 2.5;
        if (distancia > umbral) {
          return `La distancia calculada es de ${distancia.toFixed(2)}km, lo cual excede el máximo permitido de ${umbral}km para la zona de este CP.`;
        }
      }
      return null;
    }

    let reactivacionRecords = [];

    function clearInputRow() {
      document.querySelector('input[name="rc-num-cliente"]').value = "";
      document.querySelector('input[name="rc-num-sucursal"]').value = "";
      document.querySelector('input[name="rc-razon"]').value = "";
      document.querySelector('input[name="rc-comercial"]').value = "";
      document.querySelector('input[name="rc-calle"]').value = "";
      document.querySelector('input[name="rc-numero"]').value = "";
      document.querySelector('input[name="rc-entre"]').value = "";
      document.querySelector('input[name="rc-ycalle"]').value = "";
      document.querySelector('input[name="rc-cp"]').value = "";
      document.querySelector('select[name="rc-colonia"]').innerHTML = '<option value=""></option>';
      document.querySelector('input[name="rc-lat"]').value = "";
      document.querySelector('input[name="rc-lon"]').value = "";
      document.querySelectorAll('input[name="rc-visita"]').forEach(cb => cb.checked = false);
    }

    function getCurrentRecord() {
      const numCliente = document.querySelector('input[name="rc-num-cliente"]').value;
      const numSucursal = document.querySelector('input[name="rc-num-sucursal"]').value;
      
      if (!numCliente && !numSucursal) return null; // Fila vacía
      
      let errores = [];
      const cp = document.querySelector('input[name="rc-cp"]').value;
      const colonia = document.querySelector('select[name="rc-colonia"]').value;
      const razon = document.querySelector('input[name="rc-razon"]').value;
      const calle = document.querySelector('input[name="rc-calle"]').value;
      const numero = document.querySelector('input[name="rc-numero"]').value;
      const lat = document.querySelector('input[name="rc-lat"]').value;
      const lon = document.querySelector('input[name="rc-lon"]').value;
      const plaza = document.querySelector('select[name="rc-plaza"]').value;
      const ruta = document.querySelector('select[name="rc-ruta"]').value;
      const dias = Array.from(document.querySelectorAll('input[name="rc-visita"]:checked')).map(cb => cb.value).join(",");

      if (!/^\d{5,6}$/.test(numCliente)) errores.push("NUM CLIENTE (5-6 dígitos)");
      if (!/^\d{1,3}$/.test(numSucursal)) errores.push("NUM SUCURSAL (1-3 dígitos)");
      if (!cedisGlobal.value) errores.push("SELECCIONE CEDIS (En la parte superior)");
      if (!razon.trim()) errores.push("RAZÓN SOCIAL");
      if (!calle.trim()) errores.push("CALLE");
      if (!numero.trim()) errores.push("NÚMERO");
      if (!cp || cp.length !== 5) errores.push("CÓDIGO POSTAL (5 dígitos)");
      if (!colonia) errores.push("COLONIA");
      
      if (!lat) {
        errores.push("LATITUD");
      } else if (parseFloat(lat) < 14 || parseFloat(lat) > 33) {
        errores.push("LATITUD (Debe estar en rango de México: 14 a 33)");
      }

      if (!lon) {
        errores.push("LONGITUD");
      } else if (parseFloat(lon) > -86 || parseFloat(lon) < -118) {
        errores.push("LONGITUD (Debe ser un valor negativo en rango de México: -86 a -118)");
      }

      if (!plaza) errores.push("PLAZA DIST.");

      if (errores.length > 0) {
        alert("Por favor corrija o complete los campos requeridos (*):\n- " + errores.join("\n- "));
        return false; // Error
      }

      const geoWarning = validateGeo();
      if (geoWarning) {
        if (!confirm(`Alerta Geográfica: ${geoWarning}\n¿Desea agregar este registro de todos modos?`)) {
          return false;
        }
      }

      return [
        numCliente,
        numSucursal,
        document.querySelector('input[name="rc-razon"]').value,
        document.querySelector('input[name="rc-comercial"]').value,
        document.querySelector('input[name="rc-calle"]').value,
        document.querySelector('input[name="rc-numero"]').value,
        document.querySelector('input[name="rc-cp"]').value,
        document.querySelector('select[name="rc-colonia"]').value,
        document.querySelector('input[name="rc-lat"]').value,
        document.querySelector('input[name="rc-lon"]').value,
        cedisGlobal.value,
        document.querySelector('select[name="rc-plaza"]').value,
        document.querySelector('select[name="rc-ruta"]').value,
        Array.from(document.querySelectorAll('input[name="rc-visita"]:checked')).map(cb => cb.value).join(",")
      ];
    }

    const btnAddRecord = document.getElementById("btn-add-reactivacion-record");
    if (btnAddRecord) {
      btnAddRecord.addEventListener("click", () => {
        const record = getCurrentRecord();
        if (record === false) return; // Validación falló
        if (record === null) {
          alert("La fila actual está vacía.");
          return;
        }

        reactivacionRecords.push(record);
        
        // Agregar a la tabla visual
        const tbody = document.getElementById("reactivacion-records");
        const tr = document.createElement("tr");
        record.forEach(val => {
          const td = document.createElement("td");
          td.textContent = val;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);

        // Limpiar fila de input
        clearInputRow();
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Intentar agregar el registro actual si tiene algo
        const currentRecord = getCurrentRecord();
        if (currentRecord === false) return; // Validación falló
        if (currentRecord !== null) {
          reactivacionRecords.push(currentRecord);
        }

        if (reactivacionRecords.length === 0) {
          alert("No hay registros para enviar.");
          return;
        }

        const workbook = new ExcelJS.Workbook();
        const ws = workbook.addWorksheet('Reactivaciones');
        
        // Configurar columnas y encabezados
        ws.columns = [
          { header: "ID CLIENTE", width: 15 },
          { header: "ID SUCURSAL", width: 15 },
          { header: "RAZON SOCIAL", width: 40 },
          { header: "NOMBRE COMERCIAL", width: 40 },
          { header: "CALLE", width: 30 },
          { header: "NUMERO", width: 15 },
          { header: "CP", width: 12 },
          { header: "COLONIA", width: 30 },
          { header: "LAT", width: 15 },
          { header: "LON", width: 15 },
          { header: "CEDIS", width: 25 },
          { header: "PLAZA", width: 25 },
          { header: "RUTA", width: 15 },
          { header: "DIAS VISITA", width: 20 }
        ];
        ws.getRow(1).font = { bold: true };
        
        reactivacionRecords.forEach(rec => ws.addRow(rec));

        // Proteger la hoja contra escritura
        ws.protect('alpura', {
          selectLockedCells: true,
          selectUnlockedCells: true,
          formatCells: false,
          insertRows: false,
          deleteRows: false,
          insertColumns: false,
          deleteColumns: false
        });

        const firstNum = reactivacionRecords[0][0];
        const fileName = `Reactivacion_${firstNum}_${reactivacionRecords.length}_regs.xlsx`;

        workbook.xlsx.writeBuffer().then(buffer => {
          saveAs(new Blob([buffer]), fileName);
          alert("Archivo Excel protegido descargado exitosamente.");
        }).catch(err => {
          console.error(err);
          alert("Error al generar Excel.");
        });
        
        // Limpiar todo
        reactivacionRecords = [];
        document.getElementById("reactivacion-records").innerHTML = "";
        form.reset();
        switchView("home");
      });
    }
  }

  initCambioFactura();
  initCambioCanal();
  initReactivacion();

});
