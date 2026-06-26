export interface BroadcastButton {
  text: string;
  url: string;
}

export interface BroadcastMessage {
  text: string;
  photo?: string;
  video?: string;
  document?: string;
  buttons?: BroadcastButton[];
}