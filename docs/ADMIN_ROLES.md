# Admin Role Management

## Asignación Manual de Admin

Por seguridad, el rol `admin` **solo puede asignarse manualmente** ejecutando SQL directamente en la base de datos.

### Promover un usuario a Admin

```sql
-- Reemplaza 'usuario@ejemplo.com' con el email del usuario
update public.profiles
set role = 'admin'
where email = 'usuario@ejemplo.com';
```

### Verificar el rol de un usuario

```sql
select email, role, created_at
from public.profiles
where email = 'usuario@ejemplo.com';
```

### Degradar un admin a usuario normal

```sql
update public.profiles
set role = 'user'
where email = 'usuario@ejemplo.com';
```

## Seguridad

- ✅ Todos los usuarios nuevos se crean con `role = 'user'` por defecto
- ✅ Los usuarios **NO pueden modificar su propio rol**
- ✅ Solo admins pueden cambiar roles de otros usuarios
- ✅ RLS implementado:
  - Usuarios normales: Solo acceden a su propio contenido
  - Admins: Acceso total a todo el contenido

## Políticas de Seguridad Activas

### Tabla `profiles`
- Los usuarios pueden ver y editar su propio perfil (email, full_name)
- Los usuarios **NO pueden cambiar su campo `role`**
- Los admins pueden ver y modificar todos los perfiles

### Tabla `content`
- Los usuarios pueden crear, ver, editar y eliminar su propio contenido
- Los admins pueden ver, editar y eliminar todo el contenido
