export default function ping(req, res) {
  res.json({ ok: true, msg: "Hello from JS ESM" });
}
