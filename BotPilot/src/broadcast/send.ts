import type { BroadcastMessage } from "./types";

export async function sendBroadcast(
  token: string,
  chatId: number,
  message: BroadcastMessage
) {

  let method = "sendMessage";

  const body: any = {
    chat_id: chatId
  };

  if (message.photo) {

    method = "sendPhoto";

    body.photo = message.photo;

    body.caption = message.text;

  } else if (message.video) {

    method = "sendVideo";

    body.video = message.video;

    body.caption = message.text;

  } else if (message.document) {

    method = "sendDocument";

    body.document = message.document;

    body.caption = message.text;

  } else {

    body.text = message.text;

  }

  if (message.buttons && message.buttons.length > 0) {

    body.reply_markup = {
      inline_keyboard: [
        message.buttons.map(btn => ({
          text: btn.text,
          url: btn.url
        }))
      ]
    };

  }

  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );

  return await response.json();

}