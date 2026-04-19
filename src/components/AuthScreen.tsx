import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(flow === "signIn" ? "Invalid email or password" : "Could not create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setIsLoading(true);
    try {
      await signIn("anonymous");
    } catch {
      setError("Could not continue as guest");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col relative overflow-hidden grain-overlay">
      {/* Decorative elements */}
      <div className="absolute top-10 left-10 text-6xl sm:text-8xl opacity-20 animate-float" style={{ animationDelay: "0s" }}>🌿</div>
      <div className="absolute top-32 right-16 text-4xl sm:text-6xl opacity-20 animate-float" style={{ animationDelay: "0.5s" }}>🌸</div>
      <div className="absolute bottom-20 left-20 text-5xl sm:text-7xl opacity-20 animate-float" style={{ animationDelay: "1s" }}>🌱</div>
      <div className="absolute bottom-32 right-10 text-4xl sm:text-5xl opacity-20 animate-float" style={{ animationDelay: "1.5s" }}>🌻</div>

      <div className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8 sm:mb-12 animate-slide-up">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-forest to-sage flex items-center justify-center shadow-2xl">
              <span className="text-4xl sm:text-5xl">🌱</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-forest tracking-tight">
              Bloom<span className="text-terracotta">Bar</span>
            </h1>
            <p className="mt-3 sm:mt-4 text-forest/60 font-body text-base sm:text-lg">
              Design your dream container garden
            </p>
          </div>

          {/* Auth Card */}
          <div
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 sm:p-8 border border-sage/10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="font-display text-xl sm:text-2xl text-forest mb-6 text-center">
              {flow === "signIn" ? "Welcome Back" : "Create Account"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-body text-forest/70 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-cream border border-sage/30 text-forest placeholder-forest/40 font-body text-base focus:border-forest transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-body text-forest/70 mb-2">
                  Password
                </label>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-cream border border-sage/30 text-forest placeholder-forest/40 font-body text-base focus:border-forest transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <input name="flow" type="hidden" value={flow} />

              {error && (
                <p className="text-terracotta text-sm font-body text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 sm:py-4 bg-forest text-cream font-body font-medium rounded-xl hover:bg-forest/90 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 text-base sm:text-lg"
              >
                {isLoading ? "Loading..." : flow === "signIn" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 text-center">
              <button
                type="button"
                onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
                className="text-forest/60 hover:text-forest font-body text-sm sm:text-base transition-colors"
              >
                {flow === "signIn" ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-6 sm:mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-sage/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white/80 text-forest/50 font-body">or</span>
              </div>
            </div>

            <button
              onClick={handleAnonymous}
              disabled={isLoading}
              className="mt-6 w-full py-3 sm:py-4 bg-cream border-2 border-sage/30 text-forest font-body font-medium rounded-xl hover:bg-sage/10 hover:border-sage transition-all disabled:opacity-50 text-base sm:text-lg"
            >
              Continue as Guest 🌿
            </button>
          </div>

          {/* Features */}
          <div
            className="mt-8 sm:mt-12 grid grid-cols-3 gap-3 sm:gap-4 text-center animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            {[
              { emoji: "🎨", label: "Design" },
              { emoji: "📚", label: "Learn" },
              { emoji: "📦", label: "Ship" },
            ].map((item, i) => (
              <div key={i} className="p-3 sm:p-4 bg-white/50 rounded-2xl backdrop-blur-sm">
                <span className="text-2xl sm:text-3xl">{item.emoji}</span>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-forest/70 font-body">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 sm:py-6 text-center relative z-10">
        <p className="text-xs sm:text-sm text-forest/40 font-body">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
