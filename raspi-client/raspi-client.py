# Smart Smoke Alarm Client

# Activates audible alarm when dangerous smoke/co levels are detected
# Use MQTT link to communicate with particle clients that handle sensing

import paho.mqtt.client as mqtt
from playsound import playsound

mqttClient = mqtt.Client()

def on_connect(client, userdata, flags, rc):
    # Abort when connection unsuccessful
    if rc != 0:
        print(f"Could not reach MQTT server - result code {rc}")
        return

    # Subscribe to danger alarm
    print(f"MQTT link ready")
    client.subscribe("smoke-alarm-sensor/danger")

def on_message(client, userdata, msg):
    # Trigger audible danger alarm
    if msg.topic == "smoke-alarm-sensor/danger":
        print(f"Danger alarm triggered")
        playsound('alarm.mp3')

# Establish MQTT link using local server (mosquitto broker)
mqttClient.on_connect = on_connect
mqttClient.on_message = on_message
mqttClient.connect("localhost", 1883, 60)
mqttClient.loop_forever()
