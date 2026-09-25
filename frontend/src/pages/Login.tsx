import { signInWithPopup } from "firebase/auth";
import ThemeToggle from "../components/ThemeToggle";
import { auth, googleProvider } from "../utils/firebase";
import api from "../utils/axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import getCurrentUser from "../features/getCurrentUser";

const MODES = [
  { name: "Chat", hue: 350 },
  { name: "Coding", hue: 40 },
  { name: "PDF", hue: 310 },
  { name: "PPT", hue: 130 },
  { name: "Image", hue: 250 },
  { name: "Search", hue: 90 },
];

const Logo = ({ size = 34 }: { size?: number }) => (
  <div
    className="relative shrink-0 rounded-full bg-ink"
    style={{ width: size, height: size }}
  >
    <div
      className="absolute rounded-full bg-ac"
      style={{
        top: size * 0.235,
        left: size * 0.265,
        width: size * 0.3,
        height: size * 0.3,
      }}
    />
  </div>
);

const inputClass =
  "w-full rounded-[14px] border-2 border-ln bg-sf px-3.5 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-mu focus:border-ac";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then((user) => {
      if (user) navigate("/home", { replace: true });
    });
  }, [navigate]);

  const handleLogin = async (token: string) => {
    try {
      await api.post("/api/auth/login", { token });
      navigate("/home", { replace: true });
    } catch (error) {
      console.log(error);
    }
  };

  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider);
    const token = await data.user.getIdToken();
    console.log(token);

    await handleLogin(token);

    console.log(data);
  };

  return (
    <div className="flex min-h-screen gap-3.5 bg-bg p-3.5 font-sans transition-colors">
      {/* Brand panel */}
      <div className="hidden flex-1 flex-col justify-between rounded-3xl bg-sb p-12 lg:flex">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div className="text-2xl font-extrabold text-ink">Onyx</div>
        </div>
        <div className="flex flex-col gap-[18px]">
          <h1 className="text-[52px] leading-[1.05] font-extrabold text-pretty text-ink">
            Think out loud.
            <br />
            Onyx does the rest.
          </h1>
          <p className="max-w-[420px] text-lg text-mu">
            One friendly assistant for chat, code, PDFs, slides, images and
            search.
          </p>
          <div className="flex max-w-[460px] flex-wrap gap-2">
            {MODES.map((m) => (
              <div
                key={m.name}
                className="flex items-center gap-[7px] rounded-full bg-sf px-[13px] py-[7px] text-[13px] font-bold text-ink"
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: `oklch(0.84 0.08 ${m.hue})` }}
                />
                {m.name}
              </div>
            ))}
          </div>
        </div>
        <div className="text-[13px] text-mu">© 2026 Onyx</div>
      </div>

      {/* Form */}
      <div className="relative flex w-full items-center justify-center lg:w-[480px]">
        <ThemeToggle className="absolute top-2 right-2" />
        <div className="flex w-full max-w-[380px] flex-col gap-4">
          <div className="mb-4 flex items-center gap-2.5 lg:hidden">
            <Logo size={30} />
            <div className="text-[21px] font-extrabold text-ink">Onyx</div>
          </div>

          <h2 className="text-3xl font-extrabold text-ink">Welcome back</h2>
          <p className="-mt-2 text-[15px] text-mu">
            Sign in to pick up where you left off.
          </p>

          <button
            type="button"
            className="flex cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-sf p-3.5 text-[15px] font-bold text-ink shadow-soft transition hover:bg-sf2"
            onClick={googleLogin}
          >
            <span className="size-[18px] rounded-full border-[3px] border-ac3" />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-[13px] text-mu">
            <div className="h-px flex-1 bg-ln" />
            or
            <div className="h-px flex-1 bg-ln" />
          </div>

          <form className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[13px] font-bold text-ink">Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex text-[13px] font-bold text-ink">
                Password
                <button
                  type="button"
                  className="ml-auto cursor-pointer font-semibold text-mu hover:text-ink"
                >
                  Forgot?
                </button>
              </span>
              <input
                type="password"
                placeholder="••••••••"
                className={inputClass}
              />
            </label>

            <button
              type="submit"
              className="mt-1 cursor-pointer rounded-2xl bg-ink p-[15px] text-center text-base font-extrabold text-bg transition hover:opacity-90"
            >
              Sign in
            </button>
          </form>

          <p className="text-center text-sm text-mu">
            New here?{" "}
            <button
              type="button"
              className="cursor-pointer font-bold text-ink hover:underline"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
