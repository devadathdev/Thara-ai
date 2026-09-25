"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { signInAnonymously } from "firebase/auth";

type Status = {
  configured: boolean;
  renderer: string | null;
  ciRenderer: string;
};

export default function ArchitecturePage() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    (async () => {
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      const token = await user.getIdToken();
      const response = await fetch("/api/archify", {
        headers: { authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data.runtime);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#020817] px-4 py-6 text-[#E8F7FF] md:px-8">
      <section className="mx-auto max-w-[1500px]">
        <div className="glass rounded-[28px] p-6">
          <div className="text-[9px] tracking-[.42em] text-[#63D8FF]">THARA // ARCHIFY</div>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-[-.05em] text-white">ARCHITECTURE FABRIC</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Interactive architecture visualization powered by Archify. THARA keeps the diagram source in version control and renders a checked artifact through CI.
              </p>
            </div>
            <div className="rounded-xl border border-[#39B9FF]/20 bg-[#168CFF]/10 px-4 py-3 text-[9px] text-[#63D8FF]">
              {status?.configured ? "LOCAL RENDERER ONLINE" : "CI RENDERER READY"}
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            ["ARCHITECTURE", "THARA system topology"],
            ["WORKFLOW", "Agent / approval flows"],
            ["SEQUENCE", "API and tool call chains"],
          ].map(([title, body]) => (
            <div key={title} className="glass rounded-2xl p-5">
              <div className="text-[10px] tracking-[.25em] text-[#63D8FF]">{title}</div>
              <div className="mt-2 text-xs text-white/45">{body}</div>
            </div>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-[28px] border border-[#63D8FF]/10 bg-black/30">
          <iframe
            title="THARA Archify architecture"
            src="/archify/thara-architecture.html"
            className="h-[760px] w-full"
          />
          <div className="border-t border-white/10 px-5 py-3 text-[8px] text-white/30">
            The embedded artifact is generated from the checked JSON specification. It does not represent live infrastructure or grant execution authority.
          </div>
        </div>
      </section>
    </main>
  );
}
