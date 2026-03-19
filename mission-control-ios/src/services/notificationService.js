import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useStore } from '../store';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    console.log('[Notifications] Received:', notification);
    
    // Handle briefing approval notifications
    const data = notification.request.content.data;
    if (data?.type === 'briefing_request') {
      useStore.getState().toggleBriefingModal(true);
    }
    
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

export class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
    this.expoPushToken = null;
  }

  async init() {
    // Register for push notifications
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return;
      }

      this.expoPushToken = await Notifications.getExpoPushTokenAsync();
      console.log('[Notifications] Push token:', this.expoPushToken.data);
    } else {
      console.log('[Notifications] Not a physical device');
    }

    // Listen for incoming notifications (app in foreground)
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('[Notifications] Received in foreground:', notification);
      }
    );

    // Listen for notification response (user tapped notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('[Notifications] User responded:', response);
        const data = response.notification.request.content.data;
        
        // Navigate to relevant screen based on notification type
        if (data?.type === 'briefing_request') {
          useStore.getState().toggleBriefingModal(true);
        } else if (data?.projectId) {
          useStore.getState().setActiveProject({ id: data.projectId });
        }
      }
    );
  }

  // Clean up listeners
  destroy() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Update badge count
  async setBadgeCount(count) {
    if (Device.isDevice) {
      await Notifications.setBadgeCountAsync(count);
    }
  }

  // Send local test notification (for development)
  async sendTestNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification',
        data: { type: 'test' },
      },
      trigger: { seconds: 2 },
    });
  }
}

export const notificationService = new NotificationService();
