package com.fatafatmarketerapp

import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.*

class LocationTrackingModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    override fun getName(): String {
        return "LocationTrackingModule"
    }

    @ReactMethod
    fun startTracking(apiBaseUrl: String, accessToken: String, promise: Promise) {
        try {
            val serviceIntent = Intent(reactApplicationContext, LocationTrackingService::class.java).apply {
                putExtra(LocationTrackingService.EXTRA_API_BASE_URL, apiBaseUrl)
                putExtra(LocationTrackingService.EXTRA_ACCESS_TOKEN, accessToken)
            }
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactApplicationContext.startForegroundService(serviceIntent)
            } else {
                reactApplicationContext.startService(serviceIntent)
            }
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("START_TRACKING_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            val serviceIntent = Intent(reactApplicationContext, LocationTrackingService::class.java)
            reactApplicationContext.stopService(serviceIntent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("STOP_TRACKING_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun isTrackingActive(promise: Promise) {
        // Check if service is running
        val isRunning = isServiceRunning(LocationTrackingService::class.java)
        promise.resolve(isRunning)
    }
    
    private fun isServiceRunning(serviceClass: Class<*>): Boolean {
        val activityManager = reactApplicationContext.getSystemService(android.content.Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        for (service in activityManager.getRunningServices(Integer.MAX_VALUE)) {
            if (serviceClass.name == service.service.className) {
                return true
            }
        }
        return false
    }
}