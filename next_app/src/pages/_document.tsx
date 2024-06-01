import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/icon.svg" type="image/svg" />
        <link rel="apple-touch-icon" href="/apple-icon.png" type="image/png" />
        {/* DM MONO + SANS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />

        {/* META TAGS */}
        <meta name="author" content="BetterIDEa Team" />
        <meta name="description" content="IDE for Arweave AO" />
        <meta name="keywords" content="Arweave, AO, IDE, BetterIDEa, Permaweb" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        <meta name="og:title" content="BetterIDEa IDE" />
        <meta name="og:description" content="Welcome to the intuitive web IDE for building powerful actor oriented applications." /> 
        <meta name="og:image" content="https://ide.betteridea.dev/apple-icon.png" />
        <meta name="og:url" content="https://ide.betteridea.dev" />
        <meta name="og:site_name" content="betteridea.dev" />
        <meta name="og:locale" content="en_US" />
        <meta name="og:type" content="website" />
        <meta name="theme-color" content="#bdfeb1"/>

      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
