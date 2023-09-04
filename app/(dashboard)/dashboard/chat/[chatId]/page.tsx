import ChatInput from "@/components/ChatInput";
import Messages from "@/components/Messages";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  MessageValidator,
  MessagesArrayValidator,
} from "@/lib/validations/message";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

interface Props {
  params: {
    chatId: string;
  };
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      "zrange",
      `chat:${chatId}:messages`,
      0,
      -1
    );

    const dbMessages = results.map((message) => JSON.parse(message) as Message);

    const reversedDbMessages = dbMessages.reverse();

    const messages = MessagesArrayValidator.parse(reversedDbMessages);

    return messages;
  } catch (error) {
    notFound();
  }
}

const Page = async ({ params }: Props) => {
  const { chatId } = params;
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  const { user } = session;

  const [userId1, userId2] = chatId.split("--");

  if (user.id !== userId1 && user.id !== userId2) return notFound();

  const chatPartnerId = user.id === userId1 ? userId2 : userId1;

  const chatPartnerRaw = (await fetchRedis(
    "get",
    `user:${chatPartnerId}`
  )) as string;
  const chatPartner = JSON.parse(chatPartnerRaw) as User;

  const initialMessages = await getChatMessages(chatId);

  return (
    <div className="flex flex-1 justify-between flex-col h-full max-h-[calc(100vh-6rem)]">
      <div className="flex justify-between sm:items-center px-2 border-b-2 border-gray-200">
        <div className=" relative flex items-center pb-2 space-x-4">
          <div className="relative">
            <div className=" relative w-8 h-8 sm:w-12 sm:h-12">
              <Image
                fill
                referrerPolicy="no-referrer"
                className="rounded-full"
                alt={`${chatPartner.name} profile picture`}
                src={chatPartner.image}
              />
            </div>
          </div>

          <div className="flex flex-col leading-tight">
            <div className="text-xl flex items-center">
              <span className=" text-gray-700 font-semibold mr-3 dark:text-zinc-200">
                {chatPartner.name}{" "}
              </span>
            </div>

            <span className=" text-gray-500 text-sm">{chatPartner.email}</span>
          </div>
        </div>
      </div>

      <Messages
        initialMessages={initialMessages}
        sessionId={session.user.id}
        sessionImage={session.user.image}
        chatPartner={chatPartner}
        chatId={chatId}
      />

      <ChatInput chatPartner={chatPartner} chatId={chatId} />
    </div>
  );
};

export default Page;