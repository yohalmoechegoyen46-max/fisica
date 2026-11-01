# Ohm Lab - Laboratorio y Simulador de la Ley de Ohm

Simulador interactivo de la Ley de Ohm con circuitos en serie, paralelo y mixto, flujo animado de electrones en tiempo real y detección de sobrecarga térmica.

---

## 🚀 ¿Por qué no funciona al hacer doble clic en `index.html`?

Este proyecto está construido con **React, TypeScript, Vite y Tailwind CSS**.
Los navegadores modernos **bloquean por motivos de seguridad (CORS)** la carga de módulos de JavaScript y TypeScript cuando se abre un archivo directamente desde el disco duro (`file:///.../index.html`).

Para ejecutar el simulador en tu computadora necesitas tener instalado [Node.js](https://nodejs.org/) (versión 18 o superior).

---

## 🛠️ Pasos para ejecutarlo en tu computadora:

### Paso 1: Abrir la terminal en la carpeta del proyecto
- Descomprime el archivo `.zip` que descargaste.
- Abre la terminal (o PowerShell / CMD) dentro de esa carpeta.

### Paso 2: Instalar las dependencias
Ejecuta el siguiente comando:
```bash
npm install
```

### Paso 3: Iniciar el servidor local
Ejecuta el comando:
```bash
npm run dev
```

### Paso 4: Abrir en el navegador
Verás un mensaje en la consola como este:
```
  VITE v...  ready in ... ms

  ➜  Local:   http://localhost:3000/
```
Abre en tu navegador la dirección **`http://localhost:3000`** (o presiona `Ctrl + Clic` en el enlace de la terminal).

---

## 📦 Crear versión para subir a la web o enviar (HTML/JS compilado):

Si quieres generar los archivos estáticos listos para subir a cualquier hosting (como Netlify, Vercel, GitHub Pages o un servidor Apache):
```bash
npm run build
```
Los archivos finales quedarán en la carpeta `dist/`. Puedes previsualizarlos localmente con:
```bash
npm run preview
```
