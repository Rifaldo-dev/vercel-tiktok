export default async function handler(req, res) {
  const token = '8011660653:AAEfUEkRfkqoMghaP0V_VecZZ7CSXzF9nsA';

  if (req.method !== 'POST') {
    return res.status(200).send(`
      <h1>Bot Downloader Aktif ✅</h1>
      <p>Kirim link video ke bot Telegram kamu untuk mengunduh.</p>
    `);
  }

  const body = req.body;
  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId || !text) return res.status(200).json({ ok: false });

  // Cek apakah input adalah URL video
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const link = text.match(urlRegex)?.[0];

  if (!link) {
    await sendMessage(chatId, 'Kirimkan link video (TikTok/Instagram/X/Threads)', token);
    return res.status(200).json({ ok: true });
  }

  // Contoh API dummy downloader TikTok (ubah ke API asli jika kamu punya)
  const apiURL = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(link)}`;

  try {
    const resp = await fetch(apiURL);
    const json = await resp.json();

    // Gunakan URL hasil API
    const downloadUrl = json.video.no_watermark || json.video || link;

    await sendMessage(chatId, `🎬 Link download:\n${downloadUrl}`, token);
  } catch (err) {
    await sendMessage(chatId, '❌ Gagal mengambil video. Pastikan link benar.', token);
  }

  res.status(200).json({ ok: true });
}

async function sendMessage(chatId, text, token) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}
