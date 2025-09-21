// App.jsx
import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import Login from "./pages/Login/Login.jsx";
import Player from "./pages/Player/Player.jsx";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const navigate = useNavigate();

  // track whether we are waiting for the initial auth result
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // subscribe once on mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setInitializing(false);

      // use window.location.pathname to avoid adding location to deps
      const path = window.location.pathname;

      if (user) {
        // if user is already on login page, redirect to home
        if (path === "/login") {
          navigate("/", { replace: true });
        }
        // otherwise do nothing (keep current route)
      } else {
        // if not logged in and not already on /login, redirect
        if (path !== "/login") {
          navigate("/login", { replace: true });
        }
      }
    });

    // cleanup
    return unsubscribe; // unsubscribe is a function
  }, [navigate]);

  // optional: show nothing / spinner until firebase responds
  if (initializing) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ToastContainer theme="dark" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/player/:id" element={<Player />} />
      </Routes>
    </div>
  );
};

export default App;
