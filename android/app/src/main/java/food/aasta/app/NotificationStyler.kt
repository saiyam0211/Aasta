package food.aasta.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.PorterDuff
import android.graphics.PorterDuffXfermode
import android.graphics.Rect
import android.graphics.RectF
import android.os.Build
import androidx.core.app.NotificationCompat
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "NotificationStyler")
class NotificationStyler : Plugin() {

    companion object {
        fun getRoundedBitmap(bitmap: Bitmap, cornerRadius: Float): Bitmap {
            val output = Bitmap.createBitmap(bitmap.width, bitmap.height, Bitmap.Config.ARGB_8888)
            val canvas = Canvas(output)

            val paint = Paint()
            val rect = Rect(0, 0, bitmap.width, bitmap.height)
            val rectF = RectF(rect)

            paint.isAntiAlias = true
            canvas.drawARGB(0, 0, 0, 0)
            paint.color = 0xff424242.toInt()
            canvas.drawRoundRect(rectF, cornerRadius, cornerRadius, paint)

            paint.xfermode = PorterDuffXfermode(PorterDuff.Mode.SRC_IN)
            canvas.drawBitmap(bitmap, rect, rect, paint)

            return output
        }

        fun getLargeIcon(context: Context): Bitmap? {
            return try {
                val originalBitmap = BitmapFactory.decodeResource(
                    context.resources,
                    context.resources.getIdentifier("ic_large_notification", "mipmap", context.packageName)
                )
                getRoundedBitmap(originalBitmap, 20f * context.resources.displayMetrics.density)
            } catch (e: Exception) {
                null
            }
        }
    }

    @PluginMethod
    fun configure(call: PluginCall) {
        call.resolve()
    }
}
