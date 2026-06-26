export interface TelegramBotInfo {
  ok: boolean;
  result: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    can_join_groups: boolean;
    can_read_all_group_messages: boolean;
    supports_inline_queries: boolean;
  };
}

export async function getMe(
  token: string
): Promise<TelegramBotInfo> {

  const res = await fetch(
    `https://api.telegram.org/bot${token}/getMe`
  );

  if (!res.ok) {
    throw new Error("Telegram API'ye bağlanılamadı.");
  }

  return await res.json() as TelegramBotInfo;

}
export async function setWebhook(
  token: string,
  url: string
) {

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url
      })
    }
  );

  if (!res.ok) {
    throw new Error("Webhook kurulamadı.");
  }

  return await res.json();

}