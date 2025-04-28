import moment from "moment-timezone";

export default function getTorontoUTCOffset() {
  const now = moment();
  const offsetInMinutes = now.tz("America/Toronto").utcOffset();
  const offsetInHours = offsetInMinutes / 60;
  return offsetInHours;
}
