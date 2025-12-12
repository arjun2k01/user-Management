import nodemailer from "nodemailer";
import logger from "./logger.js";

// Uses SMTP if configured; otherwise logs email (so reset still works in dev)
export const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // ✅ Fallback: if SMTP not set, don't crash deployment
  if (!host || !user || !pass) {
    logger.warn(
      `SMTP not configured. Skipping email send.\nTo: ${to}\nSubject: ${subject}\n` +
        (text ? `Text:\n${text}\n` : "") +
        (html ? `HTML length: ${html.length}\n` : "")
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587
    auth: { user, pass },
  });

  const from =
    process.env.EMAIL_FROM ||
    `User Management <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
};
