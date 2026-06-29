import { useState } from "react";
import { Wallet, Mail, Lock } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    const { error } =
      mode === "signin" ? await signIn(email, password) : await signUp(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (mode === "signup") {
      setInfo("Akun dibuat. Cek email untuk verifikasi, lalu login.");
      setMode("signin");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-glow mb-3">
            <Wallet className="w-6 h-6" />
          </div>
          <h1 className="font-display text-lg font-medium text-gray-900 dark:text-white">
            Expense Tracker
          </h1>
          <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-0.5">
            {mode === "signin" ? "Masuk ke akun Anda" : "Buat akun baru"}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-2xl backdrop-saturate-150 border border-white/60 dark:border-gray-800/60 p-5 shadow-soft space-y-3"
        >
          {error && (
            <p className="text-sm font-light text-red-600 bg-red-50/70 backdrop-blur-sm border border-red-100 dark:bg-red-900/30 px-3 py-2 rounded-xl">
              {error}
            </p>
          )}
          {info && (
            <p className="text-sm font-light text-green-600 bg-green-50/70 backdrop-blur-sm border border-green-100 dark:bg-green-900/30 px-3 py-2 rounded-xl">
              {info}
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-white/60 dark:border-gray-700/60 bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm font-light text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-300/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 hover:scale-[1.02] transition-transform shadow-glow disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Memproses..." : mode === "signin" ? "Masuk" : "Daftar"}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "signin" ? "signup" : "signin"));
              setError("");
              setInfo("");
            }}
            className="w-full text-xs font-light text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          >
            {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
