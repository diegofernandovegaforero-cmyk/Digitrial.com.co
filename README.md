# Digitrial Website - Next.js

Este proyecto es una aplicación web moderna construida con **Next.js 15**, **Tailwind CSS** y **TypeScript**. Ha sido diseñada para ser desplegada fácilmente en plataformas como **Railway** o **Vercel**.

## Requisitos Previos

Para ejecutar este proyecto localmente, necesitas tener instalado:

- **Node.js** (versión 18 o superior)
- **npm** (normalmente viene con Node.js)

## Instalación y Ejecución

Sigue estos pasos para levantar el proyecto en tu máquina local:

1.  **Instalar dependencias**:
    Abre una terminal en la carpeta del proyecto y ejecuta:
    ```bash
    npm install
    ```

2.  **Ejecutar el servidor de desarrollo**:
    Una vez instaladas las dependencias, inicia el servidor:
    ```bash
    npm run dev
    ```

3.  **Ver el sitio**:
    Abre tu navegador y ve a [http://localhost:3000](http://localhost:3000).

## Estructura del Proyecto

- `app/`: Contiene las páginas y el layout principal (App Router).
- `components/`: Componentes reutilizables (Navbar, Hero, Services, etc.).
- `app/api/contact/`: Ruta de API para el formulario de contacto.
- `public/`: Archivos estáticos.

## Despliegue en Railway

1.  Sube este código a un repositorio de GitHub.
2.  Crea un nuevo proyecto en Railway.
3.  Selecciona "Deploy from GitHub repo".
4.  Railway detectará automáticamente que es un proyecto Next.js y lo construirá.

## Características

- **Diseño Responsivo**: Adaptado a móviles y escritorio.
- **Optimización de Imágenes**: Uso de `next/image` con dominios configurados.
- **Iconos**: `lucide-react` para iconos modernos y ligeros.
- **Backend API**: Ruta lista para integrar servicios de email.
