"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions";
import { LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [error, formAction, isPending] = useActionState(
    async (_: string | null, formData: FormData) => {
      const result = await login(formData);
      return result?.error ?? null;
    },
    null
  );

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black italic tracking-tighter text-white">
            ZULIA <span className="text-yellow-400">TCG</span>
          </h1>
          <p className="text-slate-400 font-bold tracking-widest text-xs mt-2">PANEL DE ADMINISTRACIÓN</p>
        </div>

        {/* Card */}
        <div className="bg-[#0a0e17] border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center">
              <LogIn className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="font-black text-white text-lg">Iniciar Sesión</h2>
              <p className="text-slate-500 text-xs font-medium">Solo para administradores autorizados</p>
            </div>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">CORREO ELECTRÓNICO</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all placeholder:text-slate-600 font-medium"
                placeholder="admin@zuliatchg.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 tracking-wider">CONTRASEÑA</label>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/50 transition-all placeholder:text-slate-600 font-medium"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm font-bold">
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-3 rounded-lg transition-colors tracking-widest text-sm mt-2"
            >
              {isPending ? "ENTRANDO..." : "ENTRAR AL PANEL"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6 font-medium">
          Acceso restringido. Solo personal autorizado.
        </p>
      </div>
    </div>
  );
}
