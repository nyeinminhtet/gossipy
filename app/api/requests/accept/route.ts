import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusher } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    //verify both users are already friends

    const isAlreadyFriend = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );

    if (isAlreadyFriend) {
      return new Response("Already friends", { status: 400 });
    }

    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );

    if (!hasFriendRequest) {
      return new Response("No friend request", { status: 400 });
    }

    const [userRaw, friendRaw] = (await Promise.all([
      fetchRedis("get", `user:${session.user.id}`),
      fetchRedis("get", `user:${idToAdd}`),
    ])) as [string, string];

    const user = JSON.parse(userRaw) as User;
    const friend = JSON.parse(friendRaw) as User;

    await Promise.all([
      pusherServer.trigger(
        toPusher(`user:${idToAdd}:friend`),
        "new_friend",
        user
      ),
      pusherServer.trigger(
        toPusher(`user:${session.user.id}:friend`),
        "new_friend",
        friend
      ),

      db.sadd(`user:${session.user.id}:friend`, idToAdd),
      db.sadd(`user:${idToAdd}:friend`, session.user.id),

      //remove friend request
      db.srem(`user:${session.user.id}:incoming_friend_requests`, idToAdd),
    ]);

    return new Response("Ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
