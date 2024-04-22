import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";
import { store } from "@/store";
import NoSSR from "react-no-ssr";

// declare global {
//   interface Window {
//     arweaveWallet: object;
//   }
// }

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NoSSR>
      <Provider store={store}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Component {...pageProps} />
        </ThemeProvider>
      </Provider>
    </NoSSR>
  );
}
