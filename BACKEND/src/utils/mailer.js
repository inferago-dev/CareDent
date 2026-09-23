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

/**
 * Every value in these templates is visitor-supplied - a name, a clinic
 * address, the free text of an enquiry. Interpolating it raw let anyone who
 * can reach a public form inject markup into the notification that lands in
 * the office inbox.
 */
const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const row = (label, value) =>
  value || value === 0
    ? `<tr><td style="padding:6px 12px 6px 0;color:#64748b;font-size:13px;">${esc(label)}</td><td style="padding:6px 0;font-size:13px;color:#0f172a;"><strong>${esc(value)}</strong></td></tr>`
    : '';

export function detailsTable(title, pairs) {
  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#082f49;padding:18px 24px;">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Care Dent</div>
        <div style="color:#ffffff;font-size:18px;margin-top:4px;">${esc(title)}</div>
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

/**
 * A password-reset link.
 *
 * The link is the credential, so the copy has to carry the two things that
 * limit the damage of it reaching the wrong inbox: how long it lasts, and what
 * to do if the recipient did not ask for it.
 */
export function passwordResetEmail({ name, url, minutes }) {
  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#082f49;padding:18px 24px;">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Care Dent</div>
        <div style="color:#ffffff;font-size:18px;margin-top:4px;">Reset your password</div>
      </div>
      <div style="padding:24px;color:#0f172a;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 16px;">Hello ${esc(name)},</p>
        <p style="margin:0 0 20px;color:#334155;">
          Someone asked to reset the password on your Care Dent account. Choose
          a new one here:
        </p>
        <p style="margin:0 0 20px;">
          <a href="${esc(url)}" style="display:inline-block;background:#0891b2;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:600;">Set a new password</a>
        </p>
        <p style="margin:0 0 16px;color:#64748b;font-size:13px;">
          The link works once and expires in ${esc(minutes)} minutes. If it has
          run out, ask for another from the sign-in page.
        </p>
        <p style="margin:0;color:#64748b;font-size:13px;">
          If you did not ask for this, you can ignore this email - your password
          has not changed.
        </p>
      </div>
      <div style="padding:0 24px 20px;color:#94a3b8;font-size:11px;word-break:break-all;">
        If the button does not work, paste this into your browser:<br />${esc(url)}
      </div>
    </div>
  </div>`;
}

/** A one-time sign-in code. */
export function signInCodeEmail({ name, code, minutes }) {
  return `
  <div style="font-family:Inter,Segoe UI,Arial,sans-serif;background:#f8fafc;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
      <div style="background:#082f49;padding:18px 24px;">
        <div style="color:#22d3ee;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Care Dent</div>
        <div style="color:#ffffff;font-size:18px;margin-top:4px;">Your sign-in code</div>
      </div>
      <div style="padding:24px;color:#0f172a;font-size:14px;line-height:1.6;">
        <p style="margin:0 0 16px;">Hello ${esc(name)},</p>
        <p style="margin:0 0 20px;color:#334155;">Enter this code to sign in:</p>
        <p style="margin:0 0 20px;font-size:32px;letter-spacing:10px;font-weight:700;color:#082f49;">${esc(code)}</p>
        <p style="margin:0 0 16px;color:#64748b;font-size:13px;">
          It expires in ${esc(minutes)} minutes and can be used once.
        </p>
        <p style="margin:0;color:#64748b;font-size:13px;">
          If you did not try to sign in, ignore this email. Nobody can use the
          code without it.
        </p>
      </div>
    </div>
  </div>`;
}

export const mailEnabled = enabled;
