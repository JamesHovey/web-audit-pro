import { Resend } from 'resend'

// Email configuration
const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@example.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Lazy initialization of Resend client
let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

export interface AuditCompletionEmailData {
  userEmail: string
  userName?: string
  auditId: string
  url: string
  scope: string
  totalPages?: number
  completedAt: string
}

/**
 * Send audit completion notification email
 */
export async function sendAuditCompletionEmail(data: AuditCompletionEmailData): Promise<boolean> {
  // Skip if no user email
  if (!data.userEmail) {
    console.log('📧 Email notification skipped: No user email provided')
    return false
  }

  // Get Resend client (lazy initialization)
  const resend = getResendClient()
  if (!resend) {
    console.log('📧 Email notification skipped: RESEND_API_KEY not configured')
    return false
  }

  try {
    const auditUrl = `${APP_URL}/audit/${data.auditId}`
    const scopeLabel = data.scope === 'single'
      ? 'Single Page'
      : data.scope === 'all'
        ? `All Pages (${data.totalPages || 0} pages)`
        : `${data.totalPages || 0} Pages`

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Audit is Complete</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 40px auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background-color: #000000; color: white; padding: 32px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px; font-weight: bold;">✅ Audit Complete</h1>
      <p style="margin: 8px 0 0 0; color: #a3c1f7; font-size: 14px;">Your website audit has finished processing</p>
    </div>

    <!-- Content -->
    <div style="padding: 32px;">
      ${data.userName ? `<p style="font-size: 16px; color: #333; margin: 0 0 16px 0;">Hi ${data.userName},</p>` : ''}

      <p style="font-size: 16px; color: #333; margin: 0 0 24px 0;">
        Your audit for <strong>${data.url}</strong> has been completed successfully.
      </p>

      <!-- Audit Details Box -->
      <div style="background-color: #f8f9fa; border-left: 4px solid #4169E1; padding: 16px; margin: 0 0 24px 0; border-radius: 4px;">
        <div style="margin-bottom: 12px;">
          <span style="color: #666; font-size: 14px;">Audit Type:</span>
          <br/>
          <span style="color: #333; font-size: 16px; font-weight: 600;">${scopeLabel}</span>
        </div>
        <div>
          <span style="color: #666; font-size: 14px;">Completed:</span>
          <br/>
          <span style="color: #333; font-size: 16px; font-weight: 600;">${new Date(data.completedAt).toLocaleString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 32px 0;">
        <a href="${auditUrl}" style="display: inline-block; background-color: #4169E1; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 16px;">View Audit Results</a>
      </div>

      <p style="font-size: 14px; color: #666; margin: 24px 0 0 0; text-align: center;">
        Or copy this link: <a href="${auditUrl}" style="color: #4169E1; text-decoration: none;">${auditUrl}</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 24px 32px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-size: 12px; color: #999;">
        This is an automated notification from Web Audit Pro. If you didn't request this audit, please disregard this email.
      </p>
    </div>
  </div>
</body>
</html>
    `

    const emailText = `
Your Audit is Complete

Hi ${data.userName || 'there'},

Your audit for ${data.url} has been completed successfully.

Audit Type: ${scopeLabel}
Completed: ${new Date(data.completedAt).toLocaleString('en-GB')}

View your audit results here: ${auditUrl}

---
This is an automated notification from Web Audit Pro.
    `

    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.userEmail,
      subject: `✅ Your audit for ${data.url} is complete`,
      html: emailHtml,
      text: emailText
    })

    console.log(`📧 Audit completion email sent to ${data.userEmail}`)
    return true
  } catch (error) {
    console.error('📧 Failed to send audit completion email:', error)
    return false
  }
}

/**
 * Send test email to verify configuration
 */
export async function sendTestEmail(toEmail: string): Promise<boolean> {
  // Get Resend client (lazy initialization)
  const resend = getResendClient()
  if (!resend) {
    console.log('📧 Test email skipped: RESEND_API_KEY not configured')
    return false
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: toEmail,
      subject: 'Test Email from Web Audit Pro',
      html: '<p>This is a test email. Your email configuration is working correctly!</p>',
      text: 'This is a test email. Your email configuration is working correctly!'
    })

    console.log(`📧 Test email sent to ${toEmail}`)
    return true
  } catch (error) {
    console.error('📧 Failed to send test email:', error)
    return false
  }
}
