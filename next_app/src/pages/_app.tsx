import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

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
        <GoogleAnalytics gaId="G-7H9SL00HCC" />
        <Component {...pageProps} />
        <Toaster />
        <Sonner />
      </ThemeProvider>
    </div>
  );
}
