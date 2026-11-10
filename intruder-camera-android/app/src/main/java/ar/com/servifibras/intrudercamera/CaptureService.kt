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
                        }

                        override fun onError(exc: ImageCaptureException) {
                            Log.e(TAG, "Error al sacar la foto", exc)
                            provider.unbindAll()
                            busy = false
                        }
                    }
                )
            }, 700)
        }, ContextCompat.getMainExecutor(this))
    }

    companion object {
        private const val TAG = "IntruderCamera"
        private const val CHANNEL_ID = "proteccion"

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
