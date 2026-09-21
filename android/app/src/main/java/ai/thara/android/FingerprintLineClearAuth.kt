package ai.thara.android

import android.content.Context
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

/**
 * Fingerprint Line Clear Authentication
 *
 * Uses Android's system biometric stack. THARA never receives or stores
 * fingerprint images/templates; Android performs biometric verification.
 */
object FingerprintLineClearAuth {
    const val FEATURE_NAME = "Fingerprint Line Clear Authentication"

    fun canAuthenticate(context: Context): Boolean {
        val manager = BiometricManager.from(context)
        return manager.canAuthenticate(
            BiometricManager.Authenticators.BIOMETRIC_STRONG
        ) == BiometricManager.BIOMETRIC_SUCCESS
    }

    fun authenticate(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onFailure: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)
        val prompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    onFailure(errString.toString())
                }

                override fun onAuthenticationFailed() {
                    onFailure("Fingerprint verification failed")
                }
            }
        )

        val info = BiometricPrompt.PromptInfo.Builder()
            .setTitle("THARA Fingerprint Line Clear")
            .setSubtitle("Verify your identity to continue")
            .setDescription("Your fingerprint stays protected by Android's biometric security system.")
            .setNegativeButtonText("Cancel")
            .build()

        prompt.authenticate(info)
    }
}
