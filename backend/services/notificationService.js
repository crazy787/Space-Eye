// Firebase Cloud Messaging notification service
// Note: Full FCM integration requires firebase-admin SDK and service account credentials
// When Firebase is configured, uncomment the firebase-admin lines below

const User = require('../models/User');

class NotificationService {
  constructor() {
    this.initialized = false;
    // Initialize Firebase Admin when credentials are available:
    // const admin = require('firebase-admin');
    // admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    // this.messaging = admin.messaging();
    // this.initialized = true;
  }

  /**
   * Send a push notification to a specific device
   * @param {string} fcmToken - Device FCM token
   * @param {string} title - Notification title
   * @param {string} body - Notification body
   * @param {Object} data - Additional data payload
   */
  async sendNotification(fcmToken, title, body, data = {}) {
    if (!this.initialized) {
      console.log('📱 [Mock Notification]', { title, body, data });
      return { success: true, mock: true };
    }

    try {
      const message = {
        token: fcmToken,
        notification: {
          title,
          body,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        android: {
          priority: 'high',
          notification: {
            icon: 'ic_notification',
            color: '#6C63FF',
            channelId: 'iss_alerts',
          },
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
            },
          },
        },
      };

      // const result = await this.messaging.send(message);
      // return { success: true, messageId: result };
      return { success: true, mock: true };
    } catch (error) {
      console.error('Notification send error:', error.message);
      throw new Error('Failed to send notification');
    }
  }

  /**
   * Send notification to a user by userId (looks up FCM token from User model)
   * @param {string} userId - MongoDB user ID
   * @param {Object} payload - { title, body, data }
   */
  async sendToUser(userId, payload) {
    try {
      const user = await User.findById(userId).select('fcmToken preferences');

      if (!user) {
        console.warn(`User ${userId} not found for notification`);
        return { success: false, reason: 'user_not_found' };
      }

      // Check if user has notifications enabled
      if (user.preferences?.alertsEnabled === false) {
        console.log(`📱 [Skipped] User ${userId} has notifications disabled`);
        return { success: false, reason: 'notifications_disabled' };
      }

      if (!user.fcmToken) {
        console.log(`📱 [No Token] User ${userId} has no FCM token registered`);
        return { success: false, reason: 'no_fcm_token' };
      }

      return this.sendNotification(
        user.fcmToken,
        payload.title,
        payload.body,
        payload.data || {}
      );
    } catch (error) {
      console.error(`sendToUser error for ${userId}:`, error.message);
      return { success: false, reason: 'send_error', error: error.message };
    }
  }

  /**
   * Send ISS pass alert to a specific device
   */
  async sendPassAlert(fcmToken, passData) {
    const title = '🛰️ ISS Passing Overhead!';
    const body = `ISS will be visible in ${passData.minutesUntil} minutes! Look ${passData.direction} for ${passData.duration}s.`;
    const data = {
      type: 'iss_pass',
      startTime: passData.startTime.toString(),
      direction: passData.direction,
      duration: passData.duration.toString(),
    };

    return this.sendNotification(fcmToken, title, body, data);
  }

  /**
   * Send notification to multiple users
   * @param {string[]} userIds - Array of MongoDB user IDs
   * @param {Object} payload - { title, body, data }
   */
  async sendToUsers(userIds, payload) {
    const results = await Promise.allSettled(
      userIds.map((id) => this.sendToUser(id, payload))
    );

    const succeeded = results.filter((r) => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - succeeded;

    console.log(`📱 Batch notification: ${succeeded} sent, ${failed} failed`);
    return { succeeded, failed, total: results.length };
  }
}

module.exports = new NotificationService();
