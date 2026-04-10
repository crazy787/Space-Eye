const n2yoService = require('../services/n2yoService');
const Alert = require('../models/Alert');
const notificationService = require('../services/notificationService');
const { NORAD_IDS, DEFAULT_ALERT_BEFORE_MINUTES } = require('../config/constants');

class Scheduler {
  constructor() {
    this.intervals = {};
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('📅 Scheduler started');

    // Check for upcoming passes every 5 minutes
    this.intervals.passCheck = setInterval(() => this.checkUpcomingPasses(), 5 * 60 * 1000);

    // Initial run after 10 seconds
    setTimeout(() => this.checkUpcomingPasses(), 10000);
  }

  stop() {
    this.isRunning = false;
    Object.values(this.intervals).forEach(clearInterval);
    this.intervals = {};
    console.log('📅 Scheduler stopped');
  }

  async checkUpcomingPasses() {
    try {
      // Find active alert subscriptions
      const activeAlerts = await Alert.find({ active: true }).limit(50);
      if (!activeAlerts.length) return;

      console.log(`📡 Checking passes for ${activeAlerts.length} subscriptions...`);

      for (const alert of activeAlerts) {
        try {
          const passes = await n2yoService.getVisualPasses(
            alert.noradId || NORAD_IDS.ISS,
            alert.latitude,
            alert.longitude,
            alert.altitude || 0,
            1, // Check next day only
            60  // Min 60s visibility
          );

          if (passes?.passes?.length > 0) {
            const nextPass = passes.passes[0];
            const passTime = nextPass.startUTC * 1000;
            const now = Date.now();
            const minutesUntilPass = (passTime - now) / 60000;

            // Trigger alert if pass is within the alert window
            if (minutesUntilPass > 0 && minutesUntilPass <= DEFAULT_ALERT_BEFORE_MINUTES) {
              await this.triggerPassAlert(alert, nextPass, minutesUntilPass);
            }

            // Update alert with next pass info
            alert.nextPass = {
              startTime: new Date(passTime),
              duration: nextPass.duration,
              maxElevation: nextPass.maxEl,
              startAzimuth: nextPass.startAz,
            };
            alert.lastChecked = new Date();
            await alert.save();
          }
        } catch (e) {
          console.warn(`Pass check failed for alert ${alert._id}:`, e.message);
        }
      }
    } catch (error) {
      console.error('Scheduler pass check error:', error.message);
    }
  }

  async triggerPassAlert(alert, pass, minutesUntil) {
    const title = '🛰️ ISS Pass Coming!';
    const body = `Visible in ~${Math.ceil(minutesUntil)} minutes! Duration: ${pass.duration}s, Max elevation: ${pass.maxEl}°`;

    try {
      if (alert.userId) {
        await notificationService.sendToUser(alert.userId, {
          title,
          body,
          data: {
            type: 'pass_alert',
            alertId: alert._id.toString(),
            startTime: (pass.startUTC * 1000).toString(),
            duration: pass.duration.toString(),
            maxElevation: pass.maxEl.toString(),
          },
        });
      }
      console.log(`🔔 Alert triggered: ${body}`);
    } catch (e) {
      console.warn('Notification send failed:', e.message);
    }
  }
}

module.exports = new Scheduler();
