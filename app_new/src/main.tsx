import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { ThemeProvider } from "./components/theme-provider.tsx";
import { Provider } from "react-redux";
import { store } from "@/store";

import "./index.css";
import "./theme.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="dark" storageKey="better-ide-theme">
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
