// Netlify version of /api/contact (netlify.toml redirects /api/contact here).
// Same environment variables as the Vercel function: RESEND_API_KEY, CONTACT_TO_EMAIL, optional CONTACT_FROM_EMAIL.
const handler = require("../../api/contact.js");

exports.handler = async (event) => {
  let status = 200, payload = {};
  const headers = { "x-forwarded-for": event.headers["x-forwarded-for"] || event.headers["client-ip"] || "" };
  const res = {
    status(code) { status = code; return this; },
    json(obj) { payload = obj; return this; },
    setHeader() {},
  };
  await handler({ method: event.httpMethod, headers, body: event.body }, res);
  return { statusCode: status, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) };
};
