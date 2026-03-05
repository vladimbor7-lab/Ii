import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";
import Diagnostics from "./pages/Diagnostics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
  {
    path: "/diagnostics",
    Component: Diagnostics,
  },
]);
