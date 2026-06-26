import { Context } from 'telegraf'; // Eğer grammy kullanıyorsan: import { Context } from 'grammy';

/**
 * Telegram hız limitlerine takılmamak için iki mesaj arasında beklenecek süre (milisaniye)
 * Telegram saniyede en fazla 30 mesaja izin verir. Güvenli sınır için 50-100 ms idealdir.
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface BroadcastOptions {
  chatIds: number[];
  message: string;
  bot: any; // Bot instance'ı (Telegraf veya Grammy)
}

/**
 * Tüm kullanıcılara toplu mesaj gönderen fonksiyon
 */
export async function sendBroadcast({ chatIds, message, bot }: BroadcastOptions): Promise<{ successCount: number; failedCount: number }> {
  let successCount = 0;
  let failedCount = 0;

  console.log(`${chatIds.length} kullanıcıya toplu mesaj gönderimi başlatıldı...`);

  for (const chatId of chatIds) {
    try {
      // Telegram API ile mesajı gönder
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML' // Mesajda <b>, <i>, <code> gibi HTML etiketlerini kullanabilmek için
      });
      
      successCount++;
      
      // Hız limitine (Rate Limit) takılmamak için her mesaj arasında 70ms bekle
      await delay(70); 
    } catch (error: any) {
      console.error(`Chat ID ${chatId} için mesaj gönderilemedi:`, error.message);
      failedCount++;
      
      // Eğer bot çok hızlı gönderim yüzünden engellendiyse (429 hatası) biraz daha fazla bekle
      if (error.description && error.description.includes('Too Many Requests')) {
        const retryAfter = error.parameters?.retry_after || 5;
        console.log(`Hız limitine takılındı. ${retryAfter} saniye bekleniyor...`);
        await delay(retryAfter * 1000);
      }
    }
  }

  console.log(`Toplu mesaj tamamlandı. Başarılı: ${successCount}, Başarısız: ${failedCount}`);
  return { successCount, failedCount };
}