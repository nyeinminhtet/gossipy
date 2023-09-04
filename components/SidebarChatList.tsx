"use client";
import { pusherClient } from "@/lib/pusher";
import { chatHref, toPusher } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import React, { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";
import UnseenCustomToast from "./UnseenCustomToast";
import Image from "next/image";

type Props = {
  friends: User[];
  sessionId: string;
};

interface ExtendedMessage extends Message {
  senderImg: string;
  senderName: string;
}

const SidebarChatList: FC<Props> = ({ friends, sessionId }) => {
  const [unseenMessages, setUnseenMessages] = useState<Message[]>([]);
  const router = useRouter();
  const pathname = usePathname();
  const [activeFriends, setActiveFriends] = useState<User[]>(friends);

  useEffect(() => {
    pusherClient.subscribe(toPusher(`user:${sessionId}:chats`));
    pusherClient.subscribe(toPusher(`user:${sessionId}:friend`));

    const friendHandler = (newFriend: User) => {
      setActiveFriends((pre) => [...pre, newFriend]);
    };

    const chatHandler = (message: ExtendedMessage) => {
      const shouldNotify =
        pathname !== `/dashboard/chat/${chatHref(sessionId, message.senderId)}`;

      if (!shouldNotify) return;

      //should notify
      toast.custom((t) => (
        <UnseenCustomToast
          t={t}
          senderId={message.senderId}
          senderImg={message.senderImg}
          senderName={message.senderName}
          message={message.text}
          sessionId={sessionId}
        />
      ));

      setUnseenMessages((pre) => [...pre, message]);
    };

    pusherClient.bind("new_message", chatHandler);
    pusherClient.bind("new_friend", friendHandler);
    return () => {
      pusherClient.unsubscribe(toPusher(`user:${sessionId}:chats`));
      pusherClient.unsubscribe(toPusher(`user:${sessionId}:friend`));

      pusherClient.unbind("new_message", chatHandler);
      pusherClient.unbind("new_friend", friendHandler);
    };
  }, [pathname, router, sessionId]);

  useEffect(() => {
    if (pathname?.includes("chat")) {
      setUnseenMessages((pre) => {
        return pre.filter((msg) => !pathname.includes(msg.senderId));
      });
    }
  }, [pathname]);

  return (
    <ul role="list" className=" max-h-[25rem] overflow-y-auto -mx-2 space-y-1">
      {activeFriends.sort().map((friend) => {
        const unseenMessagesCount = unseenMessages.filter(
          (unseenmessage) => unseenmessage.senderId === friend.id
        ).length;
        return (
          <li key={friend.id}>
            <a
              href={`/dashboard/chat/${chatHref(sessionId, friend.id)}`}
              className=" text-gray-700 dark:text-zinc-300 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-600 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
            >
              <div className="relative h-7 w-7 sm:w-10 sm:h-10">
                <Image
                  fill
                  src={friend.image}
                  className="rounded-full"
                  referrerPolicy="no-referrer"
                  alt={`${friend.name} profile`}
                />
              </div>
              {friend.name}
              {unseenMessagesCount > 0 ? (
                <div className=" font-medium text-xs bg-indigo-600 text-white w-4 h-4 flex justify-center rounded-full">
                  {unseenMessagesCount}
                </div>
              ) : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
};

export default SidebarChatList;
