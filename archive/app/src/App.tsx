import { useSearchParams } from "react-router-dom";
import IDE from "@/pages/ide";
import CodeEditor from "@/pages/editor";
import AONotebookPage from "./pages/ao-notebook";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/store";
import { setIsWalletConnected } from "./store/app-store";
import { Toaster, toast } from "react-hot-toast";
import CodeBlockExt from "@/components/ao/codeblock.ext";

function App() {
  const dispatch = useAppDispatch();
  const { appMode } = useAppSelector((state) => state.app);
  const [searchParams] = useSearchParams();

  const _setIsWalletConnected = useCallback(
    (val: boolean) => {
      dispatch(setIsWalletConnected(val));
    },
    [dispatch],
  );

  useEffect(() => {
    (async () => {
      const wallet = window.arweaveWallet;

      if (!wallet)
        return toast.error("Unable to find ArConnect wallet extension. Please install it and refresh the page.", {
          duration: 10000,
        });
      // if (!wallet) return alert("Please install the ArConnect extension");

      if (searchParams.has("codeblock")) return;
      try {
        await wallet.getActiveAddress();
        _setIsWalletConnected(true);
      } catch (e) {
        await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
        _setIsWalletConnected(true);
      }
    })();
  }, [_setIsWalletConnected]);

  return (
    <>
      <Toaster position="bottom-right" />
      {/* <RouterProvider router={router} /> */}

      {searchParams.has("codeblock") ? <CodeBlockExt /> : <>{searchParams.has("editor") ? <CodeEditor /> : appMode === "aos" ? <AONotebookPage /> : <IDE />}</>}
    </>
  );
}

export default App;
