import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { UserAuthProvider } from "./UserAuth";
import { ProtectedRoute } from "./ProtectedRoute";

import { DashBoard } from "./DashBoard";
import { Expenses } from "./Expenses";
import { Analysis } from "./Analysis";
import { Auth } from "./Auth";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashBoard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/expenses",
    element: (
      <ProtectedRoute>
        <Expenses />
      </ProtectedRoute>
    ),
  },
  {
    path: "/analysis",
    element: (
      <ProtectedRoute>
        <Analysis />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserAuthProvider>
      <RouterProvider router={routes} />
    </UserAuthProvider>
  </StrictMode>
);