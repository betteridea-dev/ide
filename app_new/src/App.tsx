import { createBrowserRouter, RouterProvider } from "react-router-dom";
import IDE from "@/pages/ide";
import CEditor from "@/pages/editor";

const router = createBrowserRouter([
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
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
