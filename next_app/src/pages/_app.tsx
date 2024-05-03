import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { useLocalStorage } from "usehooks-ts";
import { useEffect } from "react";

declare global {
  interface Window {
    arweaveWallet: {
      connect: Function;
      disconnect: Function;
      getActiveAddress: Function;
    };
  }
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="font-btr-normal bg-btr-black-3 min-h-screen">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </div>
  );
}
