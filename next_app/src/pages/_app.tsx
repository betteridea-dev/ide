import "@/styles/globals.css";
import 'katex/dist/katex.min.css';
import "@xterm/xterm/css/xterm.css"
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useEffect, useState } from "react";
// import { GoogleAnalytics } from "nextjs-google-analytics";



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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = typeof window.navigator === "undefined" ? "bot" : navigator.userAgent;
      const isMobile = Boolean(userAgent.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
      ));
      setIsMobile(isMobile);
    }
  }, []);

  return (
    <div className="font-btr-normal min-h-screen">
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        {/* <GoogleAnalytics trackPageViews gaMeasurementId="G-7H9SL00HCC" /> */}
        <GoogleAnalytics gaId="G-7H9SL00HCC" />
        {isMobile ? <div className="h-screen w-screen flex items-center justify-center p-2"><div>
          Hi There!<br />Looks like you are using a mobile device. <br />Please use a desktop device to access the IDE.
          <br /><br />Thank you!<br /><br />~The developer
        </div></div> :
          <Component {...pageProps} />}
        <Toaster />
        <Sonner />
      </ThemeProvider>
    </div>
  );
}
