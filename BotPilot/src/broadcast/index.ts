/**
 * BotPilot - Broadcast Management System
 * Architecture: Cloudflare Workers + Hono + D1 Database
 */

interface BroadcastPayload {
  botId: string;
  botToken: string;
  message: string;
}

interface TelegramUser {
  telegram_id: string; // D1 tablonuzdaki isimlendirmeye göre gerekirse güncelleyin
}

/**
 * Belirli bir bota ait tüm kayıtlı kullanıcılara toplu mesaj gönderir.
 * Cloudflare Workers üzerinde fetch kullanarak Telegram API ile haberleşir.
 */
export async function handleBroadcast(
  db: D1Database,
  payload: BroadcastPayload
): Promise<{ success: boolean; total: number; sent: number; failed: number; error?: string }> {
  const { botId, botToken, message } = payload;

  try {
    // 1. Veritabanından bu bota kayıtlı aktif kullanıcıları çekiyoruz
    // NOT: Tablo ve sütun isimlerini mevcut D1 şemanıza (users veya bot_users) göre gerekirse düzenleyin.
    const { results } = await db
      .prepare("SELECT telegram_id FROM users WHERE bot_id = ? AND status = 'active'")
      .bind(botId)
      .all<TelegramUser>();

    if (!results || results.length === 0) {
      return { success: true, total: 0, sent: 0, failed: 0 };
    }

    let sentCount = 0;
    let failedCount = 0;
    const totalUsers = results.length;

    // 2. Kullanıcılara sırayla mesaj gönderimi
    // Cloudflare Workers fetch senkronizasyonu ve Telegram hız limitleri için döngü
    for (const user of results) {
      const telegramId = user.telegram_id;

      try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        
        const response = await fetch(telegramUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: telegramId,
            text: message,
            parse_mode: 'HTML',
          }),
        });

        if (response.ok) {
          sentCount++;
        } else {
          const errData: any = await response.json().catch(() => ({}));
          console.error(`Mesaj gönderilemedi (User: ${telegramId}):`, errData?.description || response.statusText);
          failedCount++;
        }

        // Cloudflare Workers CPU zamanını ve Telegram sınırlarını (saniyede 30 istek) korumak için 
        // her istek arasında milisaniyelik mikro bir boşluk bırakıyoruz
        await new Promise((resolve) => setTimeout(resolve, 50));

      } catch (innerError) {
        console.error(`Fetch hatası (User: ${telegramId}):`, innerError);
        failedCount++;
      }
    }

    // 3. İsteğe bağlı: Gönderim istatistiklerini broadcast_history gibi bir tabloya kaydedebilirsiniz.
    // Şimdilik sonucu doğrudan dönüyoruz.
    return {
      success: true,
      total: totalUsers,
      sent: sentCount,
      failed: failedCount,
    };

  } catch (error: any) {
    console.error("Broadcast sistemi genel hatası:", error);
    return {
      success: false,
      total: 0,
      sent: 0,
      failed: 0,
      error: error.message || "Bilinmeyen bir hata oluştu.",
    };
  }
}