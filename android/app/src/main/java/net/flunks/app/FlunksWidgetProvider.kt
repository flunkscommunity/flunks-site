package net.flunks.app

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import java.text.NumberFormat
import java.util.Locale

/**
 * Flunks Small Widget - "Insert Coin" Arcade Style
 * Shows GUM balance and daily claim status
 */
class FlunksWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Called when first widget is created
    }

    override fun onDisabled(context: Context) {
        // Called when last widget is disabled
    }

    companion object {
        private const val PREFS_NAME = "FlunksWidgetPrefs"
        private const val KEY_GUM_BALANCE = "gumBalance"
        private const val KEY_DAILY_CLAIMED = "dailyClaimed"
        private const val KEY_USERNAME = "username"

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            // Load widget data from SharedPreferences
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val gumBalance = prefs.getInt(KEY_GUM_BALANCE, 0)
            val dailyClaimed = prefs.getBoolean(KEY_DAILY_CLAIMED, false)
            
            // Create RemoteViews
            val views = RemoteViews(context.packageName, R.layout.widget_flunks_small)
            
            // Format GUM balance with commas
            val formattedBalance = NumberFormat.getNumberInstance(Locale.US).format(gumBalance)
            views.setTextViewText(R.id.text_gum_balance, formattedBalance)
            
            // Update INSERT COIN / CREDIT USED text
            if (dailyClaimed) {
                views.setTextViewText(R.id.text_insert_coin, "CREDIT USED")
                views.setTextColor(R.id.text_insert_coin, 0xFF9CA3AF.toInt()) // Gray
                views.setTextViewText(R.id.text_claim_status, "COME BACK LATER")
                views.setTextColor(R.id.text_claim_status, 0xFF9CA3AF.toInt()) // Gray
            } else {
                views.setTextViewText(R.id.text_insert_coin, "INSERT COIN")
                views.setTextColor(R.id.text_insert_coin, 0xFFFFD700.toInt()) // Gold
                views.setTextViewText(R.id.text_claim_status, "CLAIM +15")
                views.setTextColor(R.id.text_claim_status, 0xFFF59E0B.toInt()) // Orange
            }
            
            // Create intent to open app when widget is clicked
            val intent = Intent(context, MainActivity::class.java).apply {
                action = Intent.ACTION_VIEW
                data = android.net.Uri.parse(
                    if (dailyClaimed) "flunks://gum" else "flunks://gum/claim?source=widget&amount=15"
                )
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            
            val pendingIntent = PendingIntent.getActivity(
                context,
                appWidgetId,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            views.setOnClickPendingIntent(R.id.widget_container, pendingIntent)
            
            // Update the widget
            appWidgetManager.updateAppWidget(appWidgetId, views)
        }

        /**
         * Call this from your app to update widget data
         */
        fun updateWidgetData(
            context: Context,
            gumBalance: Int,
            dailyClaimed: Boolean,
            username: String
        ) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            prefs.edit().apply {
                putInt(KEY_GUM_BALANCE, gumBalance)
                putBoolean(KEY_DAILY_CLAIMED, dailyClaimed)
                putString(KEY_USERNAME, username)
                apply()
            }
            
            // Trigger widget update
            val intent = Intent(context, FlunksWidgetProvider::class.java).apply {
                action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
            }
            context.sendBroadcast(intent)
        }
    }
}
