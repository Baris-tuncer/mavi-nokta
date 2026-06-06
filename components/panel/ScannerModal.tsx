"use client";

import { useState, useRef, useEffect } from "react";
import { X, ScanLine, Keyboard, CheckCircle2, XCircle, Zap } from "lucide-react";

type Props = {
  isDemo: boolean;
  onClose: () => void;
};

type Tab = "qr" | "pin";
type VerifyResult = {
  success: boolean;
  customerName: string;
  campaignName: string;
  xpGained: number;
} | null;

const DEMO_PIN = "1234";

export function ScannerModal({ isDemo, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("pin");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<VerifyResult>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const next = [...digits];
    next[index] = value;
    setDigits(next);
    setError(null);
    setResult(null);

    // Auto-focus next
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleVerify() {
    const pin = digits.join("");
    if (pin.length !== 4) {
      setError("4 haneli PIN girin.");
      return;
    }

    setVerifying(true);
    setError(null);
    setResult(null);

    // Simulate verification delay
    setTimeout(() => {
      setVerifying(false);

      if (isDemo && pin === DEMO_PIN) {
        setResult({
          success: true,
          customerName: "Ahmet B.",
          campaignName: "Balkabakli Cheesecake",
          xpGained: 25,
        });
      } else if (isDemo) {
        setResult({
          success: false,
          customerName: "",
          campaignName: "",
          xpGained: 0,
        });
      } else {
        // TODO: gercek API cagrisi
        setError("Dogrulama servisi henuz aktif degil.");
      }
    }, 800);
  }

  function handleReset() {
    setDigits(["", "", "", ""]);
    setResult(null);
    setError(null);
    inputRefs.current[0]?.focus();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white/80 shadow-2xl shadow-black/10 backdrop-blur-xl sm:max-w-md sm:rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/70 px-5 py-4 backdrop-blur-xl">
          <h2 className="text-lg font-bold text-slate-800">
            Musteri Dogrula
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        <div className="p-5">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("qr")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                tab === "qr"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <ScanLine className="h-4 w-4" />
              QR Tara
            </button>
            <button
              onClick={() => setTab("pin")}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
                tab === "pin"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }`}
            >
              <Keyboard className="h-4 w-4" />
              PIN Gir
            </button>
          </div>

          {/* QR Tab — Placeholder */}
          {tab === "qr" && (
            <div className="mt-6 flex flex-col items-center rounded-2xl bg-slate-50 py-12">
              <ScanLine className="h-12 w-12 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-400">
                QR tarama yakinda
              </p>
              <p className="mt-1 text-xs text-slate-300">
                Simdilik PIN ile dogrulayabilirsiniz
              </p>
            </div>
          )}

          {/* PIN Tab */}
          {tab === "pin" && (
            <div className="mt-6">
              {/* PIN Inputs */}
              <div className="flex justify-center gap-3">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="h-16 w-14 rounded-xl border-2 border-slate-200 bg-white text-center text-2xl font-bold text-slate-800 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                ))}
              </div>

              {isDemo && (
                <p className="mt-3 text-center text-xs text-slate-300">
                  Demo PIN: 1234
                </p>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={verifying || digits.join("").length !== 4}
                className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 active:scale-[0.98]"
              >
                {verifying ? "Dogrulaniyor..." : "Dogrula"}
              </button>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-center text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Result */}
              {result && (
                <div
                  className={`mt-4 rounded-2xl p-5 ${
                    result.success
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-500" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-bold ${
                          result.success ? "text-emerald-700" : "text-red-700"
                        }`}
                      >
                        {result.success ? "Basarili!" : "Gecersiz PIN"}
                      </p>
                      {result.success && (
                        <>
                          <p className="text-sm text-emerald-600">
                            {result.customerName}
                          </p>
                          <p className="text-xs text-emerald-500">
                            {result.campaignName}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {result.success && result.xpGained > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <Zap className="h-3 w-3" />
                      +{result.xpGained} XP kazandiniz!
                    </div>
                  )}

                  {/* Reset */}
                  <button
                    onClick={handleReset}
                    className="mt-3 text-xs font-semibold text-slate-500 underline underline-offset-2 hover:text-slate-700"
                  >
                    Yeni tarama
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
