package za.co.absa.hyperdrive.trigger.models

import play.api.libs.json.JsValue

case class Event(
  sensorEventId: String,
  sensorId: Long,
  payload: JsValue,
  id: Long = 0
)