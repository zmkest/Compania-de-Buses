# Compañía de Buses

Frontend en Angular para gestionar una compañía de buses: usuarios, flota (buses, asientos y mantenimientos), viajes, choferes y tripulación. Consume la API REST [`company-api`](https://github.com/zmkest/bus_company_api) (NestJS + Prisma + PostgreSQL).

<div style="display: flex; justify-content: space-between;">
  <img src="https://github.com/user-attachments/assets/3ea5a5e8-0d96-4377-b995-e820b0156963" alt="Captura 1" style="width: 32%; height: auto;"/>
  <img src="https://github.com/user-attachments/assets/4e608f65-52ea-43f6-a1a7-681fcc4a5072" alt="Captura 2" style="width: 32%; height: auto;"/>
  <img src="https://github.com/user-attachments/assets/eb56715d-d709-4bfb-aaf0-cc198db5d15a" alt="Captura 3" style="width: 32%; height: auto;"/>
</div>

## Funcionalidades

### Conectadas a la API

- **Autenticación**
  - Inicio de sesión con JWT. El refresh token viaja en una cookie HTTP-only y se renueva automáticamente.
  - Registro.
  - Recuperar y restablecer contraseña (enlace por correo con token).
  - Perfil del usuario y cambio de contraseña.
  - Rutas protegidas por sesión y por rol.
- **Usuarios** (ADMIN)
  - Listado paginado con búsqueda.
  - Crear y editar usuarios.
  - Activar o desactivar y eliminar usuarios.
- **Flota > Buses** (ADMIN)
  - CRUD de buses con búsqueda y paginación.
  - Tarjetas con el total de buses y el conteo por estado.
  - Cambio de estado con reglas de transición. Pasar a mantenimiento abre un registro de mantenimiento.
- **Flota > Historial**
  - Historial paginado de cambios de estado, con filtros por estado de origen y destino.
  - Enlace al mantenimiento relacionado.
- **Flota > Disponibles**
  - Buses disponibles y sin viajes que se crucen con un rango de fecha y hora.
- **Flota > Asientos**
  - Tabla de buses con su número de asientos.
  - Al seleccionar un bus se muestra su mapa de asientos (vista horizontal) debajo de la tabla. Desde ahí se puede:
    - crear asientos en lote (2 a 80),
    - agregar un asiento,
    - marcar un asiento como operativo o no operativo,
    - reducir asientos.
- **Flota > Mantenimiento**
  - Listado con búsqueda por placa o tipo y filtro por rango de fechas, y estadísticas por tipo y estado.
  - Detalle, edición, completar y cancelar.
  - Los mantenimientos ya cerrados solo permiten editar el costo y la descripción.
- **Flota > Costos**
  - Reporte de costos de mantenimiento por bus y rango de fechas.
- **Red y horario > Terminales** (ADMIN y OPERATOR)
  - Listado paginado con búsqueda por terminal o ciudad y orden por nombre.
  - Crear terminales eligiendo la ciudad.
  - Editar y eliminar (solo ADMIN). No se puede eliminar un terminal que usan rutas.

### Pendientes de conectar

Las pantallas de **Viajes**, **Choferes**, **Tripulación** y **Consultas** todavía usan datos locales en memoria. Se van a conectar cuando `company-api` exponga los módulos de rutas, frecuencias, viajes y tripulación.

## Tecnologías

- **Angular 22**
  - Componentes standalone y carga diferida por ruta.
  - Signals y `rxResource`.
  - `withComponentInputBinding`, para que los filtros y la paginación vivan en la URL.
- **TypeScript 6** y **RxJS 7**
- **Tailwind CSS 3** para los estilos. Bootstrap queda en las pantallas antiguas.
- **pnpm** como gestor de paquetes.

## Requisitos

- Node.js compatible con Angular 22.
- pnpm.
- [`company-api`](https://github.com/zmkest/bus_company_api) corriendo y accesible; por defecto en `http://localhost:3000/api`.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/zmkest/Compania-de-Buses.git
   cd Compania-de-Buses
   ```

2. Instala las dependencias:

   ```bash
   pnpm install
   ```

3. Configura la URL de la API en `src/environments/` si no usas la de por defecto:

   | Archivo                      | Uso        | `apiUrl`                    |
   | ---------------------------- | ---------- | --------------------------- |
   | `environment.development.ts` | `ng serve` | `http://localhost:3000/api` |
   | `environment.ts`             | `ng build` | `http://localhost:3000/api` |

4. Levanta la aplicación:

   ```bash
   pnpm start
   ```

   La aplicación queda disponible en `http://localhost:4200`.

## Scripts

| Comando      | Descripción                                      |
| ------------ | ------------------------------------------------ |
| `pnpm start` | Servidor de desarrollo (`ng serve`).             |
| `pnpm build` | Build de producción en `dist/`.                  |
| `pnpm watch` | Build de desarrollo que se regenera con cambios. |
| `pnpm test`  | Pruebas unitarias.                               |

## Estructura

```text
src/app/
├── core/                  # Singletons de la app
│   ├── auth/              # AuthService, guards, interceptor de auth, roles y modelo de usuario
│   ├── errors/            # AppError y ErrorHandler global
│   ├── http/              # Interceptor de errores y respuesta paginada
│   ├── notifications/     # Toasts
│   └── routing/           # Helpers para query params
├── layout/                # Shell de la app (admin) y menú lateral filtrado por rol
├── shared/                # Componentes (search-box), utilidades y validadores reutilizables
└── features/              # Un dominio por carpeta, como en company-api
    ├── identity/          # auth (login, registro, contraseña), profile, users
    ├── fleet/             # buses (estado, historial, disponibilidad), seats, maintenances
    ├── network/           # terminals (Red y horario)
    └── legacy/            # viajes, choferes, tripulación y consultas con datos locales
```

Cada feature guarda juntos sus componentes, su servicio HTTP y sus DTOs/enums. Lo que usa más de un dominio va en `shared/` o `core/`.

## Roles

La API define los roles `ADMIN`, `OPERATOR`, `SELLER`, `DRIVER` y `PASSENGER`. Hoy las secciones de **Usuarios** y **Flota** del frontend solo están habilitadas para `ADMIN`.
