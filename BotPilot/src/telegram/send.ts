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