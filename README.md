# FLUXapp 💰

Una aplicación de gestión financiera moderna diseñada para el mercado LATAM con autenticación integrada y análisis en tiempo real.

## ✨ Características

- 🔐 Autenticación segura con Replit Auth y Passport.js
- 📊 Dashboard de análisis financiero con gráficos interactivos
- 💳 Formulario de transacciones simplificado
- 📱 Diseño responsive (Mobile-first)
- 🎨 UI moderna con componentes Radix UI
- 🌓 Soporte para temas claro/oscuro
- 📈 Historial de transacciones

## 🛠️ Tech Stack

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI Components
- React Query (TanStack Query)

**Backend:**
- Node.js / Express
- PostgreSQL
- Drizzle ORM
- Passport.js

## 🚀 Instalación

### Requisitos previos
- Node.js 20+
- PostgreSQL 16+
- npm o pnpm

### Pasos

1. Clona el repositorio
   ```bash
   git clone https://github.com/migueedlsantos97/FLUXapp.git
   cd FLUXapp
   ```

2. Instala dependencias
   ```bash
   npm install
   ```

3. Configura las variables de entorno
   ```bash
   # Crea un archivo .env.local en la raíz del proyecto
   DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/fluxapp
   ```

4. Inicializa la base de datos
   ```bash
   npm run db:push
   ```

5. Inicia el servidor de desarrollo
   ```bash
   npm run dev
   ```

El proyecto estará disponible en `http://localhost:5000`

## 📝 Scripts disponibles

- `npm run dev` - Inicia el servidor de desarrollo
- `npm run build` - Compila para producción
- `npm run start` - Inicia el servidor en modo producción
- `npm run check` - Valida tipos TypeScript
- `npm run db:push` - Sincroniza cambios en la base de datos

## 📦 Estructura del proyecto

```
├── client/              # Frontend (React)
│   └── src/
│       ├── components/  # Componentes React
│       ├── pages/      # Páginas de la aplicación
│       ├── hooks/      # Custom hooks
│       └── lib/        # Utilidades
├── server/             # Backend (Express)
│   ├── routes.ts       # Rutas API
│   └── db.ts          # Configuración DB
├── shared/            # Código compartido
│   └── schema.ts      # Esquema de datos
└── script/            # Scripts de construcción
```

## 📄 Licencia

MIT

## 👤 Autor

Miguel Santos - [@migueedlsantos97](https://github.com/migueedlsantos97)

---

¿Preguntas? Abre un [issue](https://github.com/migueedlsantos97/FLUXapp/issues)
