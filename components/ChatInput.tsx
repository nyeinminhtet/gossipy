"use client";

import React, { useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";
import axios from "axios";
import { SendHorizontal } from "lucide-react";
import toast from "react-hot-toast";

type Props = {
  chatPartner: User;
  chatId: string;
};

function ChatInput({ chatPartner, chatId }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    setIsLoading(true);
    try {
      await axios.post(`/api/messages/send`, { text: input, chatId });
      setInput("");
      textareaRef.current?.focus();
    } catch (error) {
      return toast.error("Cann't send message!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className=" border-t border-gray-200 pt-4 px-4 mb-2 sm:mb-0">
      <div
        className="relative overflow-hidden rounded-lg flex-1 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2
      focus-within:ring-indigo-600"
      >
        <TextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message to ${chatPartner.name}`}
          className="block outline-none px-2 w-full resize-none border-0 bg-transparent text-gray-900 dark:text-zinc-50 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div
          onClick={() => textareaRef.current?.focus()}
          className="py-2"
          aria-hidden="true"
        >
          <div className=" py-px">
            <div className=" h-2" />
          </div>
        </div>

        <div className=" absolute right-0 bottom-0  flex justify-between py-2 pl-3 pr-2">
          <div className=" flex-shrink-0">
            <Button type="submit" variant="secondary" onClick={sendMessage}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <SendHorizontal />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInput;
