# Sistema de Captura de Solicitudes de Alta RTM - Alpura

Este portal web local ha sido desarrollado utilizando **HTML5, CSS3 y JavaScript** (Vanilla JS). Implementa una interfaz interactiva de alta fidelidad inspirada en la línea visual y colores institucionales de Alpura (`#084475` y `#e30613`), cumpliendo estrictamente con todas las validaciones comerciales, fiscales, geográficas y operativas del programa **RTM (Road to Market)**.

---

## 📂 Estructura del Proyecto

- `index.html`: Estructura del portal (SPA) con Menú Principal, Formulario Individual (42 campos), formularios de cortesía y plantilla de exportación.
- `styles.css`: Estilos de diseño responsivo premium, colores corporativos y maquetación de impresión.
- `app.js`: Lógica de comportamiento dinámico, bloqueo de pegado, formateadores (Latitud/Longitud), validaciones y exportación a PDF.
- `mockData.js`: Catálogos cargados de manera global (`window.ALPURA_MOCK_DATA`) con Códigos Postales, CEDIS, Canales de Venta, etc.
- `README.md`: Este archivo instructivo.

---

## 🛠️ Guía: ¿Cómo convertir tus archivos de Excel en diccionarios para la aplicación?

Para que las validaciones dinámicas utilicen tus bases de datos de Excel reales (códigos postales de México, colonias oficiales, rutas y catálogos de CEDIS), debes convertir esas tablas en objetos de JavaScript.

Aquí te mostramos los métodos más eficientes para hacerlo.

### Método A: Usando un script en Python (Recomendado y Automatizado)
Si tienes instalado Python en tu computadora, puedes usar la librería `pandas` para leer tus Excels y escribir las estructuras directamente en formato JSON.

#### 1. Instalar la dependencia
Abre tu terminal y ejecuta:
```bash
pip install pandas openpyxl
```

#### 2. Código del Script (`convertir_excel.py`)
Crea un archivo llamado `convertir_excel.py` en tu carpeta con el siguiente código y ejecútalo para exportar tus Códigos Postales a la estructura requerida:

```python
import pandas as pd
import json

# Ruta a tu archivo de Excel
EXCEL_PATH = "Codigos_Postales_RTM.xlsx"

# Leer la hoja de Excel
# Asegúrate de tener columnas llamadas: 'CP', 'Colonia', 'Estado', 'Municipio'
df = pd.read_excel(EXCEL_PATH)

# Limpiar espacios en blanco de los textos
df = df.astype(str).apply(lambda x: x.str.strip().str.upper())

codigos_postales_dict = {}

for _, fila in df.iterrows():
    cp = fila['CP']
    colonia = fila['Colonia']
    estado = fila['Estado']
    municipio = fila['Municipio']
    
    if cp not in codigos_postales_dict:
        codigos_postales_dict[cp] = {
            "estado": estado,
            "municipio": municipio,
            "colonias": []
        }
    
    # Agregar colonia si no se ha registrado aún para este CP
    if colonia not in codigos_postales_dict[cp]["colonias"]:
        codigos_postales_dict[cp]["colonias"].append(colonia)

# Guardar a un archivo JavaScript
with open("cp_data.js", "w", encoding="utf-8") as f:
    f.write("const cpCatalog = ")
    json.dump(codigos_postales_dict, f, ensure_ascii=False, indent=2)
    f.write(";")

print("Conversión completada con éxito. Revisa el archivo 'cp_data.js'.")
```

Una vez que tengas `cp_data.js`, puedes copiar su contenido y pegarlo dentro de la propiedad `codigosPostales` en [mockData.js](file:///c:/Users/Dell/Documents/clientesAlpura/mockData.js).

---

### Método B: Usando Convertidores Online
Si no deseas usar código, puedes hacer la conversión de la siguiente manera:
1. Copia las columnas de tu hoja de Excel.
2. Entra a un sitio web de conversión gratuita como [TableConvert](https://tableconvert.com/excel-to-json) o [JSON-Generator](https://json-generator.com/).
3. Pega tus datos y selecciona la exportación en formato **JSON**.
4. Modifica la estructura resultante para que encaje con la de [mockData.js](file:///c:/Users/Dell/Documents/clientesAlpura/mockData.js):

#### Estructura esperada para Códigos Postales:
```javascript
"CÓDIGO_POSTAL": {
  "estado": "NOMBRE DEL ESTADO",
  "municipio": "ALCALDÍA O MUNICIPIO",
  "colonias": ["COLONIA 1", "COLONIA 2", "COLONIA 3"]
}
```

#### Estructura esperada para CEDIS/Plazas/Rutas:
```javascript
"NOMBRE_CEDIS": {
  "plazas": ["PLAZA 1", "PLAZA 2"],
  "rutas": ["RUTA 1", "RUTA 2"]
}
```

#### Estructura esperada para Canales de Venta / Giros:
```javascript
"CANAL_VENTA": {
  "macrocanal": "MACROCANAL CORRESPONDIENTE",
  "canalIbp": "CANAL IBP CORRESPONDIENTE",
  "giros": ["GIRO 1", "GIRO 2"],
  "agrupaciones": ["AGRUPACIÓN 1", "AGRUPACIÓN 2"],
  "gruposComerciales": ["GRUPO 1", "GRUPO 2"],
  "agrupacionesIbp": ["AGR_IBP_1", "AGR_IBP_2"]
}
```

---

## ⚡ Cómo Ejecutar la Aplicación Localmente
1. Abre una terminal en la carpeta raíz (`c:\Users\Dell\Documents\clientesAlpura`).
2. Levanta un servidor de desarrollo simple con `npx` (para evitar restricciones del navegador al importar librerías o para un flujo de prueba perfecto):
   ```powershell
   npx -y serve .
   ```
3. Alternativamente, puedes hacer doble clic sobre el archivo [index.html](file:///c:/Users/Dell/Documents/clientesAlpura/index.html) para abrirlo directamente en tu navegador habitual, ya que todo el sistema y la base de datos simulada están diseñados para operar de forma 100% offline.
