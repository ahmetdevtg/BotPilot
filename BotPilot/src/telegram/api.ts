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


/* =========================
   TELEGRAM API REQUEST
========================= */

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


  let json: any;

  try {

    json = await res.json();

  } catch (e) {

    throw new Error(
      `Telegram API geçersiz cevap döndürdü. HTTP ${res.status}`
    );

  }


  if (!res.ok) {

    console.error(
      "Telegram HTTP ERROR:",
      res.status,
      json
    );

    throw new Error(
      `Telegram API HTTP ${res.status}: ${
        json?.description || "Bilinmeyen hata"
      }`
    );

  }


  if (!json.ok) {

    console.error(
      "Telegram API ERROR:",
      json
    );

    throw new Error(
      `Telegram API Hatası: ${
        json?.description || "Bilinmeyen hata"
      }`
    );

  }


  return json;

}


/* =========================
   GET ME
========================= */

export async function getMe(
  token: string
): Promise<TelegramBotInfo> {

  if (!token || !token.trim()) {

    throw new Error(
      "Bot token boş."
    );

  }


  const cleanToken = token.trim();


  try {

    const res = await fetch(
      `https://api.telegram.org/bot${cleanToken}/getMe`,
      {
        method: "GET",

        headers: {
          "Accept": "application/json"
        }
      }
    );


    let json: any;


    try {

      json = await res.json();

    } catch (e) {

      throw new Error(
        `Telegram API JSON cevabı okunamadı. HTTP ${res.status}`
      );

    }


    /*
     * Telegram API bazen HTTP 200 dönüp
     * json.ok = false gönderebilir.
     */

    if (!res.ok) {

      throw new Error(
        `Telegram HTTP ${res.status}: ${
          json?.description || "Bilinmeyen hata"
        }`
      );

    }


    if (!json.ok) {

      throw new Error(
        `Telegram API: ${
          json?.description || "Bilinmeyen hata"
        }`
      );

    }


    if (!json.result) {

      throw new Error(
        "Telegram API başarılı cevap verdi fakat bot bilgisi bulunamadı."
      );

    }


    return json as TelegramBotInfo;


  } catch (e: any) {

    console.error(
      "getMe ERROR:",
      e?.message || e
    );


    throw new Error(
      e?.message ||
      "Telegram bot kontrolü sırasında bilinmeyen hata oluştu."
    );

  }

}


/* =========================
   SET WEBHOOK
========================= */

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


/* =========================
   SEND TEXT
========================= */

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


/* =========================
   SEND PHOTO
========================= */

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


/* =========================
   SEND VIDEO
========================= */

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


/* =========================
   SEND DOCUMENT
========================= */

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


/* =========================
   SEND MESSAGE + BUTTON
========================= */

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


/* =========================
   SEND PHOTO + BUTTON
========================= */

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


/* =========================
   SEND VIDEO + BUTTON
========================= */

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


/* =========================
   SEND DOCUMENT + BUTTON
========================= */

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


/* =========================
   SET MY NAME
========================= */

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


/* =========================
   SET MY DESCRIPTION
========================= */

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


/* =========================
   SET MY SHORT DESCRIPTION
========================= */

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


/* =========================
   SLEEP
========================= */

export async function sleep(
  ms: number
) {

  return new Promise(
    resolve => setTimeout(resolve, ms)
  );

}