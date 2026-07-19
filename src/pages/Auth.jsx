import { useState } from "react";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";
import ForgotPassword from "../components/auth/ForgotPassword";

export default function Auth() {
  const [page, setPage] = useState("login");

  return (
    <div className="auth-page">

      {page === "login" && (
        <LoginForm
          onRegister={() => setPage("register")}
          onForgot={() => setPage("forgot")}
        />
      )}

      {page === "register" && (
        <RegisterForm
          onLogin={() => setPage("login")}
        />
      )}

      {page === "forgot" && (
        <ForgotPassword
          onBack={() => setPage("login")}
        />
      )}

    </div>
  );
}