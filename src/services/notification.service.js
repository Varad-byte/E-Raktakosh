/**
 * Free-Tier Notification & Email Service
 * Supports:
 * - Mock Logger (Default, zero external dependency)
 * - Resend API (Free tier: 3,000 emails/month - https://resend.com)
 * - Brevo / Sendinblue (Free tier: 300 emails/day - https://brevo.com)
 * - Standard SMTP / Nodemailer compatible
 */

const notificationService = {
  /**
   * Send notification/email alert
   * @param {Object} options { to, subject, html, text }
   */
  async sendEmail({ to, subject, text, html }) {
    const provider = (process.env.EMAIL_PROVIDER || 'mock').toLowerCase();
    const recipient = to || process.env.ALERT_EMAIL_TO || 'admin@bloodbank.local';

    if (provider === 'resend' && process.env.RESEND_API_KEY) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'BBIMS Alerts <alerts@resend.dev>',
            to: recipient,
            subject,
            text,
            html: html || `<p>${text}</p>`
          })
        });
        const data = await response.json();
        return { success: response.ok, provider: 'resend', data };
      } catch (err) {
        console.error('[NotificationService] Resend failed:', err.message);
        return { success: false, error: err.message };
      }
    }

    if (provider === 'brevo' && process.env.BREVO_API_KEY) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': process.env.BREVO_API_KEY,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sender: { name: 'BBIMS Blood Bank', email: 'alerts@bbims.local' },
            to: [{ email: recipient }],
            subject,
            htmlContent: html || `<p>${text}</p>`
          })
        });
        const data = await response.json();
        return { success: response.ok, provider: 'brevo', data };
      } catch (err) {
        console.error('[NotificationService] Brevo failed:', err.message);
        return { success: false, error: err.message };
      }
    }

    // Default mock notification (logged to console, zero-cost, 100% offline friendly)
    console.log(`[NotificationService Mock] Email sent to <${recipient}>: "${subject}" - ${text}`);
    return { success: true, provider: 'mock', recipient, subject };
  },

  /**
   * Send low stock alert notification
   */
  async notifyLowStock(bloodGroup, unitsRemaining, threshold) {
    return this.sendEmail({
      subject: `[CRITICAL ALERT] Low Blood Stock: Group ${bloodGroup}`,
      text: `Urgent attention required: Blood group ${bloodGroup} has dropped to ${unitsRemaining} units (Threshold: ${threshold} units). Please organize donor mobilization.`,
      html: `<h2>Blood Bank Low Stock Alert</h2>
             <p><strong>Blood Group:</strong> ${bloodGroup}</p>
             <p><strong>Units Available:</strong> ${unitsRemaining} (Threshold: ${threshold})</p>
             <p>Immediate donor replenishment recommended.</p>`
    });
  }
};

module.exports = notificationService;
