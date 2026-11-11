// Vercel serverless function: POST /api/contact
// Sends the contact form to your inbox through Resend (https://resend.com).
// Required environment variables (set in Vercel > Project > Settings > Environment Variables):
//   RESEND_API_KEY     your Resend API key (server-side only, never put it in frontend code)
//   CONTACT_TO_EMAIL   where messages should arrive, e.g. ankitsatapathy2006@gmail.com
// Optional:
//   CONTACT_FROM_EMAIL a sender on a domain you verified in Resend.
//                      Defaults to Resend's test sender, which can only deliver to your own Resend account email.

const hits = new Map(); // best-effort per-instance rate limit

function bad(res, code, error) { res.status(code).json({ ok: false, error }); }
const clean = (v, max) => String(v || "").replace(/[\u0000-\u0008\u000B-\u001F]/g, "").trim().slice(0, max);
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

module.exports = async function handler(req, res) {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return bad(res, 405, "Method not allowed"); }
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) return bad(res, 503, "Contact form is not configured yet");

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now(), recent = (hits.get(ip) || []).filter((t) => now - t < 10 * 60 * 1000);
  if (recent.length >= 5) return bad(res, 429, "Too many messages, try again later");

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch { return bad(res, 400, "Invalid JSON"); } }
  body = body || {};

  // Spam checks: honeypot field must be empty, and the form must have been open for a few seconds
  if (body.website) return res.status(200).json({ ok: true });
  if (Number(body.elapsed) < 3000) return bad(res, 400, "Submitted too quickly");

  const name = clean(body.name, 100), email = clean(body.email, 160), subject = clean(body.subject, 150), message = clean(body.message, 4000);
  if (name.length < 2 || subject.length < 3 || message.length < 10) return bad(res, 400, "Missing fields");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return bad(res, 400, "Invalid email");

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text: `From: ${name} <${email}>\n\n${message}`,
        html: `<p><strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
      }),
    });
    if (!r.ok) { console.error("Resend error", r.status, await r.text()); return bad(res, 502, "Email service error"); }
    recent.push(now); hits.set(ip, recent);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return bad(res, 500, "Unexpected error");
  }
};
