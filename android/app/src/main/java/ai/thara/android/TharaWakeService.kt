package ai.thara.android
import android.app.Service
import android.content.Intent
import android.os.IBinder
class TharaWakeService: Service() {
 override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
   // Production hook: initialize a local low-power wake-word engine here.
   // Keep audio processing on-device and only open the assistant pipeline after wake detection.
   return START_STICKY
 }
 override fun onBind(intent: Intent?): IBinder? = null
}