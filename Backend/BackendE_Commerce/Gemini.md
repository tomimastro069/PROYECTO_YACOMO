# Gemini - Convenciones y Permisos del Backend

Este documento define las convenciones para la creación de endpoints y la matriz de permisos de la API. El objetivo es mantener un código limpio, predecible y seguro.

## 1. Convención de Endpoints (RESTful)

Todos los endpoints deben seguir una estructura basada en recursos.

**Formato General:** `/api/{recurso}/{identificador}`

*   `/api`: Prefijo global para todas las rutas de la API.
*   `{recurso}`: Nombre del recurso en plural y minúsculas (ej: `productos`, `ventas`, `usuarios`).
*   `{identificador}`: (Opcional) El ID único del recurso específico (ej: `/api/productos/12`).

Las acciones (crear, obtener, actualizar, borrar) se representan mediante los métodos HTTP estándar.

*   **GET**: Para obtener uno o más recursos.
*   **POST**: Para crear un nuevo recurso.
*   **PUT / PATCH**: Para actualizar un recurso existente.
*   **DELETE**: Para eliminar un recurso.

## 2. Matriz de Permisos

La autorización se gestiona de forma centralizada en `SecurityConfig`. La siguiente tabla es la fuente de verdad sobre los permisos de la API.

| Recurso (Endpoint)          | Método HTTP | Rol Requerido        | Descripción                                      |
| --------------------------- | ----------- | -------------------- | ------------------------------------------------ |
| `/api/auth/**`              | `POST`      | **Público**          | Registro, Login, y gestión de contraseñas.       |
| `/api/productos`            | `GET`       | **Público**          | Listar todos los productos.                      |
| `/api/productos/{id}`       | `GET`       | **Público**          | Obtener un producto específico.                  |
| `/api/productos`            | `POST`      | `ADMIN`              | Crear un nuevo producto.                         |
| `/api/productos/{id}`       | `PUT`       | `ADMIN`              | Actualizar un producto existente.                |
| `/api/productos/{id}`       | `DELETE`    | `ADMIN`              | Eliminar un producto.                            |
| `/api/producto-imagenes/**` | `POST/PUT`  | `ADMIN`              | Gestionar las imágenes de un producto.           |
| `/api/ventas`               | `POST`      | **Autenticado** (User/Admin) | Realizar una nueva compra.                       |
| `/api/ventas`               | `GET`       | `ADMIN`              | Listar todas las ventas de la plataforma.        |
| `/api/ventas/mis-compras`   | `GET`       | **Autenticado** (User/Admin) | Ver el historial de compras del propio usuario.  |
| `/api/favoritos/**`         | `GET/POST`  | **Autenticado** (User/Admin) | Gestionar la lista de favoritos del usuario.     |
| `/api/estrellas`            | `POST`      | **Autenticado** (User/Admin) | Dar o actualizar la puntuación de un producto.   |

## 3. Contexto del Proyecto y Prácticas de Producción

Es importante destacar que este es un **proyecto académico** y no está destinado a un despliegue en un entorno de producción. Debido a este contexto, se han tomado ciertas simplificaciones para agilizar el desarrollo.

Sin embargo, es crucial conocer las "mejores prácticas" que se aplicarían en un proyecto real para demostrar profesionalismo.

| Práctica Simplificada (Proyecto Actual) | Mejor Práctica (Entorno de Producción) | Razón |
| --------------------------------------- | -------------------------------------- | ----- |
| **Gestión de Secretos:** El secreto de JWT se define en `application.properties`. | **Externalizar Secretos:** Usar variables de entorno, un servicio de gestión de secretos (como AWS Secrets Manager o HashiCorp Vault). | Para evitar que información sensible (claves de API, secretos de JWT) se filtre en el control de versiones. |
| **Configuración de CORS:** Se podría usar una configuración permisiva como `origins = "*"` para facilitar las pruebas locales. | **CORS Restrictivo:** Limitar los orígenes permitidos únicamente al dominio del frontend de producción. | Para prevenir que sitios web maliciosos hagan peticiones a tu API en nombre de tus usuarios. |
| **Base de Datos:** Uso de una base de datos en memoria (H2) y un inicializador de datos (`DataInitializer`). | **Base de Datos Persistente y Migraciones:** Usar una base de datos como PostgreSQL o MySQL y herramientas como Flyway o Liquibase para gestionar la evolución del esquema. | Para asegurar la persistencia de los datos y tener un control de versiones del estado de la base de datos. |
| **Exposición de Endpoints:** Todos los endpoints están activos, incluyendo la documentación de la API. | **Desactivar Endpoints no Esenciales:** Deshabilitar endpoints de diagnóstico o documentación (como Swagger UI) en el entorno de producción si no son necesarios para el público. | Para reducir la superficie de ataque de la aplicación. |

**Nota Final:** Aunque las simplificaciones actuales son aceptables para la entrega académica, **la implementación de las mejores prácticas de producción es un diferenciador clave** que demuestra un entendimiento profundo de la ingeniería de software y la seguridad. Se recomienda aplicar estas prácticas al final del proyecto para presentar una solución más completa y profesional.
