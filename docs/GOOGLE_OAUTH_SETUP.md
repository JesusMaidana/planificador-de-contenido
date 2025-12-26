# Configuración de Google OAuth

## Problema Actual

El error DNS al hacer clic en "Continuar con Google" indica que **el proveedor de Google OAuth no está configurado** en tu proyecto Supabase.

![Error DNS](C:/Users/Yisus/.gemini/antigravity/brain/ba61634a-1c73-473a-8afa-48e34d2c422b/uploaded_image_0_1766782785017.png)

## Pasos para Configurar Google OAuth

### 1. Accede a tu proyecto Supabase
- Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Selecciona tu proyecto: **JesusMaidana's Project**

### 2. Activa Google Provider
1. En el menú lateral, ve a **Authentication** → **Providers**
2. Busca **Google** en la lista de proveedores
3. Activa el toggle de Google
4. Necesitarás configurar credenciales de Google Cloud

### 3. Configurar Google Cloud Console

#### Crear Proyecto en Google Cloud
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la **Google+ API**

#### Crear Credenciales OAuth
1. Ve a **APIs & Services** → **Credentials**
2. Clic en **Create Credentials** → **OAuth client ID**
3. Selecciona **Web application**
4. Configura:
   - **Name**: ContentOS (o el que prefieras)
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     ```
   - **Authorized redirect URIs**:
     ```
     https://essvjafgiwwcbkglesvz.supabase.co/auth/v1/callback
     ```

5. Guarda los valores:
   - **Client ID**
   - **Client Secret**

### 4. Configurar en Supabase

1. Vuelve a tu proyecto Supabase
2. En **Authentication** → **Providers** → **Google**
3. Pega:
   - **Client ID** (de Google Cloud)
   - **Client Secret** (de Google Cloud)
4. En **Redirect URL**, asegúrate que sea:
   ```
   https://essvjafgiwwcbkglesvz.supabase.co/auth/v1/callback
   ```
5. Guarda los cambios

### 5. Verificación

Una vez configurado:
- Reinicia el servidor de desarrollo
- Intenta hacer login con Google nuevamente
- Deberías ser redirigido correctamente a Google para autenticación

## Alternativa Simple (Solo Email)

Si prefieres por ahora **solo usar email/password**:
- Puedes comentar temporalmente el botón de Google en las páginas de login/signup
- O simplemente informar a los usuarios que usen el método de email mientras configuras OAuth

## Notas Importantes

- El **redirect URI de Supabase** siempre es: `https://[tu-proyecto-ref].supabase.co/auth/v1/callback`
- Para producción, agrega tu dominio real a las **Authorized redirect URIs** de Google Cloud
