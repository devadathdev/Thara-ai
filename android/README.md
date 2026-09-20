# THARA Android Companion

Native Android companion architecture for THARA.

## Modules

- `companion`: foreground/background lifecycle, notifications and secure assistant transport.
- `wakeword`: low-power wake-word boundary. The production detector must be supplied as a native/ONNX/TFLite model and run locally; no continuous cloud audio is required.
- `local-model`: local inference adapter with model health checks and cloud fallback.
- `security`: Android permission and action-confirmation boundary.

## Runtime policy

Wake-word detection is intentionally local. Audio is not uploaded merely to detect the wake phrase. Microphone access, notification access and any background service must be explicitly granted by the user.

## Build

Open this directory in Android Studio and connect it to the THARA API. Replace the placeholder local model and wake-word assets with models appropriate for the target device.
