import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/store";
import { setIsWalletConnected } from "@/store/app-store";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import AONotebookPage from "@/components/ao";
import WarpPage from "@/components/warp";

function App() {
  const dispatch = useAppDispatch();
  const { appMode } = useAppSelector((state) => state.app);
  const searchParams = useSearchParams();

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

      {appMode === "aos" ? <AONotebookPage /> : <WarpPage />}
    </>
  );
}

export default App;
