// =============================================================================
// mockData.js — Base de datos local de catálogos para el Portal RTM Alpura
// =============================================================================
// Este archivo define los catálogos estáticos (CEDIS, canales de venta, listas
// auxiliares, regímenes fiscales, etc.) y carga dinámicamente el catálogo
// completo de códigos postales desde el archivo geoSEPOMEX.json.
//
// La estructura se expone como objeto global `window.ALPURA_MOCK_DATA` y es
// consumida por app.js a través de:
//   const data = window.ALPURA_MOCK_DATA;
//
// Propiedades esperadas por app.js:
//   data.tiposCliente           → Array de strings
//   data.formasPago             → Array de strings
//   data.tiposFactura           → Array de strings
//   data.gruposConcentradores   → Array de strings
//   data.zonasCobranza          → Array de strings
//   data.responsablesCobranza   → Array de strings
//   data.tiposEntrega           → Array de strings
//   data.regionalesResponsables → Array de strings
//   data.zonasNielsen           → Array de strings
//   data.clasificacionesInternas→ Array de strings
//   data.segmentacionesMercado  → Array de strings
//   data.tiposCuenta            → Array de strings
//   data.cedis                  → Objeto { "NOMBRE_CEDIS": { plazas: [...], rutas: [...] } }
//   data.canalesVenta           → Objeto { "CANAL": { macrocanal, canalIbp, giros, agrupaciones, gruposComerciales, agrupacionesIbp } }
//   data.regimenesFiscales      → Objeto { "RÉGIMEN": ["USO CFDI 1", ...] }
//   data.codigosPostales        → Objeto { "XXXXX": { estado, municipio, colonias: [...] } }
// =============================================================================

window.ALPURA_MOCK_DATA = {

  // =========================================================================
  // CENTROS DE DISTRIBUCIÓN (CEDIS)
  // Cada CEDIS contiene sus plazas de distribución y rutas disponibles.
  // Al seleccionar un CEDIS, app.js filtra las plazas y rutas correspondientes.
  // =========================================================================
  cedis: {},

  // =========================================================================
  // CANALES DE VENTA Y ESTRUCTURA COMERCIAL
  // Al seleccionar un Canal de Venta, app.js auto-rellena los campos
  // bloqueados (Macrocanal y Canal de Venta IBP) y filtra dinámicamente
  // los dropdowns de Giro, Agrupación de Clientes, Grupo Comercial y
  // Agrupación IBP.
  // =========================================================================
  canalesVenta: {},

  // =========================================================================
  // LISTAS AUXILIARES PARA SELECTORES ESTÁTICOS
  // Cada propiedad corresponde a un dropdown del formulario individual.
  // =========================================================================

  // Tipo de Cliente: Define si el cliente opera a contado o crédito
  tiposCliente: ["CONTADO", "CREDITO INTERNO", "CREDITO CORPORATIVO"],

  // Forma de Pago: Mecanismo de liquidación del cliente
  formasPago: [
    "01 - EFECTIVO",
    "02 - CHEQUE NOMINATIVO",
    "03 - TRANSFERENCIA ELECTRÓNICA",
    "05 - MONEDERO ELECTRÓNICO",
    "06 - DINERO ELECTRÓNICO",
    "07 - TARJETA DE CREDITO",
    "08 - VALES DE DESPENSA",
    "13 - PAGO POR SUBROGACIÓN",
    "17 - COMPENSACIÓN",
    "27 - A SATISFACCIÓN DEL ACREEDOR",
    "28 - TARJETA DE DÉBITO",
    "29 - TARJETA DE SERVICIO",
    "99 - POR DEFINIR"
  ],

  // Tipo de Factura: Modalidad de facturación del cliente
  tiposFactura: [
    "INDIVIDUAL",
    "GLOBAL",
    "CONCENTRADA"
  ],

  // Grupos Concentradores: Agrupación de clientes para cobranza centralizada
  gruposConcentradores: [
    "7 ELEVEN",
    "ALIANZAS ESTRATEGICAS",
    "ARTELI",
    "AVIC. CUERA",
    "BISQUETS CORPORATIVO",
    "BISQUETS FRANQUICIA",
    "CAFÉ PUNTA DEL CIELO",
    "CAFE VICTORIA(JAROCHOS)",
    "CAFETERIA EL JAROCHO",
    "CASA DE LOS ABUELOS",
    "CASA LEY",
    "CCOXXO BARA MEXICO",
    "CCOXXO CANCUN",
    "CCOXXO MÉXICO",
    "CCOXXO -PUEBLA",
    "CCOXXO SLP",
    "CCOXXO TAMPICO",
    "CCOXXO TOLUCA",
    "CCOXXO VILLAHERMOSA",
    "CCOXXO - ACAPULCO",
    "CCOXXO - BARA LEON",
    "CCOXXO - CD SALTILLO",
    "CCOXXO - CEDIS CD OBREGON (SON)",
    "CCOXXO - CEDIS GUADALAJARA(JAL)",
    "CCOXXO - CEDIS LEON (GTO)",
    "CCOXXO - CEDIS REYNOSA (TAMPS)",
    "CCOXXO - COATZACOALCOS",
    "CCOXXO - CUERNAVACA",
    "CCOXXO - HIDALGO",
    "CCOXXO - LEON GTO",
    "CCOXXO - MÉRIDA",
    "CCOXXO - MORELIA",
    "CCOXXO - OAXACA",
    "CCOXXO - POZA RICA",
    "CCOXXO - QUERETARO",
    "CCOXXO - TUXTLA GTZ",
    "CCOXXO - VERACRUZ",
    "CHEDRAUI",
    "CODIGO ALIMENTARIO",
    "COM CITY FRESKO",
    "COM. BORIS",
    "COM. MEXICANA",
    "COMA",
    "CONSIGNACION",
    "CONSUMO Z",
    "COSTCO",
    "CRODA",
    "CTAS DIFICIL RECUPERACION",
    "CTES B2B CONTADO",
    "CTES CREDITO 0 DIAS",
    "DESPACHO JURIDICO EXTERNO",
    "DIST. 2000",
    "DISTRIBUIDORES (NO USAR)",
    "DLM USA ENTERPRISES",
    "ENV. CEREALES",
    "EXCEDENTES DE PRODUCTO",
    "EXTRA",
    "FARMATODO",
    "FILIALES",
    "FRAGUA",
    "FUTURAMA",
    "GARCES",
    "GARIS",
    "GEPP",
    "GIORNALE",
    "GOBIERNO",
    "GPO ALIANZA",
    "GPO ALSEA",
    "GPO ALSEA (FRANQ)",
    "GPO BAFAR",
    "GPO CARAJILLO",
    "GPO CAROLO",
    "GPO CENTRAL ABC (SOLO C.I.)",
    "GPO DECASA",
    "GPO DELIMART",
    "GPO DICONSA",
    "GPO ESPIGAS",
    "GPO GARABATOS",
    "GPO GO MART",
    "GPO GUDIÑO",
    "GPO HIPODROMO",
    "GPO HOTELES VIDANTA",
    "GPO IBARRA",
    "GPO KOSMOS",
    "GPO LA FURIA",
    "GPO LA GRAN BODEGA(RIVERA)",
    "GPO LA VIOLETA",
    "GPO LINCE",
    "GPO LIVERPOOL",
    "GPO MERA",
    "GPO MERZA (DUERO)",
    "GPO PUMA",
    "GPO RIVERA",
    "GPO SANCHEZ",
    "GPO SCORPION",
    "GPO SMART",
    "GPO SUPER ROLA",
    "GPO TOKS",
    "GPO TRANSCOMER",
    "GPO WINGS",
    "GPO ZORRO",
    "GRAN D",
    "GRUPO POSADAS (FIESTA AMERICANA)",
    "GRUPO VILLAMARIA",
    "HEB",
    "HOTELES HYATT",
    "HOTELES RIU",
    "IMSS",
    "MA SOCORRO",
    "MAYORISTAS (SOLO C.I.)",
    "NO EXISTE",
    "OTROS INGRESOS",
    "OTROS INGRESOS(MAITE HERRERO)",
    "OXXO FORMATO CEDIS",
    "PAN HISPANO SN JOSE",
    "PANADERÍAS",
    "PEDRERO",
    "POLVO",
    "PROPASA",
    "SAMOROSU",
    "SANBORN",
    "SARDINERO",
    "SN FCO ASIS",
    "SOCIOS",
    "SORIANA (DIFMOR)",
    "SPORT CITY",
    "SUPER PRECIO",
    "SUPERISSSTE",
    "TACO HOLDING(KRISPY KREME)",
    "TDAS SORIANA",
    "TETRA PAK",
    "TRANSFERENCIAS",
    "TRES B",
    "TURNADO JURIDICO",
    "WALMART (CEDIS FRÍOS)",
    "WALMART (CEDIS SECOS)",
    "WALMART (SAMS)",
    "WALMART (TIENDAS)",
    "WALDOS"
  ],

  // Zonas de Cobranza: Área geográfica para la gestión de cobranza
  zonasCobranza: [
    "CRÉDITO Y COBRANZA",
    "NO APLICA"
  ],

  // Responsable de Cobranza: Gestor asignado para la cobranza del cliente
  responsablesCobranza: [
    "NO DEFINIDO",
    "NAYELI GÓMEZ CRUZ",
    "TANIA MORIN CARRANZA",
    "ROSALIA MARTINEZ JIMENEZ",
    "JOSUE CRUZ ALVARADO",
    "SAUL DELGADO FUENTES",
    "MA CONSUELO PANDIELLO RIVERA",
    "DELICIAS",
    "ISRAEL RIVERA LEON",
    "ESTHER MEDINA VALDEZ",
    "EDGAR DEL BOSQUE RAMIREZ",
    "MAGDALENA CASTILLO REYES",
    "ALEJANDRA LOPEZ RODRIGUEZ",
    "CAD. COM. OXXO CTA PTE",
    "OXXO EXPRESS CTA PTE",
    "SANBORN CTA PTE",
    "PAM PAM CTA PTE",
    "ADM. INT. ALIM. CTA. PTE",
    "ABOGADOS (EN JURÍDICO)",
    "DIONICIA SEBASTIAN REYES",
    "MARISELA PEREZ GARRIDO",
    "MARISOL VEGA ESTRADA",
    "ISRAEL HERNANDEZ"
  ],

  // Tipo de Entrega: Modalidad logística de entrega del producto
  tiposEntrega: [
    "CEDIS",
    "MACROCEDIS",
    "DISTRIBUIDORES"
  ],

  // Regionales Responsables: División regional de la operación comercial
  regionalesResponsables: [
    "REGION I - PACIFICO",
    "REGION II - NORESTE",
    "REGION III - BAJIO",
    "REGION IV - CENTRO",
    "REGION V - VDM",
    "REGION VI - SURESTE",
    "EXPORTACIÓN",
    "B2B",
    "GOBIERNO",
    "CUENTAS KAM",
    "NO APLICA"
  ],

  // Zonas Nielsen: Segmentación geográfica estándar de mercados Nielsen
  zonasNielsen: [
    "REGION I - PACIFICO",
    "REGION II - NORESTE",
    "REGION III - BAJIO",
    "REGION IV - CENTRO",
    "REGION V - VDM",
    "REGION VI - SURESTE",
    "NO APLICA"
  ],

  // Clasificación Interna: Nivel de importancia del cliente para Alpura
  clasificacionesInternas: [
    "AAA",
    "AA",
    "A",
    "B",
    "C",
    "D",
    "NO APLICA"
  ],

  // Segmentación de Mercado: Clasificación del mercado objetivo
  segmentacionesMercado: [
    "DIAMANTE",
    "ORO",
    "PLATA",
    "BRONCE",
    "NO APLICA"
  ],

  // Tipo de Cuenta: Clasificación de cuenta contable del cliente
  tiposCuenta: [
    "REGIONAL",
    "NACIONAL",
    "INTERNACIONAL"
  ],

  // =========================================================================
  // REGÍMENES FISCALES Y USOS DE CFDI
  // La relación es jerárquica: al seleccionar un Régimen Fiscal, se filtran
  // los Usos de CFDI disponibles para ese régimen.
  // Si Tipo de Factura = "GLOBAL", se fuerza "SIN EFECTOS FISCALES" en ambos.
  // =========================================================================
  regimenesFiscales: {
    "601 - GENERAL DE LEY PERSONAS MORALES": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "603 - PERSONAS MORALES CON FINES NO LUCRATIVOS": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "605 - SUELDOS Y SALARIOS E INGRESOS ASIMILADOS A SALARIOS": [
      "S01 - SIN EFECTOS FISCALES"
    ],
    "612 - PERSONAS FISICAS CON ACTIVIDADES EMPRESARIALES Y PROFESIONALES": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "621 - INCORPORACION FISCAL": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "622 - ACTIVIDADES AGRICOLAS, GANADERAS, SILVICOLAS Y PESQUERAS": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "623 - OPCIONAL PARA GRUPOS DE SOCIEDADES": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "625 - ACTIVIDADES EMPRESARIALES CON INGRESOS A TRAVES DE PLATAFORMAS TECNOLOGICAS": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "626 - REGIMEN SIMPLIFICADO DE CONFIANZA (RESICO)": [
      "G01 - ADQUISICION DE MERCANCIAS",
      "G03 - GASTOS EN GENERAL",
      "S01 - SIN EFECTOS FISCALES"
    ],
    "616 - SIN OBLIGACIONES FISCALES": [
      "S01 - SIN EFECTOS FISCALES"
    ],
  }
};


// =============================================================================
// CARGA DINÁMICA ASÍNCRONA DE CATÁLOGOS DESDE ARCHIVOS JSON
// =============================================================================
// Para evitar bloquear la interfaz de usuario en redes lentas, se utiliza
// carga asíncrona mediante fetch() y Promise.all() para obtener los tres
// catálogos en paralelo. Al finalizar, se oculta el spinner y se emite
// un evento para que app.js inicialice la aplicación.
// =============================================================================

window.ALPURA_DATA_PROMISE = Promise.all([
  fetch('geoSEPOMEX.json').then(res => res.json()).catch(err => {
    console.error('Error fetching geoSEPOMEX.json:', err);
    return {};
  }),
  fetch('clasifComercial.json').then(res => res.json()).catch(err => {
    console.error('Error fetching clasifComercial.json:', err);
    return {};
  }),
  fetch('cedisRutas.json').then(res => res.json()).catch(err => {
    console.error('Error fetching cedisRutas.json:', err);
    return {};
  }),
  fetch('diccionarioAbreviaturas.json').then(res => res.json()).catch(err => {
    console.error('Error fetching diccionarioAbreviaturas.json:', err);
    return {};
  })
])
  .then(function (results) {
    var datosCodigosPostales = results[0] || {};
    var datosClasificacion = results[1] || {};
    var datosCedis = results[2] || {};
    var datosAbreviaturas = results[3] || {};

    // 0. Procesar Abreviaturas
    window.ALPURA_MOCK_DATA.abreviaturas = datosAbreviaturas;

    // 1. Procesar Códigos Postales
    var catalogoCP = {};
    Object.keys(datosCodigosPostales).forEach(function (codigoPostal) {
      var entrada = datosCodigosPostales[codigoPostal];
      var municipio = entrada.municipio || entrada.alcaldia || '';
      catalogoCP[codigoPostal] = {
        estado: entrada.estado || '',
        municipio: municipio,
        colonias: Array.isArray(entrada.colonias) ? entrada.colonias : [],
        latitud: entrada.latitud || null,
        longitud: entrada.longitud || null,
        zona: entrada.zona || "URBANA"
      };
    });
    window.ALPURA_MOCK_DATA.codigosPostales = catalogoCP;

    // 2. Procesar Clasificación Comercial
    window.ALPURA_MOCK_DATA.canalesVenta = datosClasificacion;

    // 3. Procesar CEDIS y Rutas
    var catalogoCedis = {};
    Object.keys(datosCedis).forEach(function (key) {
      var entrada = datosCedis[key];
      var plazas = Array.isArray(entrada.plazas) ? entrada.plazas : (entrada.plazas ? [entrada.plazas] : []);
      var rutas = Array.isArray(entrada.rutas) ? entrada.rutas : (entrada.rutas !== undefined && entrada.rutas !== null ? [String(entrada.rutas)] : []);
      rutas = rutas.map(String);
      catalogoCedis[key] = {
        plazas: plazas,
        rutas: rutas,
        tipoEntrega: entrada.tipoEntrega || "",
        regionalResponsable: entrada.regionalResponsable || "",
        zonaNielsen: entrada.zonaNielsen || ""
      };
    });
    window.ALPURA_MOCK_DATA.cedis = catalogoCedis;

    console.log('mockData.js: Catálogos cargados exitosamente.');

    // Ocultar overlay de carga
    var overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }

    // Despachar evento para notificar a app.js que los datos están listos
    document.dispatchEvent(new Event('alpuraDataLoaded'));
  });
