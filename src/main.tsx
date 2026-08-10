import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import EnrollmentProvider from "./context/EnrollmentProvider";
import AuthProvider from "./features/auth/context/AuthProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <EnrollmentProvider>
        <App />
      </EnrollmentProvider>
    </AuthProvider>
  </React.StrictMode>
);
