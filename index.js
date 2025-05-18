import fetch from 'node-fetch';
import { buffer } from 'micro';

export const config = {
  api: {
    bodyParser: false,
  },
};

const token = '8011660653:AAEfUEkRfkqoMghaP0V_VecZZ7CSXzF9nsA';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send(`<h1>Bot Aktif ✅</h1><p>Kirim link video ke bot Telegram</p>`);
  }

  const rawBody = await buffer(req);
  const body = JSON.parse(rawBody.toString());

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (!chatId || !text) {
    return res.status(200).json({ ok: false });
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const link = text.match(urlRegex)?.[0];

  if (!link) {
    await sendMessage(chatId, 'Kirimkan link video (TikTok/Instagram/X/Threads)', token);
    return res.status(200).json({ ok: true });
  }

  // TikTok Downloader API (bisa diganti nanti)
  const apiURL = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(link)}`;

  try {
    const resp = await fetch(apiURL);
    const json = await resp.json();

    const downloadUrl = json.video_no_watermark || json.video || link;
    await sendMessage(chatId, `✅ Link download:\n${downloadUrl}`, token);
  } catch (err) {
    await sendMessage(chatId, `❌ Gagal download. Link tidak valid atau API error.`, token);
  }

  return res.status(200).json({ ok: true });
}

async function sendMessage(chatId, message, token) {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
    }),
  });
}
