import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

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
    <>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <Component {...pageProps} />
        <Toaster />
      </ThemeProvider>
    </>
  );
}
