package net.flunks.app

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Capacitor plugin to bridge JavaScript widget data updates to Android widgets
 * 
 * This allows the web app to update the Android home screen widget with:
 * - GUM balance
 * - Daily claim status
 * - Username/locker info
 */
@CapacitorPlugin(name = "FlunksWidgetBridge")
class FlunksWidgetBridge : Plugin() {

    companion object {
        private const val PREFS_NAME = "FlunksWidgetPrefs"
        private const val KEY_GUM_BALANCE = "gumBalance"
        private const val KEY_DAILY_CLAIMED = "dailyClaimed"
        private const val KEY_USERNAME = "username"
        private const val KEY_LOCKER_NUMBER = "lockerNumber"
        private const val KEY_NEXT_CLAIM_MINUTES = "nextClaimMinutes"
        private const val KEY_LAST_UPDATED = "lastUpdated"
    }

    /**
     * Update widget data from JavaScript
     * Call from JS: FlunksWidgetBridge.updateWidgetData({ gumBalance: 12450, ... })
     */
    @PluginMethod
    fun updateWidgetData(call: PluginCall) {
        val context = context ?: run {
            call.reject("Context not available")
            return
        }

        val gumBalance = call.getInt("gumBalance", 0) ?: 0
        val lockerNumber = call.getInt("lockerNumber", 0) ?: 0
        val username = call.getString("username") ?: "Anon"
        val dailyClaimed = call.getBoolean("dailyClaimed", false) ?: false
        val nextClaimMinutes = call.getInt("nextClaimMinutes", 0) ?: 0

        // Save to SharedPreferences
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().apply {
            putInt(KEY_GUM_BALANCE, gumBalance)
            putInt(KEY_LOCKER_NUMBER, lockerNumber)
            putString(KEY_USERNAME, username)
            putBoolean(KEY_DAILY_CLAIMED, dailyClaimed)
            putInt(KEY_NEXT_CLAIM_MINUTES, nextClaimMinutes)
            putLong(KEY_LAST_UPDATED, System.currentTimeMillis())
            apply()
        }

        // Trigger widget refresh
        refreshAllWidgets(context)

        call.resolve(
            com.getcapacitor.JSObject().apply {
                put("success", true)
            }
        )
    }

    /**
     * Force refresh all Flunks widgets
     */
    @PluginMethod
    fun refreshWidgets(call: PluginCall) {
        val context = context ?: run {
            call.reject("Context not available")
            return
        }

        refreshAllWidgets(context)

        call.resolve(
            com.getcapacitor.JSObject().apply {
                put("success", true)
            }
        )
    }

    /**
     * Get current widget data (for debugging)
     */
    @PluginMethod
    fun getWidgetData(call: PluginCall) {
        val context = context ?: run {
            call.reject("Context not available")
            return
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        call.resolve(
            com.getcapacitor.JSObject().apply {
                put("gumBalance", prefs.getInt(KEY_GUM_BALANCE, 0))
                put("lockerNumber", prefs.getInt(KEY_LOCKER_NUMBER, 0))
                put("username", prefs.getString(KEY_USERNAME, "Unknown"))
                put("dailyClaimed", prefs.getBoolean(KEY_DAILY_CLAIMED, false))
                put("nextClaimMinutes", prefs.getInt(KEY_NEXT_CLAIM_MINUTES, 0))
            }
        )
    }

    /**
     * Clear all widget data (for logout)
     */
    @PluginMethod
    fun clearWidgetData(call: PluginCall) {
        val context = context ?: run {
            call.reject("Context not available")
            return
        }

        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        prefs.edit().clear().apply()

        // Refresh widgets to show empty state
        refreshAllWidgets(context)

        call.resolve(
            com.getcapacitor.JSObject().apply {
                put("success", true)
            }
        )
    }

    /**
     * Helper to refresh all Flunks widgets on the home screen
     */
    private fun refreshAllWidgets(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val componentName = ComponentName(context, FlunksWidgetProvider::class.java)
        val widgetIds = appWidgetManager.getAppWidgetIds(componentName)

        for (widgetId in widgetIds) {
            FlunksWidgetProvider.updateAppWidget(context, appWidgetManager, widgetId)
        }
    }
}
