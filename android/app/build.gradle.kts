plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }

android {
    namespace="ai.thara.android"
    compileSdk=37
    defaultConfig {
        applicationId="ai.thara.android"
        minSdk=26
        targetSdk=37
        versionCode=2
        versionName="0.2.0"
    }
}
