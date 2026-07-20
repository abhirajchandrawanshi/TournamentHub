"use client";

export default function SignupForm() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#141922] border border-gray-800 rounded-2xl p-8">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <form className="space-y-5 mt-8">

          <input
            placeholder="Full Name"
            className="w-full p-4 rounded-xl bg-[#0B0D12]"
          />

          <input
            placeholder="Email"
            className="w-full p-4 rounded-xl bg-[#0B0D12]"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-[#0B0D12]"
          />

          <button className="w-full p-4 rounded-xl bg-green-500 text-black font-bold">
            Create Account
          </button>

        </form>

      </div>

    </div>
  );
}