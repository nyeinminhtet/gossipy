"use client";

import { pusherClient } from "@/lib/pusher";
import { toPusher } from "@/lib/utils";
import axios from "axios";
import { Check, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

type Props = {
  incomingFriendRequests: IncomingFriendRequest[];
  sessionId: string;
};

const FriendRequests = ({ incomingFriendRequests, sessionId }: Props) => {
  const [sendRequests, setSendRequests] = useState<IncomingFriendRequest[]>(
    incomingFriendRequests
  );
  const router = useRouter();

  const acceptFriend = async (senderId: string) => {
    await axios.post(`/api/requests/accept`, { id: senderId });

    setSendRequests((pre) =>
      pre.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  const denyFriend = async (senderId: string) => {
    await axios.post(`/api/requests/deny`, { id: senderId });

    setSendRequests((pre) =>
      pre.filter((request) => request.senderId !== senderId)
    );

    router.refresh();
  };

  useEffect(() => {
    pusherClient.subscribe(
      toPusher(`user:${sessionId}:incoming_friend_requests`)
    );

    const friendRequestHandler = ({
      senderId,
      senderEmail,
    }: IncomingFriendRequest) => {
      setSendRequests((pre) => [...pre, { senderId, senderEmail }]);
    };

    pusherClient.bind("incoming_friend_requests", friendRequestHandler);

    return () => {
      pusherClient.unsubscribe(
        toPusher(`user:${sessionId}:incoming_friend_requests`)
      );
      pusherClient.unbind("incoming_friend_requests", friendRequestHandler);
    };
  }, [sessionId]);

  return (
    <>
      {sendRequests.length === 0 ? (
        <p className=" text-sm  text-zinc-500">No friend request.</p>
      ) : (
        sendRequests.map((request) => (
          <div key={request.senderId} className="flex gap-4 items-center">
            <UserPlus className=" text-black" />
            <p className=" text-lg font-medium">{request.senderEmail}</p>
            <button
              onClick={() => acceptFriend(request.senderId)}
              aria-label="accept friend"
              className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center
             rounded-full transition hover:shadow-md"
            >
              <Check className=" font-semibold text-white w-10 h-10 sm:w-3/4 sm:h-3/4" />
            </button>
            <button
              onClick={() => denyFriend(request.senderId)}
              aria-label="deny friend"
              className="w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center
             rounded-full transition hover:shadow-md"
            >
              <X className=" font-semibold text-white w-3/4 h-3/4" />
            </button>
          </div>
        ))
      )}
    </>
  );
};

export default FriendRequests;
