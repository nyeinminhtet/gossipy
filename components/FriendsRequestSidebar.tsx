"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusher } from "@/lib/utils";
import { User } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

type Props = {
  sessionId: string;
  initialUnseenRequestCount: number;
};

const FriendsRequestSidebar = ({
  sessionId,
  initialUnseenRequestCount,
}: Props) => {
  //
  const [unseenRequestCount, setUnseenRequestCount] = useState<number>(
    initialUnseenRequestCount
  );

  useEffect(() => {
    pusherClient.subscribe(
      toPusher(`user:${sessionId}:incoming_friend_requests`)
    );
    pusherClient.subscribe(toPusher(`user:${sessionId}:friend`));

    const friendRequestHandler = () => {
      setUnseenRequestCount((pre) => pre + 1);
    };

    const addedFriendHandler = () => {
      setUnseenRequestCount((pre) => pre - 1);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);
    pusherClient.bind("new_friend", addedFriendHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusher(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unsubscribe(toPusher(`user:${sessionId}:friend`));

      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
      pusherClient.unbind("new_friend", addedFriendHandler);
    };
  }, [sessionId]);

  return (
    <Link
      href={"/dashboard/requests"}
      className=" text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:hover:bg-gray-600 group
    flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
    >
      <div
        className=" text-gray-400 dark:text-gray-700 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600
           flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white dark:bg-zinc-50"
      >
        <User className="w-4 h-4" />
      </div>
      <p className=" truncate dark:text-zinc-50">Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className=" rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600">
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  );
};

export default FriendsRequestSidebar;
