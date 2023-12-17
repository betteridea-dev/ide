import IDE from "./ide";
import CEditor from "./editor";
import { useSearchParams } from "react-router-dom";


export default function App() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams()

  if (searchParams.has("editor"))
    return <CEditor />
  else
    return <IDE />
}