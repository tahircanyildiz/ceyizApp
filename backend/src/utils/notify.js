const axios = require('axios');
const User = require('../models/User');

/**
 * Aynı householdId'ye sahip partner varsa bildirim gönderir.
 * @param {ObjectId} senderUserId - işlemi yapan kullanıcı
 * @param {ObjectId} householdId
 * @param {string} title
 * @param {string} body
 */
async function notifyPartner(senderUserId, householdId, title, body) {
  try {
    const partner = await User.findOne({
      householdId,
      _id: { $ne: senderUserId },
      oneSignalPlayerId: { $ne: null },
    });

    if (!partner?.oneSignalPlayerId) return;

    await axios.post(
      'https://onesignal.com/api/v1/notifications',
      {
        app_id: process.env.ONESIGNAL_APP_ID,
        include_player_ids: [partner.oneSignalPlayerId],
        headings: { tr: title, en: title },
        contents: { tr: body, en: body },
      },
      {
        headers: {
          Authorization: `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch {
    // Bildirim hatası uygulamayı durdurmamalı
  }
}

module.exports = { notifyPartner };
