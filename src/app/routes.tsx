import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/admin",
    Component: AdminPanel,
  },
]);
