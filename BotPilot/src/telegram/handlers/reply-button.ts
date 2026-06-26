import { getReplyButton } from "../../database/reply-buttons";
import {
  sendMessage,
  sendPhotoWithButton,
  sendVideoWithButton,
  sendDocumentWithButton
} from "../send";

export async function handleReplyButton(
  db: D1Database,
  token: string,
  message: any
) {

  const text = message.text || "";

  const button: any = await getReplyButton(
    db,
    text
  );

  if (!button) {
    return false;
  }

  switch (button.response_type) {

    case "photo":

      await sendPhotoWithButton(
        token,
        message.chat.id,
        button.photo_url,
        button.message || "",
        button.button_text_url || "",
        button.button_url || ""
      );

      return true;

    case "video":

      await sendVideoWithButton(
        token,
        message.chat.id,
        button.video_url,
        button.message || "",
        button.button_text_url || "",
        button.button_url || ""
      );

      return true;

    case "document":

      await sendDocumentWithButton(
        token,
        message.chat.id,
        button.document_url,
        button.message || "",
        button.button_text_url || "",
        button.button_url || ""
      );

      return true;

    default:

      await sendMessage(
        token,
        message.chat.id,
        button.message || ""
      );

      return true;

  }

}