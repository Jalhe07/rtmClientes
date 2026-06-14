# Plan de Implementación: Formulario de Registro de Clientes RTM Alpura

Este plan detalla el diseño y desarrollo de una aplicación web local (HTML, CSS y JS) para el registro de clientes de Alpura (individual, masivo y sucursales) bajo la iniciativa "RTM - Road to Market". La aplicación incluye validaciones avanzadas, flujos dinámicos basados en la selección del usuario y exportación en formato PDF tamaño A4.

---

## Diseño Visual y Estilos (Basado en Alpura)
- **Paleta de Colores**:
  - Azul Institucional Alpura: `#084475` (como color primario para botones, cabeceras y énfasis).
  - Azul Claro / Acentos de Fondos: `#F0F4F8` para las secciones.
  - Colores de Celdas Especiales (según la imagen provista):
    - Campos de facturación (RFC, Régimen, Uso CFDI): `#FDF4C5` (Amarillo pálido / Naranja claro).
    - Campos de cobranza (Límite, Concentrador, Cobranza, Días de pago): `#D0E1F9` (Azul grisáceo / Pastel).
    - Campos bloqueados/sombreados (Entre Calle, Y Calle): `#E9ECEF` (Gris claro).
- **Tipografía**: Fuente limpia y moderna tipo *Outfit* o *Inter* de Google Fonts para dar un acabado premium.
- **Animaciones**: Transiciones suaves (`transition: all 0.3s ease`) en botones, campos interactivos y al cambiar entre pantallas.
- **Logotipos**:
  - Logo Alpura: Un SVG estilizado que recrea el logo oficial de Alpura (rectángulo azul con bordes redondeados y texto "alpura").
  - Logo RTM: Un SVG moderno alusivo al Road to Market con una ruta, un camión/tienda y texto "RTM Road to Market - Registro de Clientes".

---

## Arquitectura de la Aplicación (Single Page App - SPA)
Para una ejecución ágil y sin necesidad de configurar un servidor complejo, estructuraremos la app como un SPA responsivo con las siguientes vistas principales:
1. **Menú de Inicio**: Pantalla de bienvenida con los logotipos prominentes y tres botones con transiciones premium:
   - REGISTRO CLIENTE INDIVIDUAL
   - REGISTRO DE SUCURSAL
   - REGISTRO MASIVO
2. **Formulario de Registro Individual**: Estructurado en bloques idénticos a los de la imagen, con doble borde de sección, validaciones en tiempo de ejecución y controles al final para "GENERAR SOLICITUD", "LIMPIAR" y "REGRESAR".
3. **Registro de Sucursal** (Vista de cortesía interactiva).
4. **Registro Masivo** (Vista de cortesía interactiva).

---

## Validaciones y Reglas de Negocio

### Generales
1. **Bloqueo de Pegado**: Se interceptará el evento `paste` en todos los inputs y se cancelará para obligar a la captura manual.
2. **Forzar Mayúsculas/Minúsculas**:
   - Correo electrónico (`type="email"`): Se convertirá automáticamente a minúsculas (`toLowerCase()`) en el evento `input`.
   - Resto de los campos de texto: Se convertirá automáticamente a mayúsculas (`toUpperCase()`) en el evento `input`.
3. **Caracteres Especiales**:
   - Por defecto: Se bloquearán caracteres especiales y acentos en el evento `keypress` y se limpiarán en `input`. Sólo se permitirá la letra `Ñ`, letras estándar de la A a la Z, números del 0 al 9 y espacios.
   - Campo "NÚMERO": Se permitirá el carácter especial `/` para admitir valores como `S/N`.
   - Campo "eMAIL": Se permitirán los caracteres normales de correo (`@`, `.`, `_`, `-`, `+`).
   - Latitud/Longitud: Se permitirán `-`, `.` y números.

### Específicas por Campo
- **CÓDIGO POSTAL**: Entrada estrictamente numérica de 5 dígitos. Al completarse, se consulta una base de datos local (Mock DB). Si existe, auto-completa los campos bloqueados: **ESTADO**, **ALCALDÍA o MUNICIPIO** y actualiza el dropdown de **COLONIA** con las opciones correspondientes.
- **ESTADO** y **ALCALDÍA o MUNICIPIO**: Elementos con atributo `readonly` para evitar edición manual. Estilo visual de campo bloqueado.
- **LATITUD**: Al perder el foco (`blur`), valida y formatea el valor a exactamente 6 decimales (`##.000000`). Trunca si hay de más, rellena con ceros si hay de menos.
- **LONGITUD**: Al perder el foco (`blur`), valida y formatea:
  - Formato `-##.000000` (2 dígitos enteros antes del punto, fuerza 6 decimales).
  - Formato `-###.00000` (3 dígitos enteros antes del punto, fuerza 5 decimales).
- **TELEFONO**: Estrictamente numérico de exactamente 10 dígitos.
- **RFC**: Expresión regular para validar 12 o 13 caracteres: `^[A-ZÑ]{3,4}\d{6}[A-Z0-9]{3}$`.
- **TIPO DE FACTURA, RÉGIMEN FISCAL y USO DE CFDI**:
  - Si Tipo de Factura = "GLOBAL", entonces Régimen Fiscal se fuerza a "SIN EFECTOS FISCALES" y Uso de CFDI se fuerza a "SIN EFECTOS FISCALES" y se bloquean temporalmente.
  - Relación dinámica: El Uso de CFDI disponible se filtrará según el Régimen Fiscal seleccionado.
- **DÍAS DE PAGO**: Menú multiselección responsivo y limpio (Lunes a Sábado).
- **CEDIS, PLAZA y RUTA**:
  - La Plaza de Distribución y las Rutas disponibles se actualizarán automáticamente según el CEDIS asignado.
- **DÍAS DE VISITA**: Ubicado al lado de RUTA. Conjunto de checkboxes horizontales (L, M, MR, J, V, S).
- **CANAL DE VENTA, MACROCANAL y CANAL DE VENTA IBP**:
  - Al seleccionar el Canal de Venta, se auto-rellenan de forma bloqueada: Macrocanal y Canal de Venta IBP.
  - Se filtran de forma dinámica los dropdowns correspondientes a: **GIRO**, **AGRUPACIÓN DE CLIENTES**, **GRUPO COMERCIAL** y **AGRUPACIÓN IBP**.

---

## Generación de PDF (A4)
- Utilizaremos `html2pdf.js` cargado vía CDN para generar el PDF directamente en el cliente.
- Para lograr un PDF de calidad profesional y que se parezca 100% al formulario impreso de la imagen, crearemos un contenedor HTML oculto (`@media print` o `display:none` absoluto) que renderice un clon del formulario usando tablas o CSS Grid estrictamente formateados para coincidir con la cuadrícula de la imagen original.
- Al hacer clic en "GENERAR SOLICITUD", el script:
  1. Validará que todos los campos requeridos estén llenos.
  2. Rellenará el clon HTML del PDF con los datos capturados.
  3. Ejecutará `html2pdf()` configurado en tamaño A4, márgenes de 10mm, y orientación horizontal o vertical según convenga (la imagen es horizontal/landscape, por lo que usaremos orientación horizontal `landscape` para maximizar legibilidad).
  4. Descargará el archivo automáticamente con el nombre `Solicitud_Registro_RTM_[NombreComercial].pdf`.

---

## Preguntas y Decisiones Clave para el Usuario
> [!NOTE]
> Por favor, revisa los siguientes puntos y confirma si estás de acuerdo:
> 1. **Datos de Muestra (Excel)**: He preparado una base de datos mock inicial con varios Códigos Postales, Colonias, CEDIS, Canales de Venta, etc., para que el formulario funcione de inmediato. ¿Deseas que incluya un apartado instructivo al final de este plan explicando paso a paso cómo puedes exportar tus Excels a formato JSON para agregarlos tú mismo?
> 2. **Formato del PDF**: La imagen del formulario está en formato horizontal (landscape). El PDF generado en tamaño A4 horizontal coincidirá exactamente con esta estructura para que sea idéntico. ¿Prefieres que sea horizontal, o requieres una versión adaptada en vertical? (Se recomienda Horizontal).

---

## Estructura de Archivos Propuesta
El proyecto se creará en la raíz del espacio de trabajo con la siguiente estructura:
```
clientesAlpura/
│
├── index.html          # Estructura de la aplicación SPA
├── styles.css          # Estilos premium, animaciones y diseño responsivo
├── app.js              # Controlador principal, validaciones y exportación de PDF
├── mockData.js         # Base de datos local (CPs, Colonias, CEDIS, Canales)
└── README.md           # Instrucciones de uso e instrucciones para importar Excels
```

---

## Plan de Verificación

### Pruebas Manuales
- [ ] Verificar bloqueo de pegado en todos los campos.
- [ ] Validar que las minúsculas se fuercen solo en el correo y mayúsculas en el resto.
- [ ] Comprobar que solo la Ñ sea admitida como carácter especial, y `/` en el número.
- [ ] Probar validaciones de formato de Latitud y Longitud en el evento `blur`.
- [ ] Probar cambio de Tipo de Factura a "GLOBAL" y verificar que se fuercen y bloqueen el Régimen y Uso CFDI a "SIN EFECTOS FISCALES".
- [ ] Generar el PDF y revisar que el diseño coincida con la imagen provista y se ajuste a la hoja A4 horizontal.
- [ ] Probar el botón de Limpiar Datos.
- [ ] Probar la navegación al Menú Principal.
