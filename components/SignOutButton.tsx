"use client";

import React, { ButtonHTMLAttributes, FC, useState } from "react";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import { Loader2, LogOut } from "lucide-react";
import toast from "react-hot-toast";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {}

const SignOutButton: FC<Props> = ({ ...props }) => {
  const [isSigningOut, setIsSigningOut] = useState(false);
  return (
    <Button
      {...props}
      variant="ghost"
      onClick={async () => {
        setIsSigningOut(true);
        try {
          await signOut();
        } catch (error) {
          toast.error("There was a problem!");
        } finally {
          setIsSigningOut(false);
        }
      }}
    >
      {isSigningOut ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="w-4 h-4" />
      )}
    </Button>
  );
};

export default SignOutButton;
