import { Capacitor } from '@capacitor/core';

const DAILY_GUM_NOTIFICATION_ID = 15015;

async function getLocalNotifications() {
  const mod = await import('@capacitor/local-notifications');
  return mod.LocalNotifications;
}

export async function cancelDailyGumReminder(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;

  try {
    const LocalNotifications = await getLocalNotifications();
    await LocalNotifications.cancel({
      notifications: [{ id: DAILY_GUM_NOTIFICATION_ID }],
    });
  } catch {
    // ignore
  }
}

export async function scheduleDailyGumReminder(fireAt: Date): Promise<void> {
  if (typeof window === 'undefined') return;
  if (!Capacitor.isNativePlatform()) return;

  const LocalNotifications = await getLocalNotifications();

  const current = await LocalNotifications.checkPermissions();
  if (current.display !== 'granted') {
    const requested = await LocalNotifications.requestPermissions();
    if (requested.display !== 'granted') return;
  }

  // Replace any prior schedule for this reminder.
  await cancelDailyGumReminder();

  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_GUM_NOTIFICATION_ID,
        title: 'Daily GUM Ready',
        body: 'Your +15 GUM is ready to claim. Tap to open Flunks.',
        schedule: { at: fireAt, allowWhileIdle: true },
        extra: { type: 'daily_gum' },
      },
    ],
  });
}
