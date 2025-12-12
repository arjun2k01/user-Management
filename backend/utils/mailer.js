import nodemailer from "nodemailer";

/**
 * SMTP configuration
 * Required env (choose one approach):
 * 1) SMTP_URL (e.g. smtp://user:pass@smtp.example.com:587)
 * OR
 * 2) SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 *
 * Optional:
 * SMTP_FROM (default: SMTP_USER)
 */
export const createTransporter = () => {
  const smtpUrl = process.env.SMTP_URL;

  if (smtpUrl) {
    return nodemailer.createTransport(smtpUrl);
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

export const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  if (!transporter) {
    const err = new Error(
      "SMTP is not configured. Set SMTP_URL or SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS."
    );
    err.statusCode = 500;
    throw err;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text,
  });
};
