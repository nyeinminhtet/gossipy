import { chatHref, cn } from "@/lib/utils";
import { X } from "lucide-react";
import Image from "next/image";
import React, { FC } from "react";
import toast, { type Toast } from "react-hot-toast";

type Props = {
  t: Toast;
  sessionId: string;
  senderId: string;
  senderName: string;
  senderImg: string;
  message: string;
};

const UnseenCustomToast: FC<Props> = ({
  t,
  sessionId,
  senderId,
  senderImg,
  senderName,
  message,
}) => {
  return (
    <div
      className={cn(
        " max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
        {
          "animate-enter": t.visible,
          "animate-leave": !t.visible,
        }
      )}
    >
      <a
        href={`/dashboard/chat/${chatHref(sessionId, senderId)}`}
        onClick={() => toast.dismiss(t.id)}
        className="flex-1 w-0 p-4"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className=" relative h-7 w-7 sm:h-10 sm:w-10">
              <Image
                fill
                className="rounded-full"
                src={senderImg}
                alt={`${senderName} profile picture`}
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">{senderName}</p>
            <p className="mt-1 text-sm text-gray-500">{message}</p>
          </div>
        </div>
      </a>

      <div className="flex">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <X size={25} />
        </button>
      </div>
    </div>
  );
};

export default UnseenCustomToast;
