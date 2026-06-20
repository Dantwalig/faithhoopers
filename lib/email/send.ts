// Email sender using Nodemailer + Gmail SMTP.
//
// Setup:
//   1. Enable 2-Step Verification on your Google account
//   2. Go to myaccount.google.com/apppasswords and generate an App Password
//   3. Set GMAIL_USER and GMAIL_PASS in your environment
//
// If GMAIL_USER or GMAIL_PASS is not set, sendEmail() logs to the console
// instead of throwing — signups will still work locally without credentials.

import nodemailer from 'nodemailer'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
})

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean }> {
  const from = `Faith Hoopers <${process.env.GMAIL_USER}>`

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.warn(
      `[email] GMAIL_USER or GMAIL_PASS not set — skipping send. Would have emailed "${subject}" to ${to}.`
    )
    return { sent: false }
  }

  try {
    await transporter.sendMail({ from, to, subject, html })
    return { sent: true }
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return { sent: false }
  }
}

function emailShell(bodyHtml: string): string {
  return `
  <div style="background:#0a0a0a;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#161616;border-radius:24px;border:1px solid rgba(255,255,255,0.08);padding:32px;">
      <p style="font-family:Georgia,serif;font-weight:bold;font-size:20px;color:#ffffff;margin:0 0 24px;">
        🏀 Faith Hoopers
      </p>
      ${bodyHtml}
      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:32px;">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
  </div>`
}

export function verificationEmailHtml(opts: { name: string; code: string; isParentInvite?: boolean }): string {
  const intro = opts.isParentInvite
    ? `Your child added you as their parent/guardian on Faith Hoopers. To activate your account, verify your email and set a password using the code below.`
    : `Thanks for signing up for Faith Hoopers! Enter the code below to verify your email and activate your account.`

  return emailShell(`
    <p style="color:#fff;font-size:16px;margin:0 0 8px;">Hi ${escapeHtml(opts.name)},</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">${intro}</p>
    <div style="background:#000;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 8px;">Your verification code</p>
      <p style="color:#ff6a3d;font-size:32px;font-weight:bold;letter-spacing:0.1em;margin:0;">${opts.code}</p>
    </div>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">This code expires in 24 hours.</p>
  `)
}

export function welcomeEmailHtml(opts: { name: string }): string {
  return emailShell(`
    <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 8px;">Welcome to Faith Hoopers, ${escapeHtml(opts.name)}! 🎉</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0;">
      Your email is verified and your account is active. We're excited to have you on the team —
      sign in any time to see the schedule, devotionals, and announcements.
    </p>
  `)
}

export function resetPasswordEmailHtml(opts: { name: string; code: string }): string {
  return emailShell(`
    <p style="color:#fff;font-size:16px;margin:0 0 8px;">Hi ${escapeHtml(opts.name)},</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">
      We received a request to reset your Faith Hoopers password. Enter the code below to choose a new one.
    </p>
    <div style="background:#000;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 8px;">Your reset code</p>
      <p style="color:#ff6a3d;font-size:32px;font-weight:bold;letter-spacing:0.1em;margin:0;">${opts.code}</p>
    </div>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">This code expires in 1 hour. If you didn't request a password reset, you can ignore this email — your password won't change.</p>
  `)
}

export function adminInviteEmailHtml(opts: { name: string; code: string }): string {
  return emailShell(`
    <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 8px;">You've been set up as a Faith Hoopers admin</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">
      Hi ${escapeHtml(opts.name)}, an administrator account has been created for you on the Faith Hoopers platform.
      Use the code below at the link to set your password and get started.
    </p>
    <div style="background:#000;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
      <p style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.05em;text-transform:uppercase;margin:0 0 8px;">Your setup code</p>
      <p style="color:#ff6a3d;font-size:32px;font-weight:bold;letter-spacing:0.1em;margin:0;">${opts.code}</p>
    </div>
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">Go to Faith Hoopers → Forgot password, enter this email and code to set your password. This code expires in 24 hours.</p>
  `)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
