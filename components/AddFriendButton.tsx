"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { AddFriendValidator } from "@/lib/validations/add-friend";
import axios, { AxiosError } from "axios";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

type FormData = z.infer<typeof AddFriendValidator>;

const AddFriendButton = () => {
  const [showSuccessState, setShowSuccessState] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(AddFriendValidator),
  });

  const addFriend = async (email: string) => {
    try {
      const validatedEmail = AddFriendValidator.parse({ email });

      await axios.post(`/api/friends/add`, {
        email: validatedEmail,
      });

      setShowSuccessState(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError("email", { message: error.message });
        return;
      }

      if (error instanceof AxiosError) {
        setError("email", { message: error.response?.data });
        return;
      }

      setError("email", { message: "Something went wrong!" });
    }
  };

  const onSubmit = (data: FormData) => {
    addFriend(data.email);
  };

  return (
    <form className="max-w-sm" onSubmit={handleSubmit(onSubmit)}>
      <label
        htmlFor="email"
        className="block text-sm font-medium leading-6 text-gray-900 dark:text-zinc-50"
      >
        Add friend by email
      </label>

      <div className=" mt-2 flex gap-4">
        <input
          {...register("email")}
          type="text"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm
           ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-2 focus:ring-indigo-600
           sm:text-sm sm:leading-6 px-2"
          placeholder="nyeinminhtet662@gmail.com"
        />
        <Button>Add</Button>
      </div>

      <p className=" mt-1 text-sm text-red-600">{errors.email?.message}</p>

      {showSuccessState ? (
        <p className=" mt-1 text-sm text-green-600">Friend Request sent!</p>
      ) : null}
    </form>
  );
};

export default AddFriendButton;
