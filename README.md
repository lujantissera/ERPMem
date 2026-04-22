# MEM — Plataforma de Gestión de Muebles y Sillones

Plataforma integral para la venta y gestión operativa de una empresa de muebles y sillones. Centraliza el catálogo de productos, el proceso de pedidos de clientes, el seguimiento de producción y el control administrativo-financiero en una sola aplicación.

---

## Descripción general

MEM reemplaza los procesos manuales en planillas (Excel/Sheets) por una plataforma web con dos grandes módulos:

- **Tienda pública** — Los clientes exploran el catálogo, configuran dimensiones personalizadas, arman un carrito y confirman su pedido.
- **Panel de administración** — El equipo interno gestiona clientes, productos, pedidos, stock, producción, proveedores y finanzas desde tableros unificados.

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Estado global | Zustand |
| Routing | React Router 7 |
| HTTP client | Axios |
| Backend | Node.js, Express 5, TypeScript |
| ORM | Prisma 7 |
| Base de datos | MySQL |
| Auth | JWT + bcryptjs |
| Validación | Zod |
| Monorepo | pnpm workspaces |

---

## Estructura del proyecto

```
mem/
├── frontend/          # Aplicación React (Vite)
│   └── src/
│       ├── assets/
│       ├── App.tsx
│       └── main.tsx
├── backend/           # API REST (Express)
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── routes/
│       └── server.ts
├── package.json       # Scripts raíz (pnpm workspaces)
└── pnpm-workspace.yaml
```

---

## Base de datos — Esquema actual

### Entidades principales

**`users`** — Clientes y administradores
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int PK | Identificador único |
| name | String | Nombre completo |
| email | String unique | Correo electrónico |
| password | String | Hash bcrypt |
| role | Enum | `CUSTOMER` / `ADMIN` |
| phone | String? | Teléfono de contacto |
| address | String? | Dirección de entrega |

**`products`** — Catálogo con precios y stock
| Campo | Tipo | Descripción |
|---|---|---|
| id | Int PK | Identificador único |
| categoryId | Int FK | Categoría del producto |
| name | String | Nombre del producto |
| description | Text | Descripción detallada |
| price | Decimal | Precio de venta |
| stock | Int | Unidades disponibles |
| minStock | Int | Alerta de stock mínimo |
| min/maxWidth, Height, Depth | Float? | Rango de dimensiones personalizables |
| material | String? | Material principal |
| imageUrl | String? | Imagen del producto |
| active | Boolean | Visibilidad en tienda |

> El campo `productionCost` (costo de producción) está pendiente de agregar al schema para habilitar el cálculo de márgenes.

**`orders`** — Pedidos de clientes
| Estado | Descripción |
|---|---|
| `PENDING` | Pedido recibido, pendiente de confirmación |
| `CONFIRMED` | Confirmado, listo para producción |
| `IN_PRODUCTION` | En fabricación |
| `SHIPPED` | Despachado |
| `DELIVERED` | Entregado al cliente |
| `CANCELLED` | Cancelado |

**`suppliers`** / **`supplier_orders`** — Proveedores y órdenes de compra de materiales

---

## API REST — Endpoints disponibles

```
GET  /health                          Health check

POST /api/auth/register               Registro de usuario
POST /api/auth/login                  Login (retorna JWT)

GET  /api/products                    Listado de productos
GET  /api/products/:id                Detalle de producto
POST /api/products                    Crear producto (admin)
PUT  /api/products/:id                Actualizar producto (admin)
DEL  /api/products/:id                Eliminar producto (admin)

GET  /api/categories                  Listado de categorías
POST /api/categories                  Crear categoría (admin)

GET  /api/orders                      Pedidos del usuario autenticado
POST /api/orders                      Crear pedido desde carrito
GET  /api/orders/:id                  Detalle de pedido
PUT  /api/orders/:id/status           Cambiar estado (admin)

GET  /api/users                       Listado de clientes (admin)
GET  /api/users/:id                   Detalle de cliente (admin)

GET  /api/suppliers                   Listado de proveedores (admin)
POST /api/suppliers                   Crear proveedor (admin)
POST /api/suppliers/:id/orders        Crear orden de compra (admin)
```

---

## Funcionalidades planificadas (Roadmap)

### Tienda pública (Frontend)
- [ ] Página principal con catálogo de productos por categoría
- [ ] Ficha de producto con selección de dimensiones personalizadas
- [ ] Carrito de compras persistente
- [ ] Checkout con formulario de datos de envío
- [ ] Registro / login de cliente
- [ ] Historial de pedidos del cliente
- [ ] Estado del pedido en tiempo real

### Panel de administración (Admin)
- [ ] Dashboard principal con métricas clave (ventas, producción, stock)
- [ ] Tablero de pedidos — con filtros por estado, fecha y cliente
- [ ] Tablero de producción — seguimiento de qué se está fabricando, plazos
- [ ] Tablero de stock — alertas de stock mínimo, disparador de orden a proveedor
- [ ] ABM de clientes — datos completos, historial de compras
- [ ] ABM de productos — precio de venta, costo de producción, stock, imágenes
- [ ] ABM de proveedores y órdenes de compra
- [ ] Tablero financiero — cruce de ventas vs. costos, márgenes, gastos

### Automatizaciones
- [ ] Al confirmar un pedido → verificar stock; si no hay → generar solicitud automática al proveedor
- [ ] Al bajar el stock por debajo del mínimo → alerta en dashboard del admin
- [ ] Al cambiar el estado de un pedido → notificación al cliente (email)
- [ ] Generación automática de presupuesto / remito PDF al confirmar pedido
- [ ] Cierre de período administrativo: consolidación de ventas, producción y costos

### Base de datos (pendientes)
- [ ] Agregar campo `productionCost` a `products` para cálculo de margen
- [ ] Tabla `expenses` — registro de gastos operativos por categoría y período
- [ ] Tabla `production_logs` — registro de unidades producidas por orden
- [ ] Tabla `price_history` — historial de cambios de precio por producto

---

## Instalación y desarrollo local

### Prerequisitos

- Node.js >= 20
- pnpm >= 9
- MySQL >= 8

### 1. Clonar e instalar dependencias

```bash
git clone <repo-url>
cd mem
pnpm install
```

### 2. Configurar variables de entorno del backend

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env`:

```env
DATABASE_URL="mysql://usuario:password@localhost:3306/mem_db"
JWT_SECRET="tu_secreto_seguro"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 3. Inicializar la base de datos

```bash
# Aplicar el schema y correr migraciones
pnpm --filter backend db:migrate

# Cargar datos de prueba (seed)
pnpm --filter backend db:seed
```

### 4. Levantar el proyecto completo

```bash
# Backend (puerto 4000) + Frontend (puerto 5173) en paralelo
pnpm dev
```

O por separado:

```bash
pnpm dev:backend
pnpm dev:frontend
```

### Prisma Studio (explorador visual de la DB)

```bash
pnpm --filter backend db:studio
```

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `pnpm dev` | Levanta backend y frontend en paralelo |
| `pnpm dev:backend` | Solo el servidor Express |
| `pnpm dev:frontend` | Solo la app React |
| `pnpm build` | Build de producción de ambos |
| `pnpm --filter backend db:migrate` | Corre migraciones Prisma |
| `pnpm --filter backend db:seed` | Carga datos semilla |
| `pnpm --filter backend db:studio` | Abre Prisma Studio |
| `pnpm --filter backend db:generate` | Regenera el cliente Prisma |

---

## Roles y permisos

| Rol | Acceso |
|---|---|
| `CUSTOMER` | Tienda pública, historial de pedidos propios |
| `ADMIN` | Panel de administración completo + todas las rutas de la API |

---

## Contexto de negocio

La empresa fabrica y vende sillones y muebles con opción de medidas personalizadas. El flujo operativo actual es:

1. El cliente solicita un pedido (actualmente por WhatsApp / teléfono)
2. Se verifica manualmente si hay stock o si hay que producir
3. Se registra en planilla de producción y seguimiento
4. Se cruza con planilla administrativa de costos, gastos y facturación

**MEM automatiza este flujo end-to-end**, desde que el cliente hace clic en "Comprar" hasta que el equipo de producción y administración tiene toda la información actualizada en sus tableros.
