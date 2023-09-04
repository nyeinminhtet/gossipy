import { z } from "zod";

export const AddFriendValidator = z.object({
  email: z.string().email({ message: "Please enter email!" }),
});
