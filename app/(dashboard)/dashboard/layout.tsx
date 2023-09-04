import FriendsRequestSidebar from "@/components/FriendsRequestSidebar";
import { Icon, Icons } from "@/components/Icons";
import MobileLayout from "@/components/MobileLayout";
import { ModeToggle } from "@/components/ModeToggle";
import SidebarChatList from "@/components/SidebarChatList";
import SignOutButton from "@/components/SignOutButton";
import { getFriendsByUserId } from "@/helpers/getFriendsByUserId";
import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export interface SidebarOption {
  id: number;
  name: string;
  href: string;
  Icon: Icon;
}

const sidebarOptions: SidebarOption[] = [
  {
    id: 1,
    name: "Add friend",
    href: "/dashboard/add",
    Icon: "UserPlus",
  },
];

const layout = async ({ children }: Props) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect("/login");
  }

  const friends = await getFriendsByUserId(session?.user.id);

  const unseenRequestCount = (
    (await fetchRedis(
      "smembers",
      `user:${session?.user.id}:incoming_friend_requests`
    )) as User[]
  ).length;

  return (
    <div className=" w-full flex h-screen">
      <div className="md:hidden">
        <MobileLayout
          friends={friends}
          session={session}
          unseenRequestCount={unseenRequestCount}
          sidebarOptions={sidebarOptions}
        />
      </div>
      <div className=" hidden md:flex h-full w-full max-w-xs grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white dark:bg-gray-900 px-6">
        <div className="flex justify-between items-center">
          <Link href="/dashboard" className=" flex h-16 shrink-0 items-center">
            <Icons.Logo className="h-8 w-auto text-indigo-600" />
          </Link>

          <ModeToggle />
        </div>

        {friends.length > 0 ? (
          <div className=" text-xs font-semibold leading-6 text-gray-400 dark:text-gray-300">
            Your chats
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <SidebarChatList friends={friends} sessionId={session.user.id} />
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400 dark:text-zinc-300">
                Overview
              </div>

              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {sidebarOptions.map((option) => {
                  const Icon = Icons[option.Icon];

                  return (
                    <li key={option.id}>
                      <Link
                        href={option.href}
                        className=" text-gray-700 dark:text-zinc-300 hover:text-indigo-600
                      hover:bg-gray-50 dark:hover:bg-gray-600 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold"
                      >
                        <span
                          className=" text-gray-400 dark:text-gray-900 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600
                        flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white dark:bg-zic-50"
                        >
                          <Icon className="w-4 h-4" />
                        </span>

                        <span className=" truncate">{option.name}</span>
                      </Link>
                    </li>
                  );
                })}

                <li>
                  <FriendsRequestSidebar
                    sessionId={session?.user.id || ""}
                    initialUnseenRequestCount={unseenRequestCount}
                  />
                </li>
              </ul>
            </li>

            <li className="-mx-6 mt-auto flex items-center">
              <div className="flex flex-1 items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900">
                <div className=" relative h-8 w-8 bg-gray-50 dark:bg-gray-900">
                  <Image
                    fill
                    className="rounded-full"
                    alt="profile"
                    src={session?.user.image || ""}
                    referrerPolicy="no-referrer"
                  />
                </div>

                <span className=" sr-only">Your profile</span>
                <div className="flex flex-col">
                  <span aria-hidden className=" dark:text-zinc-50">
                    {session?.user.name}{" "}
                  </span>
                  <span className="text-xs text-zinc-400" aria-hidden>
                    {session?.user.email}
                  </span>
                </div>
              </div>

              <SignOutButton className=" w-full aspect-square" />
            </li>
          </ul>
        </nav>
      </div>
      <aside className=" max-h-screen container py-16 md:py-5 w-full">
        {children}
      </aside>
    </div>
  );
};

export default layout;
