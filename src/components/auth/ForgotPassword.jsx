export default function ForgotPassword({ onBack }) {
  return (
    <div className="glass auth-card">

      <h2>Reset Password</h2>

      <p>
        Enter your email address to receive a password reset link.
      </p>

      <form className="auth-form">

        <input
          type="email"
          placeholder="Email Address"
        />

        <button
          type="submit"
          className="btn btn-primary"
        >
          Send Reset Link
        </button>

      </form>

      <p className="auth-switch">
        Remember your password?{" "}

        <button
          type="button"
          className="auth-link"
          onClick={onBack}
        >
          Back to Login
        </button>

      </p>

    </div>
  );
}