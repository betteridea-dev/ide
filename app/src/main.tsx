import { createRoot } from 'react-dom/client'
import './index.css'
import { PostHogProvider } from 'posthog-js/react'
import { ThemeProvider } from '@/components/theme-provider.tsx'
import { BrowserRouter, HashRouter, Route, Routes } from "react-router";
import { ArweaveWalletKit } from "@arweave-wallet-kit/react"
import WanderStrategy from "@arweave-wallet-kit/wander-strategy"
import WAuthStrategy from "@wauth/strategy"
import { WAuthProviders } from "@wauth/strategy"
import AosyncStrategy from "@vela-ventures/aosync-strategy"

import App from './App'

const usePosthog = (import.meta.env.MODE !== "development")

function Main() {
  const content = (
    <ArweaveWalletKit
      config={{
        appInfo: {
          name: "BetterIDEa",
          logo: "t8cPU_PWjdLXRBAN89nzb9JQoRAf5ZBF2kkTZoxtJPc",
        },
        strategies: [
          new WanderStrategy(),
          // new WAuthStrategy({ provider: WAuthProviders.Github }),
          new AosyncStrategy(),
          // new WAuthStrategy({ provider: WAuthProviders.Discord }),
          // new WAuthStrategy({ provider: WAuthProviders.X }),
          // new WAuthStrategy({ provider: WAuthProviders.Google }),
        ],
        permissions: ["ACCESS_ADDRESS", "SIGNATURE", "SIGN_TRANSACTION"],
      }}
      theme={{ displayTheme: localStorage.getItem("betteridea-theme") as any || "dark" }}
    >
      <ThemeProvider defaultTheme={localStorage.getItem("betteridea-theme") as any || "dark"} storageKey="betteridea-theme">
        <HashRouter>
          <Routes>
            <Route index element={<App />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </ArweaveWalletKit>
  )

  if (usePosthog) {
    return (
      <PostHogProvider
        apiKey="phc_AuCH0eUwOQrmAEOdKZFQnKpZuYBepgVq9zRjr3AlSZq"
        options={{
          api_host: "https://eu.i.posthog.com",
          defaults: '2025-05-24',
          capture_exceptions: true,
          debug: usePosthog,
        }}
      >
        {content}
      </PostHogProvider>
    )
  }

  return content
}

createRoot(document.getElementById('root')!).render(<Main />)