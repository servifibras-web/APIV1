package ar.com.servifibras.intrudercamera

import android.Manifest
import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.BitmapFactory
import android.os.Build
import android.os.Bundle
import android.view.ViewGroup
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.content.ContextCompat

/** UI armada por código (sin layouts XML) para mantener el proyecto mínimo. */
class MainActivity : Activity() {

    private lateinit var status: TextView
    private lateinit var gallery: LinearLayout
    private lateinit var admin: ComponentName
    private lateinit var dpm: DevicePolicyManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        dpm = getSystemService(DevicePolicyManager::class.java)
        admin = ComponentName(this, AdminReceiver::class.java)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(32, 32, 32, 32)
        }
        status = TextView(this).apply { textSize = 16f }
        root.addView(status)
        root.addView(button("1. Dar permisos (cámara y notificaciones)") { askPermissions() })
        root.addView(button("2. Activar administrador de dispositivo") { askAdmin() })
        root.addView(button("3. Iniciar protección") { startProtection() })
        root.addView(button("Detener protección") {
            stopService(Intent(this, CaptureService::class.java)); refresh()
        })
        root.addView(button("Probar ahora (saca una foto)") { CaptureService.requestCapture() })
        root.addView(button("Refrescar fotos") { refresh() })
        gallery = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }
        root.addView(gallery)
        setContentView(ScrollView(this).apply { addView(root) })
    }

    override fun onResume() {
        super.onResume()
        refresh()
    }

    private fun button(text: String, onClick: () -> Unit) = Button(this).apply {
        this.text = text
        setOnClickListener { onClick() }
    }

    private fun hasCamera() =
        checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED

    private fun askPermissions() {
        val perms = mutableListOf(Manifest.permission.CAMERA)
        if (Build.VERSION.SDK_INT >= 33) perms += Manifest.permission.POST_NOTIFICATIONS
        requestPermissions(perms.toTypedArray(), 1)
    }

    private fun askAdmin() {
        startActivity(Intent(DevicePolicyManager.ACTION_ADD_DEVICE_ADMIN).apply {
            putExtra(DevicePolicyManager.EXTRA_DEVICE_ADMIN, admin)
            putExtra(
                DevicePolicyManager.EXTRA_ADD_EXPLANATION,
                "Necesario para detectar intentos fallidos de desbloqueo."
            )
        })
    }

    private fun startProtection() {
        if (!hasCamera()) { askPermissions(); return }
        ContextCompat.startForegroundService(this, Intent(this, CaptureService::class.java))
        status.postDelayed({ refresh() }, 500)
    }

    override fun onRequestPermissionsResult(code: Int, p: Array<out String>, r: IntArray) {
        super.onRequestPermissionsResult(code, p, r)
        refresh()
    }

    private fun refresh() {
        fun ok(b: Boolean) = if (b) "✅" else "❌"
        status.text = "${ok(hasCamera())} Permiso de cámara\n" +
            "${ok(dpm.isAdminActive(admin))} Administrador de dispositivo\n" +
            "${ok(CaptureService.isRunning())} Protección corriendo\n\n" +
            "Después de reiniciar el celu hay que abrir la app y tocar \"Iniciar protección\"."

        gallery.removeAllViews()
        val files = CaptureService.photosDir(this).listFiles()
            ?.sortedByDescending { it.lastModified() }.orEmpty()
        files.take(30).forEach { f ->
            gallery.addView(TextView(this).apply { text = f.name })
            gallery.addView(ImageView(this).apply {
                layoutParams = LinearLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT, 600
                )
                scaleType = ImageView.ScaleType.FIT_START
                val opts = BitmapFactory.Options().apply { inSampleSize = 4 }
                setImageBitmap(BitmapFactory.decodeFile(f.absolutePath, opts))
            })
        }
    }
}
