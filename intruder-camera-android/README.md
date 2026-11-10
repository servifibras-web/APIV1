# Intruder Camera (Android)

Saca una foto con la cámara frontal cuando alguien ingresa un PIN, patrón o contraseña incorrectos
en el celular. Las fotos se guardan en `Android/data/ar.com.servifibras.intrudercamera/files/intrusos/`
y se ven dentro de la app.

## Cómo compilar e instalar
1. Instalar [Android Studio](https://developer.android.com/studio).
2. `File > Open` y elegir esta carpeta (`intruder-camera-android`). Dejar que sincronice Gradle.
3. En el celu: activar *Opciones de desarrollador* y *Depuración USB*, conectarlo por cable.
4. Tocar **Run ▶** (o `Build > Build APK(s)` y pasar el APK al celu).

## Uso (en este orden)
1. **Dar permisos** (cámara y notificaciones).
2. **Activar administrador de dispositivo** (da acceso a "vigilar intentos de desbloqueo").
3. **Iniciar protección** (queda una notificación fija; no la cierres).
4. Probalo: bloqueá el celu e ingresá un PIN mal.

## Limitaciones (de Android, no del código)
- Solo cuenta PIN/patrón/contraseña. Huella y cara fallidas **no** disparan el evento.
- Android solo cuenta como intento un PIN de 4 dígitos o más.
- La cámara no se puede abrir desde segundo plano: el servicio tiene que estar iniciado de antemano.
  Tras **reiniciar** el celu, abrí la app y tocá "Iniciar protección" (Android 14+ no deja arrancar
  servicios de cámara solos al encender).
- Algunos fabricantes (Xiaomi, Huawei, Samsung) matan servicios en segundo plano: excluí la app del
  ahorro de batería.
- Para desinstalar primero hay que desactivar el administrador (Ajustes > Seguridad > Administradores).
- Usalo solo en tu propio dispositivo.

## Ajustes específicos para Samsung S24 Ultra (One UI)
- **Batería:** Ajustes > Batería > Límites de uso en segundo plano > *Apps que nunca se suspenden* >
  agregar "Intruder Camera". Desactivá también "Poner en suspensión apps sin uso".
- **Permiso de cámara:** Ajustes > Aplicaciones > Intruder Camera > Permisos > Cámara >
  *Permitir solo mientras la app está en uso* (o "Permitir siempre" si aparece). No uses "Solo esta vez".
- **Notificaciones:** dejalas activadas; si se oculta la notificación fija, Samsung puede cerrar el servicio.
- **Auto Blocker / Knox:** si Auto Blocker bloquea la instalación del APK, desactivalo
  temporalmente (Ajustes > Seguridad y privacidad > Auto Blocker).
- **Reinicios:** tras cada reinicio, abrí la app y tocá "Iniciar protección".
- Samsung ya trae *Buscar mi móvil* (SmartThings Find), que puede ser un buen complemento antirrobo.

> Este código no fue compilado ni probado en un equipo real; si Gradle o el celu dan algún error,
> pasame el mensaje y lo corrijo.
