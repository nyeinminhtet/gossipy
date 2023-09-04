"use client";

import { cn, toPusher } from "@/lib/utils";
import { MessageType } from "@/lib/validations/message";
import React, { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import { pusherClient } from "@/lib/pusher";

type Props = {
  initialMessages: MessageType[];
  sessionId: string;
  sessionImage: string | undefined | null;
  chatPartner: User;
  chatId: string;
};

const Messages = ({
  initialMessages,
  sessionId,
  sessionImage,
  chatPartner,
  chatId,
}: Props) => {
  const scrollDownRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<MessageType[]>(initialMessages);

  const timeFormat = (timestamp: number) => {
    return format(timestamp, "HH:mm");
  };

  useEffect(() => {
    pusherClient.subscribe(toPusher(`chat:${chatId}`));

    const messageHandler = (message: MessageType) => {
      setMessages((pre) => [message, ...pre]);
    };

    pusherClient.bind("incoming-message", messageHandler);

    return () => {
      pusherClient.unsubscribe(toPusher(`chat:${chatId}`));
      pusherClient.unbind("incoming-message", messageHandler);
    };
  }, [chatId]);

  return (
    <div
      className="flex flex-1 h-full flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter
    scrollbar-w-2 scrolling-touch"
    >
      <div ref={scrollDownRef} />

      {messages.map((message, index) => {
        const isCurrentUser = message.senderId === sessionId;
        const hasNextMessageFromSameUser =
          messages[index - 1]?.senderId === messages[index].senderId;

        return (
          <div
            key={`${message.id}--${message.timestamp}`}
            className="chat-messages"
          >
            <div
              className={cn("flex items-end", {
                "justify-end": isCurrentUser,
              })}
            >
              <div
                className={cn(
                  "flex flex-col space-y-2 text-base max-w-xs mx-2",
                  {
                    "order-1 items-end": isCurrentUser,
                    "order-2 items-start": !isCurrentUser,
                  }
                )}
              >
                <span
                  className={cn("px-4 py-2 rounded-lg inline-block", {
                    "bg-indigo-600 text-white": isCurrentUser,
                    "bg-gray-200 text-gray-900": !isCurrentUser,
                    "rounded-br-none":
                      !hasNextMessageFromSameUser && isCurrentUser,
                    "rounded-bl-none":
                      !hasNextMessageFromSameUser && !isCurrentUser,
                  })}
                >
                  {message.text}{" "}
                  <span className=" text-gray-400 text-xs ml-2">
                    {timeFormat(message.timestamp)}
                  </span>
                </span>
              </div>

              <div
                className={cn("relative w-6 h-6", {
                  "order-2": isCurrentUser,
                  "order-1": !isCurrentUser,
                  invisible: hasNextMessageFromSameUser,
                })}
              >
                {isCurrentUser ? (
                  <span className="text-[.8rem]">sent</span>
                ) : (
                  <Image
                    fill
                    src={chatPartner.image}
                    className=" rounded-full"
                    alt="profile"
                    referrerPolicy="no-referrer"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Messages;
