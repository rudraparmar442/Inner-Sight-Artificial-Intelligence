// ── services/emailService.js ──────────────────────────────────
// Nodemailer email sending for:
//   1. Waitlist welcome email → new subscriber
//   2. Mood result email      → user (optional)
//   3. Admin notification     → you, on each new signup

const nodemailer = require('nodemailer');

// ── Create transporter ────────────────────────────────────────
function createTransporter() {
  if (!process.env.EMAIL_FROM || !process.env.EMAIL_APP_PASSWORD) {
    console.log("Missing email environment variables");
    return null;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000,   // 10s for SMTP greeting
    socketTimeout: 15000,     // 15s for the whole socket operation
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.error("SMTP Error:", error);
    } else {
      console.log("SMTP Server Ready");
    }
  });

  return transporter;
}

// ── Email base template ───────────────────────────────────────
function baseTemplate(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0A0F1E;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0F1E;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#0D1528;border-radius:16px 16px 0 0;padding:32px 40px;border-bottom:1px solid rgba(200,150,12,0.2);">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-size:28px;color:#F0B429;">◎</span>
                  <span style="font-family:Georgia,serif;font-size:18px;color:#F5EFE0;margin-left:8px;vertical-align:middle;">Inner Sight AI</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background:#0D1528;padding:40px;">
            ${bodyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#080D1A;border-radius:0 0 16px 16px;padding:24px 40px;border-top:1px solid rgba(138,154,181,0.1);">
            <p style="margin:0;font-size:12px;color:#4A567A;text-align:center;">
              © 2026 Inner Sight AI &nbsp;·&nbsp; Built with empathy.<br/>
              <a href="#" style="color:#4A567A;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 1. Welcome / Waitlist Email ───────────────────────────────
function welcomeEmailHtml(email) {
  const body = `
    <h1 style="font-family:Georgia,serif;font-size:32px;font-weight:300;color:#F5EFE0;margin:0 0 16px;">
      You're in. 🌊
    </h1>
    <p style="font-size:16px;color:#8A9AB5;line-height:1.7;margin:0 0 24px;">
      Welcome to the Inner Sight AI early community. We're building something that actually <em style="color:#F5EFE0;">understands</em> how you feel — not just the words you use.
    </p>
    <div style="background:rgba(200,150,12,0.08);border:1px solid rgba(200,150,12,0.2);border-radius:12px;padding:24px;margin:0 0 32px;">
      <p style="margin:0 0 8px;font-size:13px;color:#C8960C;text-transform:uppercase;letter-spacing:0.1em;font-family:monospace;">What happens next</p>
      <ul style="margin:0;padding:0 0 0 20px;color:#8A9AB5;font-size:15px;line-height:2;">
        <li>You'll get early access before the public launch</li>
        <li>We'll ask for your feedback on new features</li>
        <li>No spam — ever</li>
      </ul>
    </div>
    <p style="font-size:15px;color:#8A9AB5;margin:0 0 28px;">
      In the meantime, try our mood quiz — it takes 60 seconds and gives you a personalised relaxation plan.
    </p>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz.html"
       style="display:inline-block;background:#C8960C;color:#0A0F1E;padding:14px 32px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;letter-spacing:0.04em;">
      Take the Mood Quiz →
    </a>
    <p style="margin:32px 0 0;font-size:13px;color:#4A567A;">
      You joined as: ${email}
    </p>`;
  return baseTemplate('Welcome to Inner Sight AI', body);
}

// ── 2. Mood Result Email ──────────────────────────────────────
function moodResultEmailHtml(mood, description, solutions) {
  const moodColors = {
    anxious: '#C0392B', sad: '#5D6D7E', neutral: '#7D8C9A',
    calm: '#1E7A8A', happy: '#F0A500', energised: '#27AE60',
  };
  const moodEmojis = {
    anxious: '😰', sad: '😔', neutral: '😐',
    calm: '🌊', happy: '😊', energised: '⚡',
  };
  const color = moodColors[mood] || '#1E7A8A';
  const emoji = moodEmojis[mood] || '✨';
  const name  = mood.charAt(0).toUpperCase() + mood.slice(1);

  const solutionItems = solutions.slice(0, 3).map(s =>
    `<li style="padding:12px 0;border-botto7m:1px solid rgba(138,154,181,0.1);color:#8A9AB5;font-size:14px;line-height:1.6;">
      <strong style="color:#F5EFE0;">${s.icon} ${s.name}</strong><br/>${s.desc}
     </li>`
  ).join('');

  const body = `
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:56px;margin-bottom:12px;">${emoji}</div>
      <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:300;color:#F5EFE0;margin:0 0 8px;">
        Your mood: <span style="color:${color};">${name}</span>
      </h1>
      <p style="font-size:15px;color:#8A9AB5;margin:0;max-width:440px;margin:0 auto;line-height:1.7;">${description}</p>
    </div>
    <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(138,154,181,0.12);border-radius:12px;padding:24px;margin-bottom:28px;">
      <p style="margin:0 0 16px;font-size:13px;color:#2E9CAE;text-transform:uppercase;letter-spacing:0.1em;font-family:monospace;">Your personalised plan</p>
      <ul style="margin:0;padding:0;list-style:none;">${solutionItems}</ul>
    </div>
    <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/quiz.html"
       style="display:inline-block;background:#C8960C;color:#0A0F1E;padding:14px 32px;border-radius:100px;font-size:14px;font-weight:500;text-decoration:none;">
      Retake Quiz →
    </a>`;
  return baseTemplate(`Your Inner Sight AI Result: ${name}`, body);
}

// ── 3. Admin Notification ─────────────────────────────────────
function adminNotifyHtml(email, count) {
  const body = `
    <h2 style="font-family:Georgia,serif;font-size:24px;font-weight:300;color:#F5EFE0;margin:0 0 16px;">
      New Waitlist Signup 🎉
    </h2>
    <p style="font-size:15px;color:#8A9AB5;margin:0 0 20px;">
      <strong style="color:#F5EFE0;">${email}</strong> just joined the Inner Sight AI waitlist.
    </p>
    <div style="background:rgba(200,150,12,0.08);border-radius:8px;padding:16px;display:inline-block;">
      <span style="font-family:monospace;font-size:24px;color:#F0B429;">${count}</span>
      <span style="font-size:14px;color:#8A9AB5;margin-left:8px;">total subscribers</span>
    </div>`;
  return baseTemplate('New Inner Sight AI Signup', body);
}

// ══════════════════════════════════════════════
//  SEND FUNCTIONS
// ══════════════════════════════════════════════

async function sendWelcomeEmail(email) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`  [Email] Not configured — would send welcome to: ${email}`);
    return { sent: false, reason: 'not-configured' };
  }

  await transporter.sendMail({
    from:    `"${process.env.EMAIL_FROM_NAME || 'Inner Sight AI'}" <${process.env.EMAIL_FROM}>`,
    to:      email,
    subject: '🌊 You\'re on the Inner Sight AI waitlist',
    html:    welcomeEmailHtml(email),
  });

  console.log(`  [Email] Welcome sent to: ${email}`);
  return { sent: true };
}

async function sendMoodResultEmail(email, mood, description, solutions) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`  [Email] Not configured — would send mood result to: ${email}`);
    return { sent: false, reason: 'not-configured' };
  }

  await transporter.sendMail({
    from:    `"${process.env.EMAIL_FROM_NAME || 'Inner Sight AI'}" <${process.env.EMAIL_FROM}>`,
    to:      email,
    subject: `Your Inner Sight AI mood result: ${mood.charAt(0).toUpperCase() + mood.slice(1)} ${mood === 'calm' ? '🌊' : mood === 'anxious' ? '😰' : '✨'}`,
    html:    moodResultEmailHtml(mood, description, solutions),
  });

  return { sent: true };
}

async function sendAdminNotification(email, count) {
  const transporter  = createTransporter();
  const adminEmail   = process.env.ADMIN_EMAIL;

  if (!transporter || !adminEmail) {
    console.log(`  [Email] Admin notify: ${email} (total: ${count})`);
    return { sent: false, reason: 'not-configured' };
  }

  try {
    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME || 'Inner Sight AI'}" <${process.env.EMAIL_FROM}>`,
      to:      adminEmail,
      subject: `New waitlist signup (#${count})`,
      html:    adminNotifyHtml(email, count),
    });

    console.log(`  [Email] Admin notified: ${email} (total: ${count})`);
    return { sent: true, info };
  } catch (err) {
    console.error("SendMail Error:", err);
    throw err;
  }
}

module.exports = { sendWelcomeEmail, sendMoodResultEmail, sendAdminNotification };
