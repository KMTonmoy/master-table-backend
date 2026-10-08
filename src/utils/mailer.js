import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!env.SMTP_HOST || !env.SMTP_USER) return null;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return transporter;
};

export const sendMail = async ({ to, subject, html, text }) => {
  const t = getTransporter();
  if (!t) {
    console.warn("[mailer] SMTP not configured, skipping send to", to);
    return null;
  }

  return t.sendMail({
    from: env.SMTP_FROM,
    to,
    subject,
    html,
    text,
  });
};

export const sendPasswordResetEmail = async (to, resetUrl) => {
  const subject = "Reset your Master Table password";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;background:#faf7f2;border-radius:12px;">
      <h2 style="color:#E0A526;margin:0 0 12px;">Master Table</h2>
      <p style="color:#2B1B10;font-size:15px;line-height:1.6;">We received a request to reset your password.</p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}"
           style="background:#E0A526;color:#2B1B10;font-weight:bold;padding:12px 22px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
      </p>
      <p style="color:#6B6B6B;font-size:13px;line-height:1.6;">This link expires in 30 minutes. If you didn't request this, ignore this email.</p>
      <p style="color:#6B6B6B;font-size:12px;word-break:break-all;">${resetUrl}</p>
    </div>
  `;

  const text = `Reset your Master Table password: ${resetUrl} (expires in 30 minutes)`;

  return sendMail({ to, subject, html, text });
};