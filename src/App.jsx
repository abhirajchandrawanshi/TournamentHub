import { Routes, Route, Navigate } from "react-router-dom";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Live from "./pages/Live";
import Arena from "./pages/Arena";

export default function App() {
  return (
    <Routes>

      <Route path="/" element={<Landing />} />

      <Route path="/auth" element={<Auth />} />

      <Route path="/live" element={<Live />} />

      <Route path="/arena" element={<Arena />} />

      <Route path="*" element={<Navigate to="/" />} />

    </Routes>
  );
}