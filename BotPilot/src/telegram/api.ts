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

async function telegramRequest(
  token: string,
  method: string,
  body: any
) {

  const res = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  const json = await res.json() as any;

  if (!json.ok) {
    throw new Error(
      json.description || "Telegram API Hatası"
    );
  }

  return json;

}

export async function getMe(
  token: string
): Promise<TelegramBotInfo> {

  const res = await fetch(
    `https://api.telegram.org/bot${token}/getMe`
  );

  if (!res.ok) {
    throw new Error(
      "Telegram API'ye bağlanılamadı."
    );
  }

  return await res.json() as TelegramBotInfo;

}

export async function setWebhook(
  token: string,
  url: string
) {

  return telegramRequest(
    token,
    "setWebhook",
    {
      url
    }
  );

}

export async function sendText(
  token: string,
  chatId: number,
  text: string,
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendMessage",
    {
      chat_id: chatId,
      text,
      parse_mode: parseMode
    }
  );

}
export async function sendPhoto(
  token: string,
  chatId: number,
  photo: string,
  caption = "",
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendPhoto",
    {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: parseMode
    }
  );

}

export async function sendVideo(
  token: string,
  chatId: number,
  video: string,
  caption = "",
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendVideo",
    {
      chat_id: chatId,
      video,
      caption,
      parse_mode: parseMode
    }
  );

}

export async function sendDocument(
  token: string,
  chatId: number,
  document: string,
  caption = "",
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendDocument",
    {
      chat_id: chatId,
      document,
      caption,
      parse_mode: parseMode
    }
  );

}

export async function sendMessageWithButton(
  token: string,
  chatId: number,
  text: string,
  buttonText: string,
  buttonUrl: string,
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendMessage",
    {
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: [[
          {
            text: buttonText,
            url: buttonUrl
          }
        ]]
      }
    }
  );

}
export async function sendPhotoWithButton(
  token: string,
  chatId: number,
  photo: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendPhoto",
    {
      chat_id: chatId,
      photo,
      caption,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: [[
          {
            text: buttonText,
            url: buttonUrl
          }
        ]]
      }
    }
  );

}

export async function sendVideoWithButton(
  token: string,
  chatId: number,
  video: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendVideo",
    {
      chat_id: chatId,
      video,
      caption,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: [[
          {
            text: buttonText,
            url: buttonUrl
          }
        ]]
      }
    }
  );

}

export async function sendDocumentWithButton(
  token: string,
  chatId: number,
  document: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode = "HTML"
) {

  return telegramRequest(
    token,
    "sendDocument",
    {
      chat_id: chatId,
      document,
      caption,
      parse_mode: parseMode,
      reply_markup: {
        inline_keyboard: [[
          {
            text: buttonText,
            url: buttonUrl
          }
        ]]
      }
    }
  );

}
export async function setMyName(
  token: string,
  name: string
) {

  return telegramRequest(
    token,
    "setMyName",
    {
      name
    }
  );

}

export async function setMyDescription(
  token: string,
  description: string
) {

  return telegramRequest(
    token,
    "setMyDescription",
    {
      description
    }
  );

}

export async function setMyShortDescription(
  token: string,
  shortDescription: string
) {

  return telegramRequest(
    token,
    "setMyShortDescription",
    {
      short_description: shortDescription
    }
  );

}