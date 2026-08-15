import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

let transporter = null;
const enabled = Boolean(env.smtp.host && env.smtp.user && env.smtp.pass);

if (enabled) {
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
} else {
  console.log('[mail] SMTP not configured - notifications will be logged to console only.');
}

/**
 * Never throws: a failed notification must not fail the customer's request.
 */
export async function sendMail({ to, subject, html, text, replyTo }) {
  const recipient = to || env.smtp.notifyTo;
  if (!recipient) return { sent: false, reason: 'no-recipient' };

  if (!enabled) {
    console.log(`[mail:skipped] to=${recipient} subject="${subject}"`);
    return { sent: false, reason: 'smtp-disabled' };
  }

  try {
    const info = await transporter.sendMail({
      from: env.smtp.from,
      to: recipient,
      subject,
      text: text || html?.replace(/<[^>]+>/g, ' '),
      html,
      replyTo,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[mail:error] ${err.message}`);
    return { sent: false, reason: err.message };
  }
}

const row = (label, value) =>
  value ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;">${label}</td><td style="padding:6px 0;font-size:13px;color:#0f172a;"><strong>${value}</strong></td></tr>` : '';

export function detailsTable(title, pairs) {
  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#082f49;padding:18px 24px;">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Care Dent</div>
        <div style="color:#ffffff;font-size:18px;margin-top:4px;">${title}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;padding:24px;margin:16px 24px;">
        ${pairs.map(([l, v]) => row(l, v)).join('')}
      </table>
      <div style="padding:0 24px 20px;color:#94a3b8;font-size:11px;">
        Sent automatically by the Care Dent website.
      </div>
    </div>
  </div>`;
}

/**
 * A reply email from the admin to a customer, preserving line breaks.
 * `footerNote` is used for the "we'll call you" scheduling disclaimer since
 * the site has no live chat yet.
 */
export function replyEmail({ heading, intro, replyMessage, footerNote }) {
  const esc = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#082f49;padding:18px 24px;">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Care Dent</div>
        <div style="color:#ffffff;font-size:18px;margin-top:4px;">${esc(heading)}</div>
      </div>
      <div style="padding:24px;color:#0f172a;font-size:14px;line-height:1.6;">
        ${intro ? `<p style="margin:0 0 16px;color:#334155;">${esc(intro)}</p>` : ''}
        <p style="margin:0;white-space:pre-line;">${esc(replyMessage)}</p>
        ${footerNote ? `<p style="margin:20px 0 0;color:#64748b;font-size:12px;border-top:1px solid #e2e8f0;padding-top:16px;">${esc(footerNote)}</p>` : ''}
      </div>
      <div style="padding:0 24px 20px;color:#94a3b8;font-size:11px;">
        Sent by Care Dent · +91 94441 53599
      </div>
    </div>
  </div>`;
}

export const mailEnabled = enabled;
