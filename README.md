
# 🛰️ Nexus 4 All - The Forum of Forums

Nexus 4 All es una plataforma de foros futurista que combina la estructura comunitaria de Reddit con la agilidad visual de las redes sociales modernas.

## 🚀 Despliegue Rápido (Vercel)

1. Sube este código a un repositorio de **GitHub**.
2. Conecta tu repositorio en [Vercel](https://vercel.com).
3. ¡Listo! Vercel detectará automáticamente la configuración de React.

## 🗄️ Configuración de Supabase (Opcional)

Si deseas persistencia en la nube en lugar de `localStorage`, sigue estos pasos:

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Ejecuta el siguiente SQL en el **SQL Editor** para crear las tablas base:

```sql
-- Tabla de Foros
CREATE TABLE forums (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  member_count INTEGER DEFAULT 1,
  creator_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Tabla de Posts
CREATE TABLE posts (
  id TEXT PRIMARY KEY,
  author_id TEXT NOT NULL,
  author_name TEXT,
  author_avatar TEXT,
  forum_id TEXT REFERENCES forums(id),
  forum_name TEXT,
  content TEXT NOT NULL,
  image_url TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

3. Añade las **Environment Variables** en Vercel:
   - `VITE_SUPABASE_URL`: Tu URL de proyecto.
   - `VITE_SUPABASE_ANON_KEY`: Tu llave anónima.

## 🛠️ Tecnologías
- **Frontend**: React (ESM), Tailwind CSS.
- **Iconografía**: Lucide / Emojis.
- **Fuentes**: Orbitron (Futurista), Inter (Lectura).
- **Backend**: Supabase (Preparado) / LocalStorage (Fallback).

---
*Desarrollado para la comunidad Nexus.*
