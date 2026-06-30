"use client";

import * as React from "react";
import { CopyButton } from "@/components/site/copy-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};

export default function PasswordGenerator() {
  const [length, setLength] = React.useState(16);
  const [lower, setLower] = React.useState(true);
  const [upper, setUpper] = React.useState(true);
  const [digits, setDigits] = React.useState(true);
  const [symbols, setSymbols] = React.useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const ambiguous = new Set("Il1O0o");

  const generate = React.useCallback(() => {
    let pool = "";
    if (lower) pool += SETS.lower;
    if (upper) pool += SETS.upper;
    if (digits) pool += SETS.digits;
    if (symbols) pool += SETS.symbols;
    if (excludeAmbiguous) {
      pool = Array.from(pool)
        .filter((c) => !ambiguous.has(c))
        .join("");
    }
    if (!pool) {
      setPassword("");
      return;
    }
    // Use crypto.getRandomValues for cryptographically secure randomness
    const out: string[] = [];
    const buf = new Uint32Array(length);
    crypto.getRandomValues(buf);
    for (let i = 0; i < length; i++) {
      out.push(pool[buf[i] % pool.length]);
    }
    // Ensure at least one of each enabled set (best effort)
    const enabled = [
      lower ? SETS.lower : "",
      upper ? SETS.upper : "",
      digits ? SETS.digits : "",
      symbols ? SETS.symbols : "",
    ].filter(Boolean);
    if (enabled.length > 0 && length >= enabled.length) {
      enabled.forEach((set, idx) => {
        const filteredSet = excludeAmbiguous
          ? Array.from(set).filter((c) => !ambiguous.has(c)).join("")
          : set;
        if (filteredSet) {
          const r = new Uint32Array(1);
          crypto.getRandomValues(r);
          out[idx] = filteredSet[r[0] % filteredSet.length];
        }
      });
      // Shuffle
      const shuffleBuf = new Uint32Array(out.length);
      crypto.getRandomValues(shuffleBuf);
      for (let i = out.length - 1; i > 0; i--) {
        const j = shuffleBuf[i] % (i + 1);
        [out[i], out[j]] = [out[j], out[i]];
      }
    }
    setPassword(out.join(""));
  }, [length, lower, upper, digits, symbols, excludeAmbiguous]);

  React.useEffect(() => {
    generate();
  }, [generate]);

  const strength = React.useMemo(() => {
    let poolSize = 0;
    if (lower) poolSize += 26;
    if (upper) poolSize += 26;
    if (digits) poolSize += 10;
    if (symbols) poolSize += SETS.symbols.length;
    if (excludeAmbiguous) poolSize -= 6;
    if (poolSize === 0) return { bits: 0, label: "—", color: "muted" };
    const bits = Math.round(length * Math.log2(poolSize));
    let label = "Weak";
    let color = "text-rose-500";
    if (bits >= 128) {
      label = "Excellent";
      color = "text-emerald-500";
    } else if (bits >= 80) {
      label = "Strong";
      color = "text-emerald-500";
    } else if (bits >= 60) {
      label = "Good";
      color = "text-amber-500";
    } else if (bits >= 36) {
      label = "Fair";
      color = "text-amber-500";
    }
    return { bits, label, color };
  }, [length, lower, upper, digits, symbols, excludeAmbiguous]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <code className="flex-1 break-all font-mono text-base sm:text-lg">
            {password || <span className="text-muted-foreground">Select at least one set</span>}
          </code>
          <CopyButton value={password} label="" size="icon" />
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <ShieldCheck className={cn("size-4", strength.color)} />
          <span className={strength.color}>{strength.label}</span>
          <span className="text-muted-foreground">·</span>
          <span className="font-mono text-muted-foreground">{strength.bits} bits of entropy</span>
        </div>
      </div>

      <Button onClick={generate} size="lg" className="w-full">
        <RefreshCw className="size-4" />
        Generate new password
      </Button>

      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Length</Label>
            <span className="font-mono text-sm tabular-nums">{length}</span>
          </div>
          <Slider
            min={4}
            max={64}
            step={1}
            value={[length]}
            onValueChange={(v) => setLength(v[0])}
          />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
            <Checkbox checked={lower} onCheckedChange={(c) => setLower(Boolean(c))} />
            <span>Lowercase a-z</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
            <Checkbox checked={upper} onCheckedChange={(c) => setUpper(Boolean(c))} />
            <span>Uppercase A-Z</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
            <Checkbox checked={digits} onCheckedChange={(c) => setDigits(Boolean(c))} />
            <span>Digits 0-9</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-muted/30">
            <Checkbox checked={symbols} onCheckedChange={(c) => setSymbols(Boolean(c))} />
            <span>Symbols</span>
          </label>
        </div>

        <label className="mt-3 flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm">
          <Checkbox
            checked={excludeAmbiguous}
            onCheckedChange={(c) => setExcludeAmbiguous(Boolean(c))}
          />
          <span>Exclude ambiguous characters (I, l, 1, O, 0, o)</span>
        </label>
      </div>
    </div>
  );
}
