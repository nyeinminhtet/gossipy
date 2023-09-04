import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { MessageType, MessageValidator } from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { send } from "process";
import { pusherServer } from "@/lib/pusher";
import { toPusher } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const { text, chatId }: { text: string; chatId: string } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const [userId1, userId2] = chatId.split("--");

    if (session.user.id !== userId1 && session.user.id !== userId2) {
      return new Response("Unauthorized", { status: 401 });
    }

    const friendId = session.user.id === userId1 ? userId2 : userId1;
    const friendList = (await fetchRedis(
      "smembers",
      `user:${session.user.id}:friend`
    )) as string[];

    const isFriend = friendList.includes(friendId);

    if (!isFriend) {
      return new Response("Unauthorized", { status: 401 });
    }

    const rawSender = (await fetchRedis(
      "get",
      `user:${session.user.id}`
    )) as string;
    const sender = JSON.parse(rawSender) as User;

    const timestamp = Date.now();

    const messageData: MessageType = {
      id: nanoid(),
      senderId: session.user.id,
      text,
      timestamp,
    };

    const message = MessageValidator.parse(messageData);

    //notify message to client
    pusherServer.trigger(
      toPusher(`chat:${chatId}`),
      "incoming-message",
      message
    );

    pusherServer.trigger(toPusher(`user:${friendId}:chats`), "new_message", {
      ...message,
      senderImg: sender.image,
      senderName: sender.name,
    });

    //all valid, send the message
    await db.zadd(`chat:${chatId}:messages`, {
      score: timestamp,
      member: JSON.stringify(message),
    });

    return new Response("ok");
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }

    return new Response("Internal Error", { status: 500 });
  }
}
