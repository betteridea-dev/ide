import "@/styles/globals.css";
import "katex/dist/katex.min.css";
import "@xterm/xterm/css/xterm.css";
import type { AppProps } from "next/app";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ArweaveWalletKit } from "arweave-wallet-kit";
import ErrorBoundary from "@/components/ui/custom/error-boundary";
// import { GoogleAnalytics } from "nextjs-google-analytics";

// declare global {
//   interface Window {
//     arweaveWallet: {
//       connect: Function;
//       disconnect: Function;
//       getActiveAddress:()=> Promise<string>;
//       signDataItem: Function;
//       subscription: Function;
//     };
//   }
// }

// Main App component
export default function App({ Component, pageProps }: AppProps) {
    return (
        <ErrorBoundary>
            <div className="font-btr-normal min-h-screen">
                <ArweaveWalletKit
                    config={{
                        permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION"],
                        ensurePermissions: true,
                    }}
                    theme={{
                        accent: { r: 105, g: 161, b: 79 },
                        displayTheme: "dark",
                        radius: "minimal"
                    }}
                >
                    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                        {/* <GoogleAnalytics trackPageViews gaMeasurementId="G-7H9SL00HCC" /> */}
                        <GoogleAnalytics gaId="G-7H9SL00HCC" />
                        <Component {...pageProps} />
                        <Toaster />
                        <Sonner richColors />
                    </ThemeProvider>
                </ArweaveWalletKit>
            </div>
        </ErrorBoundary>
    );
}
