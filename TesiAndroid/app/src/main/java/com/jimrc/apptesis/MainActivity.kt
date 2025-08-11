package com.jimrc.apptesis

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.*
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import android.widget.*
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.*
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.exifinterface.media.ExifInterface
import androidx.lifecycle.LifecycleOwner
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody
import okhttp3.RequestBody
import okhttp3.ResponseBody
import retrofit2.Call
import retrofit2.Callback
import retrofit2.Response
import java.io.ByteArrayOutputStream
import java.io.File
import kotlin.math.max
import kotlin.math.min

class MainActivity : ComponentActivity() {

    // Cámara / Galería
    private lateinit var previewView: PreviewView
    private lateinit var galleryPreview: ImageView
    private lateinit var overlay: ViewfinderOverlay
    private lateinit var btnCapture: Button
    private lateinit var btnGaleria: Button
    private var imageCapture: ImageCapture? = null
    private var lastGalleryBitmap: Bitmap? = null

    // Panel de IP
    private lateinit var btnToggleConfig: Button
    private lateinit var panelConfig: LinearLayout
    private lateinit var edtBaseUrl: EditText
    private lateinit var btnGuardarUrl: Button

    // Estado de proceso
    private lateinit var panelEstado: LinearLayout
    private lateinit var txtEstado: TextView

    // Permisos
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) startCamera() else toast("Permiso de cámara requerido")
    }

    // Selector de galería
    private val pickImage = registerForActivityResult(
        ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let { mostrarImagenGaleria(it) }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        // Referencias UI (IDs deben existir en activity_main.xml)
        previewView     = findViewById(R.id.previewView)
        galleryPreview  = findViewById(R.id.galleryPreview)
        overlay         = findViewById(R.id.overlay)
        btnCapture      = findViewById(R.id.btnCapture)
        btnGaleria      = findViewById(R.id.btnGaleria)
        btnToggleConfig = findViewById(R.id.btnToggleConfig)
        panelConfig     = findViewById(R.id.panelConfig)
        edtBaseUrl      = findViewById(R.id.edtBaseUrl)
        btnGuardarUrl   = findViewById(R.id.btnGuardarUrl)
        panelEstado     = findViewById(R.id.panelEstado)
        txtEstado       = findViewById(R.id.txtEstado)

        btnCapture.isVisible = false

        // Cargar URL guardada → ApiClient
        val prefs = getSharedPreferences("app_prefs", MODE_PRIVATE)
        val savedUrl = prefs.getString("base_url", ApiClient.getBaseUrl()) ?: "http://192.168.1.4:5000/"
        val normalized = normalizeBaseUrl(savedUrl)
        edtBaseUrl.setText(normalized)
        ApiClient.setBaseUrl(normalized)

        // Toggle panel IP
        btnToggleConfig.setOnClickListener {
            panelConfig.isVisible = !panelConfig.isVisible
            btnToggleConfig.text = if (panelConfig.isVisible) "Servidor ▾" else "Servidor ▸"
        }

        // Guardar URL
        btnGuardarUrl.setOnClickListener {
            val input = edtBaseUrl.text.toString().trim()
            val url = normalizeBaseUrl(input)
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                toast("URL inválida"); return@setOnClickListener
            }
            prefs.edit().putString("base_url", url).apply()
            ApiClient.setBaseUrl(url)
            toast("URL guardada")
            panelConfig.isVisible = false
            btnToggleConfig.text = "Servidor ▸"
        }

        // Permiso cámara
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }

        // Acciones
        btnCapture.setOnClickListener { capturePhoto() }
        btnGaleria.setOnClickListener { pickImage.launch("image/*") }
    }

    // Util
    private fun normalizeBaseUrl(str: String): String {
        var s = str
        if (s.isNotEmpty() && !s.startsWith("http://") && !s.startsWith("https://")) s = "http://$s"
        if (s.isNotEmpty() && !s.endsWith("/")) s += "/"
        return s
    }

    /** Activa la cámara (modo cámara ON, galería OFF) */
    private fun startCamera() {
        galleryPreview.isVisible = false
        previewView.isVisible = true

        val cameraProviderFuture = ProcessCameraProvider.getInstance(this)
        cameraProviderFuture.addListener({
            val cameraProvider = cameraProviderFuture.get()

            val preview = Preview.Builder()
                .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                .build().also { it.setSurfaceProvider(previewView.surfaceProvider) }

            imageCapture = ImageCapture.Builder()
                .setTargetAspectRatio(AspectRatio.RATIO_4_3)
                .setCaptureMode(ImageCapture.CAPTURE_MODE_MINIMIZE_LATENCY)
                .build()

            try {
                cameraProvider.unbindAll()
                cameraProvider.bindToLifecycle(
                    this as LifecycleOwner,
                    CameraSelector.DEFAULT_BACK_CAMERA,
                    preview,
                    imageCapture
                )
                btnCapture.text = "Capturar"
                btnCapture.isVisible = true
            } catch (e: Exception) {
                e.printStackTrace()
                toast("No se pudo iniciar la cámara")
            }
        }, ContextCompat.getMainExecutor(this))
    }

    /** Mostrar imagen de la galería, bajo el overlay, y preparar envío del recorte */
    private fun mostrarImagenGaleria(uri: Uri) {
        // Apagar preview de cámara; mostrar ImageView
        previewView.isVisible = false
        galleryPreview.isVisible = true

        val bmp = MediaStore.Images.Media.getBitmap(contentResolver, uri)
        lastGalleryBitmap = bmp
        galleryPreview.setImageBitmap(bmp)

        // Reutilizamos el botón para enviar el recorte
        btnCapture.text = "Enviar recorte"
        btnCapture.isVisible = true
        btnCapture.setOnClickListener {
            try {
                val cropped = cropFromImageView()
                uploadBytes(cropped)
            } catch (e: Exception) {
                e.printStackTrace()
                toast("Error al recortar: ${e.message}")
            }
        }
    }

    /** Capturar → recortar al rectángulo → subir */
    private fun capturePhoto() {
        val ic = imageCapture ?: return
        val photoFile = File(cacheDir, "captura_${System.currentTimeMillis()}.jpg")
        val outputOptions = ImageCapture.OutputFileOptions.Builder(photoFile).build()

        ic.takePicture(
            outputOptions,
            ContextCompat.getMainExecutor(this),
            object : ImageCapture.OnImageSavedCallback {
                override fun onImageSaved(result: ImageCapture.OutputFileResults) {
                    try {
                        val croppedJpeg = cropToOverlay(photoFile)
                        uploadBytes(croppedJpeg)
                    } catch (e: Exception) {
                        e.printStackTrace()
                        toast("Error al recortar: ${e.message}")
                    }
                }
                override fun onError(exception: ImageCaptureException) {
                    toast("Error al capturar: ${exception.message}")
                }
            }
        )
    }

    /** Recorta imagen capturada en PreviewView (fitCenter) usando el overlay */
    private fun cropToOverlay(file: File): ByteArray {
        // Decodificar + rotación EXIF
        var bmp = BitmapFactory.decodeFile(file.absolutePath)
        val ei = ExifInterface(file.absolutePath)
        val rotation = when (ei.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
            ExifInterface.ORIENTATION_ROTATE_90  -> 90
            ExifInterface.ORIENTATION_ROTATE_180 -> 180
            ExifInterface.ORIENTATION_ROTATE_270 -> 270
            else -> 0
        }
        if (rotation != 0) {
            val m = Matrix().apply { postRotate(rotation.toFloat()) }
            bmp = Bitmap.createBitmap(bmp, 0, 0, bmp.width, bmp.height, m, true)
        }

        return cropWithFitCenterMapping(
            containerW = previewView.width.toFloat(),
            containerH = previewView.height.toFloat(),
            bitmap = bmp,
            frame = overlay.getFrameRect()
        )
    }

    /** Recorta imagen mostrada en ImageView (fitCenter) usando el overlay */
    private fun cropFromImageView(): ByteArray {
        val bmp = lastGalleryBitmap ?: throw IllegalStateException("Imagen no cargada")
        return cropWithFitCenterMapping(
            containerW = galleryPreview.width.toFloat(),
            containerH = galleryPreview.height.toFloat(),
            bitmap = bmp,
            frame = overlay.getFrameRect()
        )
    }

    /** Mapeo común: rectángulo en vista (fitCenter) → recorte real del bitmap */
    private fun cropWithFitCenterMapping(
        containerW: Float,
        containerH: Float,
        bitmap: Bitmap,
        frame: android.graphics.RectF
    ): ByteArray {
        val imgW = bitmap.width.toFloat()
        val imgH = bitmap.height.toFloat()

        // fitCenter
        val scale   = min(containerW / imgW, containerH / imgH)
        val drawnW  = imgW * scale
        val drawnH  = imgH * scale
        val offsetX = (containerW - drawnW) / 2f
        val offsetY = (containerH - drawnH) / 2f

        // vista -> bitmap
        val bx1 = ((frame.left   - offsetX) / scale)
        val by1 = ((frame.top    - offsetY) / scale)
        val bx2 = ((frame.right  - offsetX) / scale)
        val by2 = ((frame.bottom - offsetY) / scale)

        // clamp
        val x = max(0f, min(imgW - 1f, bx1)).toInt()
        val y = max(0f, min(imgH - 1f, by1)).toInt()
        val w = max(1, (min(imgW, max(0f, bx2)) - x).toInt())
        val h = max(1, (min(imgH, max(0f, by2)) - y).toInt())

        val cropped = Bitmap.createBitmap(bitmap, x, y, w, h)

        val baos = ByteArrayOutputStream()
        cropped.compress(Bitmap.CompressFormat.JPEG, 95, baos)
        return baos.toByteArray()
    }

    /** Subir bytes + estado “Procesando…” / “Listo el proceso” */
    private fun uploadBytes(bytes: ByteArray) {
        setProcesando(true)
        val reqBody = RequestBody.create("image/jpeg".toMediaType(), bytes)
        val part = MultipartBody.Part.createFormData("imagen", "recorte.jpg", reqBody)

        ApiClient.service().procesar(part).enqueue(object : Callback<ResponseBody> {
            override fun onResponse(call: Call<ResponseBody>, response: Response<ResponseBody>) {
                setProcesando(false)
                if (response.isSuccessful) toast("Listo el proceso")
                else toast("Error ${response.code()}")
            }
            override fun onFailure(call: Call<ResponseBody>, t: Throwable) {
                setProcesando(false)
                toast("Fallo: ${t.message}")
            }
        })
    }

    private fun setProcesando(on: Boolean) {
        panelEstado.isVisible = on
        btnCapture.isEnabled = !on
        btnGaleria.isEnabled = !on
        btnToggleConfig.isEnabled = !on
        btnGuardarUrl.isEnabled = !on
        txtEstado.text = if (on) "Procesando imagen..." else ""
    }

    private fun toast(msg: String) =
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
}

