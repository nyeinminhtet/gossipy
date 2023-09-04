"use client";

import { ThemeProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";
import React from "react";
import { Toaster as HotToaster } from "react-hot-toast";

const Provider = ({ children, ...props }: ThemeProviderProps) => {
  return (
    <>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...props}
      >
        <HotToaster position="top-center" reverseOrder={false} />
        {children}
      </ThemeProvider>
    </>
  );
};

export default Provider;
