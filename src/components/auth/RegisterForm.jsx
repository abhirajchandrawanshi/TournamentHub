export default function RegisterForm({ onLogin }) {
  return (
    <div className="glass auth-card">

      <h2>Create Account</h2>

      <p>
        Join Checkmate League and start competing.
      </p>

      <form className="auth-form">

        <input
          type="text"
          placeholder="Full Name"
        />

        <input
          type="email"
          placeholder="Email Address"
        />

        <input
          type="password"
          placeholder="Create Password"
        />

        <input
          type="password"
          placeholder="Confirm Password"
        />

        <button
          type="submit"
          className="btn btn-primary"
        >
          Create Account
        </button>

      </form>

      <p className="auth-switch">
        Already have an account?{" "}

        <button
          type="button"
          className="auth-link"
          onClick={onLogin}
        >
          Sign In
        </button>

      </p>

    </div>
  );
}