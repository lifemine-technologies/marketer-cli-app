package com.fatafatmarketerapp

import android.app.*
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Binder
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class LocationTrackingService : Service() {
    private val binder = LocalBinder()
    private var locationManager: LocationManager? = null
    private var locationListener: LocationListener? = null
    private val executor = Executors.newSingleThreadExecutor()
    private var lastLocationSentTime: Long = 0
    private val LOCATION_INTERVAL_MS = 5 * 60 * 1000L // 5 minutes (background)
    private var periodicLocationHandler: Handler? = null
    private var periodicLocationRunnable: Runnable? = null
    
    private var apiBaseUrl: String? = null
    private var accessToken: String? = null
    
    inner class LocalBinder : Binder() {
        fun getService(): LocationTrackingService = this@LocationTrackingService
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        apiBaseUrl = intent?.getStringExtra(EXTRA_API_BASE_URL)
        accessToken = intent?.getStringExtra(EXTRA_ACCESS_TOKEN)
        // Start foreground immediately (required API 26+)
        startForeground(NOTIFICATION_ID, createNotification())
        startLocationUpdates()
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Location Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Tracks your location for attendance"
            }
            val notificationManager = getSystemService(NotificationManager::class.java)
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun createNotification(): Notification {
        val intent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Location Tracking Active")
            .setContentText("Tracking your location for attendance")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startLocationUpdates() {
        if (locationManager == null) return

        try {
            locationListener = object : LocationListener {
                override fun onLocationChanged(location: Location) {
                    val now = System.currentTimeMillis()
                    if (now - lastLocationSentTime >= LOCATION_INTERVAL_MS) {
                        sendLocationToAPI(location)
                        lastLocationSentTime = now
                    }
                }

                override fun onProviderEnabled(provider: String) {}
                override fun onProviderDisabled(provider: String) {}
            }

            val hasFineLocation = checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
            val hasCoarseLocation = checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED

            if (hasFineLocation || hasCoarseLocation) {
                locationManager?.requestLocationUpdates(
                    LocationManager.GPS_PROVIDER,
                    LOCATION_INTERVAL_MS,
                    50f, // 50 meters
                    locationListener as LocationListener,
                    Looper.getMainLooper()
                )
                
                // Also request network location as fallback
                locationManager?.requestLocationUpdates(
                    LocationManager.NETWORK_PROVIDER,
                    LOCATION_INTERVAL_MS,
                    50f,
                    locationListener as LocationListener,
                    Looper.getMainLooper()
                )

                // Ensure we still send location every 5 minutes even if device is stationary
                startPeriodicLocationCheck()
            }
        } catch (e: SecurityException) {
            e.printStackTrace()
        }
    }

    private fun startPeriodicLocationCheck() {
        periodicLocationHandler = Handler(Looper.getMainLooper())
        periodicLocationRunnable = object : Runnable {
            override fun run() {
                try {
                    val now = System.currentTimeMillis()
                    if (now - lastLocationSentTime >= LOCATION_INTERVAL_MS) {
                        val hasFineLocation = checkSelfPermission(android.Manifest.permission.ACCESS_FINE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
                        val hasCoarseLocation = checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED

                        if (hasFineLocation || hasCoarseLocation) {
                            val location = locationManager?.getLastKnownLocation(LocationManager.GPS_PROVIDER)
                                ?: locationManager?.getLastKnownLocation(LocationManager.NETWORK_PROVIDER)
                            location?.let {
                                sendLocationToAPI(it)
                                lastLocationSentTime = now
                            }
                        }
                    }
                } catch (e: Exception) {
                    android.util.Log.e("LocationTracking", "Periodic check error", e)
                }
                periodicLocationHandler?.postDelayed(this, LOCATION_INTERVAL_MS)
            }
        }
        periodicLocationHandler?.post(periodicLocationRunnable!!)
    }

    private fun sendLocationToAPI(location: Location) {
        executor.execute {
            try {
                val base = apiBaseUrl ?: return@execute
                val url = URL("${base}/v1/marketer/attendance/location")
                val connection = url.openConnection() as HttpURLConnection
                
                connection.requestMethod = "POST"
                connection.setRequestProperty("Content-Type", "application/json")
                connection.setRequestProperty("Accept", "application/json")
                accessToken?.let {
                    connection.setRequestProperty("Authorization", "Bearer $it")
                }
                connection.doOutput = true

                val locationData = JSONObject().apply {
                    put("location", JSONObject().apply {
                        put("type", "Point")
                        put("coordinates", org.json.JSONArray().apply {
                            put(location.longitude)
                            put(location.latitude)
                        })
                    })
                    put("accuracy", location.accuracy)
                    if (location.hasSpeed()) {
                        put("speed", location.speed)
                    } else {
                        put("speed", null)
                    }
                    put("isMocked", location.accuracy < 10)
                }

                connection.outputStream.use { output ->
                    output.write(locationData.toString().toByteArray())
                }

                val responseCode = connection.responseCode
                if (responseCode in 200..299) {
                    android.util.Log.d("LocationTracking", "Location sent successfully")
                } else {
                    android.util.Log.e("LocationTracking", "Failed to send location: $responseCode")
                }
                
                connection.disconnect()
            } catch (e: Exception) {
                android.util.Log.e("LocationTracking", "Error sending location", e)
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        periodicLocationHandler?.removeCallbacks(periodicLocationRunnable!!)
        periodicLocationHandler = null
        periodicLocationRunnable = null
        locationListener?.let {
            locationManager?.removeUpdates(it)
        }
        executor.shutdown()
    }

    companion object {
        private const val CHANNEL_ID = "location_tracking_channel"
        private const val NOTIFICATION_ID = 1
        const val EXTRA_API_BASE_URL = "api_base_url"
        const val EXTRA_ACCESS_TOKEN = "access_token"
    }
}