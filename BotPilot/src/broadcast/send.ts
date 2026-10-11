import {
  sendText,
  sendPhoto,
  sendVideo,
  sendDocument,
  sendPhotoWithButton,
  sendVideoWithButton,
  sendDocumentWithButton,
  sendMessageWithButton
} from "../telegram/api";

export interface BroadcastOptions {
  message: string;
  photo?: string;
  video?: string;
  document?: string;
  parseMode?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface BroadcastStats {
  success: number;
  failed: number;
  failureReasons: Record<string, number>;
  failureSamples: string[];
}

function classifyFailure(error: unknown): string {
  const message = String((error as any)?.message || error || "Bilinmeyen hata");
  if (/bot was blocked by the user|bot is blocked|blocked by the user/i.test(message)) return "Kullanıcı botu engellemiş";
  if (/user is deactivated|account is deactivated/i.test(message)) return "Kullanıcı hesabı kapalı";
  if (/chat not found/i.test(message)) return "Sohbet bulunamadı";
  if (/can't initiate conversation|cannot initiate conversation|have no rights to send a message/i.test(message)) return "Kullanıcı botla sohbet başlatmamış";
  if (/too many requests|retry after|\b429\b/i.test(message)) return "Telegram hız sınırı (429)";
  if (/\b401\b|unauthorized|token is invalid/i.test(message)) return "Geçersiz bot tokenı (401)";
  if (/parse entities|can't parse|unsupported start tag|can't find end of the entity/i.test(message)) return "Mesaj HTML/Markdown biçimi hatalı";
  if (/FROZEN_METHOD_INVALID/i.test(message)) return "Telegram botu kısıtlamış (FROZEN_METHOD_INVALID)";
  return "Diğer Telegram/API hatası";
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendBroadcast(
  db: D1Database,
  token: string,
  botId: number,
  options: BroadcastOptions
): Promise<BroadcastStats> {
  const { results } = await db
    .prepare("SELECT telegram_id FROM telegram_users WHERE bot_id = ?")
    .bind(botId)
    .all();

  let success = 0;
  let failed = 0;
  const failureReasons: Record<string, number> = {};
  const failureSamples: string[] = [];
  const users = results as any[];

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    try {
      if (options.photo && options.buttonText && options.buttonUrl) {
        await sendPhotoWithButton(token, user.telegram_id, options.photo, options.message, options.buttonText, options.buttonUrl, options.parseMode || "HTML");
      } else if (options.video && options.buttonText && options.buttonUrl) {
        await sendVideoWithButton(token, user.telegram_id, options.video, options.message, options.buttonText, options.buttonUrl, options.parseMode || "HTML");
      } else if (options.document && options.buttonText && options.buttonUrl) {
        await sendDocumentWithButton(token, user.telegram_id, options.document, options.message, options.buttonText, options.buttonUrl, options.parseMode || "HTML");
      } else if (options.buttonText && options.buttonUrl) {
        await sendMessageWithButton(token, user.telegram_id, options.message, options.buttonText, options.buttonUrl, options.parseMode || "HTML");
      } else if (options.photo) {
        await sendPhoto(token, user.telegram_id, options.photo, options.message, options.parseMode || "HTML");
      } else if (options.video) {
        await sendVideo(token, user.telegram_id, options.video, options.message, options.parseMode || "HTML");
      } else if (options.document) {
        await sendDocument(token, user.telegram_id, options.document, options.message, options.parseMode || "HTML");
      } else {
        await sendText(token, user.telegram_id, options.message, options.parseMode || "HTML");
      }
      success++;
    } catch (error: any) {
      failed++;
      const message = String(error?.message || error || "Bilinmeyen hata");
      const reason = classifyFailure(message);
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      if (failureSamples.length < 8) {
        failureSamples.push("Chat " + String(user.telegram_id) + ": " + message);
      }
      console.error("BROADCAST SEND FAILED", { botId, chatId: user.telegram_id, reason, error: message });
    }

    // Keep each bot comfortably below Telegram's per-bot message rate limit.
    if (i < users.length - 1) await wait(50);
  }

  return { success, failed, failureReasons, failureSamples };
}

export async function sendBroadcastAllBots(
  db: D1Database,
  options: BroadcastOptions
): Promise<BroadcastStats> {
  const { results } = await db
    .prepare("SELECT * FROM bots WHERE status = 1")
    .all();

  let totalSuccess = 0;
  let totalFailed = 0;
  const failureReasons: Record<string, number> = {};
  const failureSamples: string[] = [];

  for (const bot of results as any[]) {
    try {
      const result = await sendBroadcast(db, bot.token, Number(bot.telegram_id), options);
      totalSuccess += result.success;
      totalFailed += result.failed;
      for (const [reason, count] of Object.entries(result.failureReasons)) {
        failureReasons[reason] = (failureReasons[reason] || 0) + count;
      }
      for (const sample of result.failureSamples) {
        if (failureSamples.length < 12) {
          failureSamples.push("@" + String(bot.username || bot.telegram_id) + " — " + sample);
        }
      }
    } catch (error: any) {
      const message = String(error?.message || error || "Bilinmeyen hata");
      console.error("BROADCAST BOT FAILED", { botId: bot.id, username: bot.username, error: message });
      totalFailed++;
      failureReasons["Bot seviyesinde hata"] = (failureReasons["Bot seviyesinde hata"] || 0) + 1;
      if (failureSamples.length < 12) failureSamples.push("@" + String(bot.username || bot.telegram_id) + ": " + message);
    }
  }

  return { success: totalSuccess, failed: totalFailed, failureReasons, failureSamples };
}
