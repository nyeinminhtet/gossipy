import { getFriendsByUserId } from "@/helpers/getFriendsByUserId";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { chatHref } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

const Page = async () => {
  const session = await getServerSession(authOptions);

  if (!session) return notFound();

  const friends = await getFriendsByUserId(session.user.id);

  const friendWithlastMessages = await Promise.all(
    friends.map(async (friend) => {
      const [lastMessageRaw] = (await fetchRedis(
        "zrange",
        `chat:${chatHref(session.user.id, friend.id)}:messages`,
        -1,
        -1
      )) as string[];

      const lastMessage = JSON.parse(lastMessageRaw) as Message;
      return {
        ...friend,
        lastMessage,
      };
    })
  );
  return (
    <div className="container py-12">
      <h1 className=" font-bold text-4xl mb-8">Recent chats</h1>

      {friendWithlastMessages.length === 0 ? (
        <p className=" text-sm font-semibold text-zinc-500 dark:text-zinc-50">
          No messages for now...
        </p>
      ) : (
        friendWithlastMessages.map((friend) => (
          <div
            key={friend.id}
            className=" relative border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 p-3 rounded-md"
          >
            <div className=" absolute inset-y-0 right-4 flex items-center">
              <ChevronRight className=" w-7 h-7 text-zinc-400" />
            </div>

            <Link
              href={`/dashboard/chat/${chatHref(session.user.id, friend.id)}`}
              className="relative sm:flex"
            >
              <div className="mb-4 sm:mb-0 flex-shrink-0 sm:mr-4">
                <div className="relative w-7 h-7">
                  <Image
                    fill
                    alt={`${friend.name} profile`}
                    src={friend.image}
                    className=" rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold">{friend.name}</h4>
                <p className=" mt-1 max-w-md">
                  <span className="text-zinc-400">
                    {friend.lastMessage.senderId === session.user.id
                      ? "You: "
                      : ""}
                  </span>
                  {friend.lastMessage.text}
                </p>
              </div>
            </Link>
          </div>
        ))
      )}
    </div>
  );
};

export default Page;
