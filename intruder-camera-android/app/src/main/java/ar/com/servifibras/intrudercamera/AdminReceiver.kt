package ar.com.servifibras.intrudercamera

import android.app.admin.DeviceAdminReceiver
import android.content.Context
import android.content.Intent
import android.os.UserHandle

/** Android avisa acá cada vez que se ingresa un PIN/patrón/contraseña incorrecto. */
class AdminReceiver : DeviceAdminReceiver() {

    override fun onPasswordFailed(context: Context, intent: Intent, user: UserHandle) {
        CaptureService.requestCapture()
    }
}
