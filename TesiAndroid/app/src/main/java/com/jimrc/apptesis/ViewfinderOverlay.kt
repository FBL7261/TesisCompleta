package com.jimrc.apptesis

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

class ViewfinderOverlay @JvmOverloads constructor(
    context: Context, attrs: AttributeSet? = null
) : View(context, attrs) {

    private val framePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.STROKE
        strokeWidth = 6f
        color = 0xAAFFFFFF.toInt()
    }
    private val shadePaint = Paint().apply {
        isAntiAlias = true
        style = Paint.Style.FILL
        color = 0x66000000
    }

    private var lastRect: RectF = RectF()

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val w = width.toFloat()
        val h = height.toFloat()

        val fw = w * 0.70f
        val fh = h * 0.45f
        val left = (w - fw) / 2f
        val top  = (h - fh) / 2f
        lastRect.set(left, top, left + fw, top + fh)

        canvas.drawRect(0f, 0f, w, top, shadePaint)
        canvas.drawRect(0f, top, left, top + fh, shadePaint)
        canvas.drawRect(left + fw, top, w, top + fh, shadePaint)
        canvas.drawRect(0f, top + fh, w, h, shadePaint)

        canvas.drawRoundRect(lastRect, 16f, 16f, framePaint)
    }

    fun getFrameRect(): RectF = RectF(lastRect)
}
