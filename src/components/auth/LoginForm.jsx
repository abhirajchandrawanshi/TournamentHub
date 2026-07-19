export default function LoginForm({ onRegister, onForgot }) {
  return (
    <div className="glass auth-card">

      <h2>Welcome Back</h2>

      <p>
        Sign in to continue your tournaments.
      </p>

      <form className="auth-form">

        <input
          type="email"
          placeholder="Email Address"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button
          type="submit"
          className="btn btn-primary"
        >
          Sign In
        </button>

      </form>

      <button
        className="auth-link"
        onClick={onForgot}
      >
        Forgot Password?
      </button>

      <p className="auth-switch">
        Don't have an account?{" "}

        <button
          className="auth-link"
          onClick={onRegister}
        >
          Create one
        </button>

      </p>

    </div>
  );
}