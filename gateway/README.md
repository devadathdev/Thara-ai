# THARA Hardware Gateway

The gateway is the physical-world boundary for THARA.

Architecture:

THARA AI -> Firebase Auth -> Line Clear -> Gateway API -> Protocol Adapter -> Device -> Telemetry

## Supported protocol families

- OPC UA
- MQTT
- Sparkplug B
- Modbus

## Safety model

1. Firebase identity is required.
2. Explicit equipment/gateway approval is required.
3. Fingerprint Line Clear proof is required for protected operations.
4. Devices default to simulation mode.
5. No physical command is sent by the web application directly.
6. A real protocol adapter must be installed on the gateway host before physical execution is enabled.
7. Every command should be audited and correlated with a command ID.

## Recommended gateway deployment

Run a small Linux service on the laptop/industrial PC that is physically connected to the equipment network.

The service should expose only an authenticated outbound connection to THARA and keep protocol credentials on the gateway host. THARA should never receive PLC passwords, Modbus credentials, OPC UA private keys, or raw machine-network access.

Suggested adapter layout:

gateway/
  service
  adapters/
    opcua
    mqtt
    sparkplug
    modbus
  policy/
  audit/
  telemetry/

## Activation sequence

1. Install the gateway service on the laptop.
2. Pair the gateway with THARA using a short-lived enrollment token.
3. Register devices as simulation first.
4. Verify read-only telemetry.
5. Run an approval-gated simulation.
6. Install and test the relevant protocol adapter.
7. Enable physical execution only after local safety checks and an explicit operator approval policy are configured.

Until those steps are complete, THARA reports simulation/adapter-required status instead of claiming physical execution.
