package com.jimrc.apptesis

import ApiService
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {
    @Volatile private var retrofit: Retrofit? = null
    @Volatile private var currentBaseUrl: String = "http://192.168.1.4:5000/"

    private fun buildRetrofit(baseUrl: String): Retrofit {
        val interceptor = HttpLoggingInterceptor().apply { level = HttpLoggingInterceptor.Level.BODY }
        val client = OkHttpClient.Builder()
            .addInterceptor(interceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(120, TimeUnit.SECONDS)
            .writeTimeout(120, TimeUnit.SECONDS)
            .build()
        return Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Synchronized fun setBaseUrl(baseUrl: String) {
        currentBaseUrl = baseUrl
        retrofit = buildRetrofit(baseUrl)
    }
    private fun ensureRetrofit(): Retrofit = retrofit ?: buildRetrofit(currentBaseUrl).also { retrofit = it }
    fun service(): ApiService = ensureRetrofit().create(ApiService::class.java)
    fun getBaseUrl(): String = currentBaseUrl
}
