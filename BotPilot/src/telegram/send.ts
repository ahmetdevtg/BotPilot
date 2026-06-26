export async function sendMessage(
  token: string,
  chatId: number,
  text: string
) {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text
      })
    }
  );

  return await res.json();
}
export async function sendPhotoWithButton(
  token: string,
  chatId: number,
  photo: string,
  caption: string,
  buttonText: string,
  buttonUrl: string
) {

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
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      })
    }
  );

  return await res.json();

}
export async function sendVideoWithButton(
  token: string,
  chatId: number,
  video: string,
  caption: string,
  buttonText: string,
  buttonUrl: string
) {

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
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      })
    }
  );

  return await res.json();

}
export async function sendDocumentWithButton(
  token: string,
  chatId: number,
  document: string,
 caption: string,
  buttonText: string,
  buttonUrl: string
) {

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
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[
            {
              text: buttonText,
              url: buttonUrl
            }
          ]]
        }
      })
    }
  );

  return await res.json();

}