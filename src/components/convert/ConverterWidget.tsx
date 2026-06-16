"use client";

import { useEffect, useState } from "react";

type Props = {
  from: string;
  to: string;
  fromSymbol: string;
  toSymbol: string;
  /** Build-time fallback rate (to per 1 from). */
  baseRate: number;
};

/**
 * Live currency converter. Renders instantly with the build-time rate, then
 * fetches the current mid-market rate client-side and updates.
 */
export default function ConverterWidget({ from, to, fromSymbol, toSymbol, baseRate }: Props) {
  const [amount, setAmount] = useState("100");
  const [rate, setRate] = useState(baseRate);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://open.er-api.com/v6/latest/${from}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        const r = d?.rates?.[to];
        if (typeof r === "number" && r > 0) {
          setRate(r);
          setLive(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [from, to]);

  const amt = Number(amount) || 0;
  const result = amt * rate;
  const fmt = (v: number) =>
    v.toLocaleString("en-US", { maximumFractionDigits: ["JPY", "KRW", "VND", "IDR"].includes(to) ? 0 : 2 });

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">{from}</label>
          <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5">
            <span className="text-gray-400">{fromSymbol}</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "" || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              className="w-full text-lg font-bold text-gray-900 focus:outline-none"
            />
          </div>
        </div>
        <div className="hidden pb-3 text-center text-2xl text-blue-500 sm:block">=</div>
        <div>
          <label className="mb-1 block text-xs font-bold uppercase text-gray-500">{to}</label>
          <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
            <span className="text-blue-400">{toSymbol}</span>
            <span className="w-full text-lg font-black text-blue-700">{fmt(result)}</span>
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        1 {from} = <span className="font-bold text-gray-700">{fmt(rate)} {to}</span>
        {live ? (
          <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">LIVE</span>
        ) : (
          <span className="ml-2 text-gray-400">(mid-market rate)</span>
        )}
      </p>
    </div>
  );
}
