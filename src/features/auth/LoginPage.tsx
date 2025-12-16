import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { motion } from "framer-motion";

import { loginRequest } from "./auth.api";
import { useAuth } from "./useAuth";
import { useToast } from "../../components/toast/ToastContext";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

function parseErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const apiMsg = (err.response?.data as { error?: string } | undefined)?.error;
    if (typeof apiMsg === "string" && apiMsg.trim()) return apiMsg;
    if (err.response?.status) return `Request failed (${err.response.status}).`;
    return err.message || "Login failed.";
  }
  if (err instanceof Error) return err.message;
  return "Login failed. Please try again.";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { login, isAuthed } = useAuth();
  const { push } = useToast();
  const [showPass, setShowPass] = useState(false);

  const defaultValues = useMemo<FormValues>(
    () => ({ email: "eve.holt@reqres.in", password: "cityslicka" }),
    []
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      login(data.token);
      qc.removeQueries({ queryKey: ["products"] });

      const isMock = data.token.startsWith("mock_") || data.token.startsWith("mock-");
      push({
        type: "success",
        title: "Login successful",
        message: isMock
          ? "Logged in with MOCK token (ReqRes blocked)."
          : "Token stored successfully.",
      });

      navigate("/products", { replace: true });
    },
    onError: (err) => {
      push({ type: "error", title: "Login failed", message: parseErrorMessage(err) });
    },
  });

  useEffect(() => {
    if (isAuthed) navigate("/products", { replace: true });
  }, [isAuthed, navigate]);

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const fillCorrect = () => {
    setValue("email", "eve.holt@reqres.in", { shouldValidate: true });
    setValue("password", "cityslicka", { shouldValidate: true });
  };

  const fillWrong = () => {
    setValue("email", "wrong@example.com", { shouldValidate: true });
    setValue("password", "wrongpass", { shouldValidate: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-10">
      {/* Ambient background effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-[100px]" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-violet-500/20 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-800/50 blur-[120px]" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full"
        >
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-10">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-violet-500/25"
            >
              <span className="text-xl font-bold text-white tracking-tight">MoH</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-center text-2xl font-semibold tracking-tight text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-center text-sm text-slate-400">
                Sign in to access your admin dashboard
              </p>
            </motion.div>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Email
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                  placeholder="you@example.com"
                />
                {errors.email?.message ? (
                  <p className="mt-2 text-xs font-medium text-red-400">{errors.email.message}</p>
                ) : null}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 pr-16 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/10 focus:ring-4 focus:ring-blue-500/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {showPass ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password?.message ? (
                  <p className="mt-2 text-xs font-medium text-red-400">{errors.password.message}</p>
                ) : null}
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                type="submit"
                disabled={mutation.isPending}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">
                  {mutation.isPending ? "Signing in…" : "Sign In"}
                </span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-blue-500 to-violet-500 transition-transform duration-300 group-hover:translate-x-0" />
              </motion.button>

              {/* Hint box */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/5 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">Tester Hint</p>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      Use the buttons below to test both{" "}
                      <span className="text-emerald-400">success</span> and{" "}
                      <span className="text-red-400">error handling</span>.
                    </p>

                    <div className="mt-4 space-y-2.5">
                      <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5">
                        <div className="text-xs font-semibold text-emerald-400">✓ Correct credentials</div>
                        <div className="mt-1.5 space-y-0.5 text-xs text-slate-400">
                          <div><span className="text-slate-500">Email:</span> eve.holt@reqres.in</div>
                          <div><span className="text-slate-500">Pass:</span> cityslicka</div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                        <div className="text-xs font-semibold text-red-400">✗ Wrong credentials</div>
                        <div className="mt-1.5 space-y-0.5 text-xs text-slate-400">
                          <div><span className="text-slate-500">Email:</span> wrong@example.com</div>
                          <div><span className="text-slate-500">Pass:</span> wrongpass</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={fillCorrect}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Fill correct
                    </button>
                    <button
                      type="button"
                      onClick={fillWrong}
                      className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                    >
                      Fill wrong
                    </button>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="text-center text-xs text-slate-500"
              >
                Auth state via <span className="text-slate-400">Context API</span> + token in{" "}
                <span className="text-slate-400">localStorage</span>.
              </motion.p>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}