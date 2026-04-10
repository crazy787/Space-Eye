import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import axios from 'axios';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function configureFCM() {
  let token;
  
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('FCM Token:', token);
    
    // Send token to backend
    try {
      const response = await axios.post(`${process.env.API_BASE_URL}/api/auth/fcm-token`, {
        fcmToken: token,
      });
      console.log('FCM token registered:', response.data);
    } catch (error) {
      console.error('Error registering FCM token:', error);
    }
  } else {
    console.log('Must use physical device for FCM');
  }

  return token;
}

export async function getPushToken() {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;
  
  if (status !== 'granted') {
    const { status: requestedStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = requestedStatus;
  }
  
  if (finalStatus !== 'granted') {
    console.log('Permission not granted to get push token');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}

export async function schedulePassAlert(passData) {
  const { title, body, data, fireDate } = passData;

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: fireDate,
  });
}

export async function cancelNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

export async function scheduleLocalNotification({ title, body, data, fireDate }) {
  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: 'default',
      badge: 1,
    },
    trigger: fireDate || null,
  });
}

export function cancelAllNotifications() {
  Notifications.cancelAllScheduledNotificationsAsync();
}

export async function getDeliveredNotifications() {
  return await Notifications.getAllDeliveredNotificationsAsync();
}

export async function deleteDeliveredNotification(notificationId) {
  await Notifications.deleteNotificationAsync(notificationId);
}
