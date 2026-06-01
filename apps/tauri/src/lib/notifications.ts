import { db } from "./db";

// Store notified routine IDs for the current day to prevent duplicate notifications
const notifiedRoutines = new Set<string>();

// Request permission on app startup
export function requestNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  
  if (Notification.permission !== "granted" && Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}

// Check routines scheduled 5 minutes from now and send alerts
export async function checkUpcomingRoutines() {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const now = new Date();
  
  // Calculate target time: 5 minutes from now
  const targetTime = new Date(now.getTime() + 5 * 60 * 1000);
  const targetHour = targetTime.getHours();
  const targetMinute = targetTime.getMinutes();
  
  const targetTimeStr = `${String(targetHour).padStart(2, "0")}:${String(targetMinute).padStart(2, "0")}`;
  const dayIndex = now.getDay();
  const dow = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][dayIndex];
  const dateStr = now.toISOString().split("T")[0];

  try {
    // Get routines scheduled on this day of week
    const allRoutines = await db.routines.where("deleted").equals(0).toArray();
    const todaysRoutines = allRoutines.filter(
      (r) => r.active === 1 && r.daysOfWeek.includes(dow) && r.timeOfDay
    );

    for (const routine of todaysRoutines) {
      if (!routine.timeOfDay) continue;

      // Extract routine time (HH:MM)
      const [rHour, rMinute] = routine.timeOfDay.split(":");
      const routineTimeStr = `${rHour}:${rMinute}`;

      // If scheduled exactly 5 minutes from now
      if (routineTimeStr === targetTimeStr) {
        const uniqueKey = `${routine.id}-${dateStr}`;

        if (!notifiedRoutines.has(uniqueKey)) {
          // Check if this routine was already logged (completed/skipped) today
          const log = await db.routineLogs
            .where("[routineId+date]")
            .equals([routine.id, dateStr])
            .first();

          if (!log) {
            // Send system notification
            new Notification("Lịch hẹn sắp tới! (5 phút nữa)", {
              body: `Sắp tới giờ làm việc: "${routine.title}" lúc ${routineTimeStr}.`,
              tag: routine.id,
              requireInteraction: true,
            });

            notifiedRoutines.add(uniqueKey);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking upcoming routines:", error);
  }
}

// Run loop to check every 30 seconds
let checkInterval: any = null;

export function startNotificationScheduler() {
  requestNotificationPermission();
  
  // Initial check
  checkUpcomingRoutines();

  // Run check every 30 seconds
  checkInterval = setInterval(() => {
    checkUpcomingRoutines();
  }, 30 * 1000);
}

export function stopNotificationScheduler() {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}
