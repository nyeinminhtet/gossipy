import { z } from "zod";

export const MessageValidator = z.object({
  id: z.string(),
  senderId: z.string(),
  text: z.string(),
  timestamp: z.number(),
});

export const MessagesArrayValidator = z.array(MessageValidator);

export type MessageType = z.infer<typeof MessageValidator>;
