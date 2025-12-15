# 🌌 Mini Red Social Intergaláctica

Este es un proyecto simple de una mini red social creado con HTML, CSS (un diseño futurista tipo "cyberpunk/espacial") y JavaScript, utilizando **Supabase** como backend en tiempo real para la gestión de datos (publicaciones y likes).

El proyecto simula una plataforma donde los usuarios pueden publicar mensajes, dar "me gusta" a las publicaciones y gestionar sus propios posts (editar/eliminar) tras identificarse con un nombre de usuario.

## ✨ Características Principales

* **Autenticación Simple:** Identificación mediante un nombre de usuario almacenado en `localStorage`.
* **Publicación de Contenido:** Los usuarios pueden escribir y publicar nuevos mensajes.
* **Interacción en Tiempo Real:**
    * Uso de **Supabase Realtime** para actualizar el contador de likes en **todos los clientes conectados** al instante.
    * La lista de publicaciones se actualiza automáticamente (mediante `fetchPosts()` general) cuando se crea, edita o elimina un post.
* **Persistencia de Datos:** Utiliza una base de datos PostgreSQL alojada en Supabase para almacenar posts, autores y likes.
* **Gestión de Posts:** Un usuario solo puede **Editar** o **Eliminar** sus propias publicaciones.
* **Filtros:** Se pueden ordenar las publicaciones por:
    * Más recientes (por defecto).
    * Más antiguos.
    * Más likes.
* **Diseño:** Interfaz visual con temática oscura/futurista (estilo **Orbitron**).

## 🛠️ Tecnologías Utilizadas

* **Frontend:**
    * HTML5
    * CSS3 (Diseño con variables CSS y tema oscuro/futurista)
    * JavaScript (ES6+)
* **Backend & Base de Datos:**
    * **Supabase:** Utilizado para la base de datos PostgreSQL y la funcionalidad Realtime.
    * `@supabase/supabase-js`: SDK oficial de Supabase para la conexión y manipulación de datos.

## 🚀 Instalación y Uso

Para ejecutar este proyecto localmente, necesitarás configurar tu propia instancia de Supabase.

1.  **Clonar el Repositorio:**
    ```bash
    git clone [https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories](https://docs.github.com/es/repositories/creating-and-managing-repositories/quickstart-for-repositories)
    cd MINI\ RED\ SOCIAL
    ```

2.  **Configuración de Supabase:**
    * Crea un nuevo proyecto en Supabase.
    * Crea una tabla llamada `posts` con las siguientes columnas:
        * `id` (int8 - Primary Key, Identity)
        * `created_at` (timestamptz - default: `now()`)
        * `text` (text)
        * `author` (text)
        * `likes` (int4 - default: `0`)
    * Asegúrate de que el **Realtime** esté habilitado para la tabla `posts`.

3.  **Actualizar las Credenciales:**
    * Abre el archivo `app.js`.
    * Reemplaza `supabaseUrl` y `supabaseKey` con las URL y la clave `anon` de tu proyecto Supabase (las encontrarás en la sección de 'Settings' -> 'API').

    ```javascript
    const supabaseUrl = 'TU_SUPABASE_URL';
    const supabaseKey = 'TU_SUPABASE_KEY';
    ```

4.  **Abrir la Aplicación:**
    * Simplemente abre el archivo `index.html` en tu navegador.
    * Alternativamente, usa una extensión de servidor local como Live Server en VS Code.
