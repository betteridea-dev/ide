import IDE from "./ide";
import CEditor from "./editor";
import { useSearchParams } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {searchParams.has("editor") ? <CEditor /> : <IDE />}
    </ThemeProvider>
  );
}
