export async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  parseMode: string = "HTML",
  keyboard?: string
) {

  let replyMarkup: any = undefined;

  if (keyboard && keyboard.trim() !== "") {
    replyMarkup = {
      keyboard: keyboard
        .split("\n")
        .map(x => [{ text: x.trim() }]),
      resize_keyboard: true
    };
  }

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode === "None" ? undefined : parseMode,
        reply_markup: replyMarkup
      })
    }
  );

  const json = await res.json();

  console.log("SEND MESSAGE RESULT");
  console.log(JSON.stringify(json));

  return json;

}

export async function sendPhotoWithButton(
  token: string,
  chatId: number,
  photo: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode: string = "HTML",
  keyboard?: string
) {

  const replyMarkup =
    keyboard && keyboard.trim() !== ""
      ? {
          keyboard: keyboard
            .split("\n")
            .map(x => [{ text: x.trim() }]),
          resize_keyboard: true
        }
      : buttonText && buttonUrl
      ? {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      : undefined;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendPhoto`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        photo,
        caption,
        parse_mode: parseMode === "None" ? undefined : parseMode,
        reply_markup: replyMarkup
      })
    }
  );

  const json = await res.json();

  console.log("SEND PHOTO RESULT");
  console.log(JSON.stringify(json));

  return json;

}

export async function sendVideoWithButton(
  token: string,
  chatId: number,
  video: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode: string = "HTML",
  keyboard?: string
) {

  const replyMarkup =
    keyboard && keyboard.trim() !== ""
      ? {
          keyboard: keyboard
            .split("\n")
            .map(x => [{ text: x.trim() }]),
          resize_keyboard: true
        }
      : buttonText && buttonUrl
      ? {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      : undefined;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendVideo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        video,
        caption,
        parse_mode: parseMode === "None" ? undefined : parseMode,
        reply_markup: replyMarkup
      })
    }
  );

  const json = await res.json();

  console.log("SEND VIDEO RESULT");
  console.log(JSON.stringify(json));

  return json;

}

export async function sendDocumentWithButton(
  token: string,
  chatId: number,
  document: string,
  caption: string,
  buttonText: string,
  buttonUrl: string,
  parseMode: string = "HTML",
  keyboard?: string
) {

  const replyMarkup =
    keyboard && keyboard.trim() !== ""
      ? {
          keyboard: keyboard
            .split("\n")
            .map(x => [{ text: x.trim() }]),
          resize_keyboard: true
        }
      : buttonText && buttonUrl
      ? {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      : undefined;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendDocument`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        document,
        caption,
        parse_mode: parseMode === "None" ? undefined : parseMode,
        reply_markup: replyMarkup
      })
    }
  );

  const json = await res.json();

  console.log("SEND DOCUMENT RESULT");
  console.log(JSON.stringify(json));

  return json;

}