// Email sender using Nodemailer with Gmail (faithhooperscamp@gmail.com).
//
// Setup:
//   1. Enable 2-Step Verification on the Gmail account.
//   2. Go to Google Account → Security → App Passwords.
//   3. Generate an App Password for "Mail" and copy it.
//   4. Add these to your .env:
//        GMAIL_USER=faithhooperscamp@gmail.com
//        GMAIL_APP_PASSWORD=your-16-char-app-password
//        NEXTAUTH_URL=https://yourapp.vercel.app   (or http://localhost:3000 locally)
//
// If GMAIL_USER or GMAIL_APP_PASSWORD is not set, sendEmail() logs to the
// console instead of throwing — local dev works without credentials, but
// real emails will NOT go out until both vars are configured.

import nodemailer from 'nodemailer'

interface SendEmailInput {
  to: string
  subject: string
  html: string
}

function createTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { type: 'login', user, pass },
  })
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<{ sent: boolean }> {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    console.warn(
      `[email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping send. Would have emailed "${subject}" to ${to}.`
    )
    return { sent: false }
  }

  const transporter = createTransporter()!

  try {
    await transporter.sendMail({
      from: `"Faith Hoopers" <${user}>`,
      to,
      subject,
      html,
    })
    return { sent: true }
  } catch (err) {
    console.error('[email] Failed to send:', err)
    return { sent: false }
  }
}

// Base URL used to build links inside emails (verify, reset, set password).
// Falls back to localhost for local dev when NEXTAUTH_URL isn't set.
export function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return url.replace(/\/+$/, '')
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

function emailButton(label: string, link: string): string {
  return `
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${link}" style="display:inline-block;background:#ff6a3d;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:14px;">
        ${label}
      </a>
    </div>
    <p style="color:rgba(255,255,255,0.3);font-size:12px;word-break:break-all;margin:0 0 24px;">
      Or paste this link into your browser:<br/>
      <span style="color:rgba(255,255,255,0.45);">${link}</span>
    </p>`
}

// Sent to self-registered accounts (players, coaches, facilitators) right
// after signup. Clicking the link verifies their email and activates the
// account — they already set a password during registration.
export function verificationEmailHtml(opts: { name: string; link: string }): string {
  return emailShell(`
    <p style="color:#fff;font-size:16px;margin:0 0 8px;">Hi ${escapeHtml(opts.name)},</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">
      Thanks for signing up for Faith Hoopers! Click below to verify your email and activate your account.
    </p>
    ${emailButton('Verify email', opts.link)}
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">This link expires in 24 hours.</p>
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

// Sent for a genuine forgot-password request — the account already has a
// password, this lets them choose a new one.
export function resetPasswordEmailHtml(opts: { name: string; link: string }): string {
  return emailShell(`
    <p style="color:#fff;font-size:16px;margin:0 0 8px;">Hi ${escapeHtml(opts.name)},</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">
      We received a request to reset your Faith Hoopers password. Click below to choose a new one.
    </p>
    ${emailButton('Reset password', opts.link)}
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">This link expires in 1 hour. If you didn't request a password reset, you can ignore this email — your password won't change.</p>
  `)
}

// Sent for accounts that were created on someone else's behalf and don't
// have a usable password yet: auto-created parent accounts (when a child
// registers with a parent's email) and admin accounts (from the seed
// script). Clicking the link lets them choose a password for the first
// time, which also verifies their email and activates the account.
export function setPasswordEmailHtml(opts: { name: string; link: string; reason: 'admin' | 'parent' }): string {
  const heading = opts.reason === 'admin'
    ? "You've been set up as a Faith Hoopers admin"
    : 'Your child added you as their parent/guardian'

  const intro = opts.reason === 'admin'
    ? `Hi ${escapeHtml(opts.name)}, an administrator account has been created for you on the Faith Hoopers platform. Click below to set your password and get started.`
    : `Hi ${escapeHtml(opts.name)}, your child added you as their parent/guardian on Faith Hoopers. Click below to set a password and activate your account.`

  return emailShell(`
    <p style="color:#fff;font-size:18px;font-weight:bold;margin:0 0 8px;">${heading}</p>
    <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.5;margin:0 0 24px;">${intro}</p>
    ${emailButton('Set password', opts.link)}
    <p style="color:rgba(255,255,255,0.4);font-size:13px;margin:0;">This link expires in 24 hours.</p>
  `)
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
}
