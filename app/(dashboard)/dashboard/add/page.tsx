import AddFriendButton from "@/components/AddFriendButton";
import React from "react";

const Page = () => {
  return (
    <main className="pt-8">
      <h2 className=" font-bold text-4xl md:text-5xl mb-8">Add a friend</h2>
      <AddFriendButton />
    </main>
  );
};

export default Page;
