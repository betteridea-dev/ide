import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IDE from "@/pages/ide";
import CEditor from "@/pages/editor";
import AONotebookPage from "./pages/ao-notebook";
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../hooks/store";
import { setIsWalletConnected } from "./store/app-store";

const router = createBrowserRouter([
  {
    path: "/notebook",
    element: <AONotebookPage />,
  },
  {
    path: "/",
    element: <IDE />,
  },
  {
    path: "/editor",
    element: <CEditor />,
  },
]);

function App() {
  const dispatch = useAppDispatch();
  const { appMode } = useAppSelector((state) => state.app);

  const _setIsWalletConnected = useCallback(
    (val: boolean) => {
      dispatch(setIsWalletConnected(val));
    },
    [dispatch]
  );

  useEffect(() => {
    (async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wallet = (window as any).arweaveWallet;

      if (!wallet) return alert("Please install the ArConnect extension");

      try {
        await wallet.getActiveAddress();
        _setIsWalletConnected(true);
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await wallet.connect(["ACCESS_ADDRESS", "SIGN_TRANSACTION"]);
        _setIsWalletConnected(true);
      }
    })();
  }, [_setIsWalletConnected]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
