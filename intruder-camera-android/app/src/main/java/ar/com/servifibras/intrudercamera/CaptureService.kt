package ar.com.servifibras.intrudercamera

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.core.content.ContextCompat
import androidx.lifecycle.LifecycleService
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Servicio en primer plano (tipo cámara). Tiene que estar corriendo ANTES del intento
 * fallido: Android no deja abrir la cámara desde segundo plano.
 */
class CaptureService : LifecycleService() {

    private val main = Handler(Looper.getMainLooper())
    private var busy = false

    override fun onCreate() {
        super.onCreate()
        instance = this
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "Protección activa", NotificationManager.IMPORTANCE_LOW)
        )
        nm.createNotificationChannel(
            NotificationChannel(ALERT_CHANNEL_ID, "Alertas de intruso", NotificationManager.IMPORTANCE_HIGH)
        )
        val notification = Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("Protección activa")
            .setContentText("Se sacará una foto si hay intentos de desbloqueo fallidos")
            .setSmallIcon(android.R.drawable.ic_menu_camera)
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 29) {
            startForeground(1, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA)
        } else {
            startForeground(1, notification)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        super.onStartCommand(intent, flags, startId)
        return START_STICKY
    }

    override fun onDestroy() {
        if (instance === this) instance = null
        super.onDestroy()
    }

    private fun capture() {
        logEvent("Intento de desbloqueo fallido")
        if (busy) return
        busy = true
        val providerFuture = ProcessCameraProvider.getInstance(this)
        providerFuture.addListener({
            val provider = try {
                providerFuture.get()
            } catch (e: Exception) {
                Log.e(TAG, "No se pudo obtener la cámara", e)
                busy = false
                return@addListener
            }
            val imageCapture = ImageCapture.Builder()
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()
            try {
                provider.unbindAll()
                provider.bindToLifecycle(this, CameraSelector.DEFAULT_FRONT_CAMERA, imageCapture)
            } catch (e: Exception) {
                Log.e(TAG, "No se pudo abrir la cámara frontal", e)
                busy = false
                return@addListener
            }
            // Pequeña espera para que la cámara ajuste exposición y no salga oscura.
            main.postDelayed({
                val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
                val file = File(photosDir(this), "intruso_$stamp.jpg")
                imageCapture.takePicture(
                    ImageCapture.OutputFileOptions.Builder(file).build(),
                    ContextCompat.getMainExecutor(this),
                    object : ImageCapture.OnImageSavedCallback {
                        override fun onImageSaved(output: ImageCapture.OutputFileResults) {
                            provider.unbindAll()
                            busy = false
                            logEvent("Foto guardada: ${file.name}")
                            notifyIntruder()
                        }

                        override fun onError(exc: ImageCaptureException) {
                            Log.e(TAG, "Error al sacar la foto", exc)
                            logEvent("ERROR al sacar la foto: ${exc.message}")
                            provider.unbindAll()
                            busy = false
                        }
                    }
                )
            }, 700)
        }, ContextCompat.getMainExecutor(this))
    }

    private fun now(): String =
        SimpleDateFormat("dd/MM/yyyy HH:mm:ss", Locale.getDefault()).format(Date())

    /** Agrega una línea con fecha y hora al registro (registro.txt). */
    private fun logEvent(msg: String) {
        try {
            File(photosDir(this), LOG_NAME).appendText("${now()} - $msg\n")
        } catch (e: Exception) {
            Log.e(TAG, "No se pudo escribir el registro", e)
        }
    }

    private fun notifyIntruder() {
        val open = android.app.PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            android.app.PendingIntent.FLAG_IMMUTABLE or android.app.PendingIntent.FLAG_UPDATE_CURRENT
        )
        val n = Notification.Builder(this, ALERT_CHANNEL_ID)
            .setContentTitle("⚠️ Intruso detectado")
            .setContentText("Intento de desbloqueo fallido el ${now()}. Tocá para ver la foto.")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        getSystemService(NotificationManager::class.java)
            .notify(System.currentTimeMillis().toInt(), n)
    }

    companion object {
        private const val TAG = "IntruderCamera"
        private const val CHANNEL_ID = "proteccion"
        private const val ALERT_CHANNEL_ID = "alertas"
        const val LOG_NAME = "registro.txt"

        @Volatile
        private var instance: CaptureService? = null

        fun isRunning() = instance != null

        fun requestCapture() {
            val svc = instance ?: return
            svc.main.post { svc.capture() }
        }

        fun photosDir(ctx: android.content.Context): File =
            File(ctx.getExternalFilesDir(null), "intrusos").apply { mkdirs() }
    }
}
