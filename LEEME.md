# Trial Revolution — App de Jueces

Aplicación independiente para que los jueces puntúen las zonas desde el móvil.

Va en **su propio repositorio**, separada de la web pública de resultados. El motivo
no es organizativo: si conviven en la misma dirección, la PWA de resultados se
"traga" esta página y el móvil acaba mostrando versiones antiguas.

---

## Publicar por primera vez

1. En GitHub, crea un repositorio **público** llamado `Trial_Revolution_Jueces`.
2. Sube estos tres ficheros a la raíz:
   - `index.html`
   - `manifest.json`
   - `sw.js`
3. Sube también el logo `trialrev.png` (el mismo del repo de resultados).
4. Entra en **Settings → Pages** y activa Pages sobre la rama `main`, carpeta `/ (root)`.
5. En un par de minutos la app estará en:

   ```
   https://CronoRevolution.github.io/Trial_Revolution_Jueces/
   ```

> Si usas otro nombre de repositorio, escríbelo en el cronómetro:
> pestaña **📡 Jueces → Repositorio de la app de jueces**.

---

## Uso en carrera

En el cronómetro, pestaña **📡 Jueces**:

1. Escribe la contraseña de la carrera y pulsa **Guardar y publicar**.
2. Pulsa **📤 Enviar pilotos a los jueces**.
3. Pulsa **🔗 Enlace y QR** e imprime la hoja: lleva el QR y la contraseña.

Cada juez escanea el QR, elige **su zona**, escribe la contraseña y entra.
Si dos móviles eligen la misma zona, el segundo recibe un aviso y debe confirmar.

---

## Instalarla como aplicación

Con la página abierta en Chrome: menú **⋮ → Añadir a pantalla de inicio**.
Queda como una app llamada **TR Juez**, sin barra de navegador.

---

## Si un móvil muestra una versión antigua

En la pantalla de acceso, abajo, aparece el número de versión. Si no coincide
con la que acabas de publicar:

1. Ajustes de Chrome → Configuración de sitios → borrar datos de
   `cronorevolution.github.io`.
2. Volver a abrir el enlace añadiendo `?v=2` al final.

---

## Actualizar la app

Sube el `index.html` nuevo al repositorio y cambia el número de versión que
aparece en la pantalla de acceso. Como no se cachea nada, con recargar basta.
