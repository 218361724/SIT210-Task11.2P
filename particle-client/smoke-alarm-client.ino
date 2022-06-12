/*
  Smart Smoke Alarm Client

  Sends collected MQ2 sensor data to web server API.
  
  Integrates with Raspberry Pi over LAN to sound alarm.
*/

#include "MQ2.h"
#include "MQTT.h"

#define CURRENT_CLIENT_ID "X"
#define RASPI_CLIENT_MQTT_IP "XX.XX.XX.XX"
#define RASPI_CLIENT_MQTT_PORT 1883
#define SMOKE_DANGER_LEVEL 30
#define CO_DANGER_LEVEL 1

// -- Environment state

// Smoke sensor
double prevSmokeLevel = 0;
double prevCoLevel = 0;
MQ2 mq2(A5);

// Raspi client MQTT link
int raspiClientConnRetry = 0;
MQTT raspiClient(RASPI_CLIENT_MQTT_IP, RASPI_CLIENT_MQTT_PORT, raspiClientCallback);

void setup() {
  // Open serial communications
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect - needed for native USB port only
  }
  
  // Calibrate smoke sensor
  mq2.begin();
  
  // Open MQTT link with Raspi client
  raspiClient.connect("particle_" + String(CURRENT_CLIENT_ID));
}

void loop() {
  // Collect smoke sensor readings
  mq2.read(true);
  double smokeLevel = mq2.readSmoke();
  double coLevel = mq2.readCO();

  // Store current smoke/CO levels with server API
  Particle.publish(
    "smoke-alarm-sensor",
    String(smokeLevel) + "," + String(coLevel),
    PRIVATE
  );
  
  // Handle audible alarm for dangerous levels
  syncWithRaspiClient(smokeLevel, coLevel);

  // Throttle to once every 10 seconds
  delay(10 * 1000);
}

void syncWithRaspiClient(double smokeLevel, double coLevel) {
  // Abort if connection is not working
  if (!raspiClient.isConnected()) {
    // Notify server API on 3rd connection failure
    raspiClientConnRetry += 1;
    if (raspiClientConnRetry >= 3) {
      Particle.publish(
        "smoke-alarm-health",
        "raspi-client-conn-down",
        PRIVATE
      );
    }

    return;
  }
  
  // Reset connection failures
  raspiClientConnRetry = 0;
  raspiClient.loop();

  // -- Activate audible alarm when levels exceed threshold

  // Calculate moving average to reduce noise
  double avgSmokeLevel = (prevSmokeLevel + smokeLevel) / 2;
  double avgCoLevel = (prevCoLevel + coLevel) / 2;
  prevSmokeLevel = smokeLevel;
  prevCoLevel = coLevel;

  // Notify raspi client
  if (avgSmokeLevel >= SMOKE_DANGER_LEVEL || avgCoLevel >= CO_DANGER_LEVEL) {
    raspiClient.publish("smoke-alarm-sensor/danger","danger");  
  }
}

void raspiClientCallback(char* topic, byte* payload, unsigned int length) {
  // Ignore subscriptions
};
