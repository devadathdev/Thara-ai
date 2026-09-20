import dns from "node:dns/promises";
import net from "node:net";

const MAX_TEXT = 30000;
const MAX_URL = 2048;

function isPrivateIp(ip: string) {
  if (net.isIPv4(ip)) {
    const [a,b] = ip.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  }
  return ip === "::1" || ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80:");
}

async function assertSafeUrl(raw: string) {
  if (raw.length > MAX_URL) throw new Error("URL too long");
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only HTTP(S) URLs are supported");
  if (url.username || url.password) throw new Error("Credential URLs are not allowed");
  const addresses = await dns.lookup(url.hostname, { all: true });
  if (!addresses.length || addresses.some((x) => isPrivateIp(x.address))) {
    throw new Error("Private or local network targets are blocked");
  }
  return url;
}

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

export async function browseUrl(rawUrl: string) {
  const url = await assertSafeUrl(rawUrl);
  const response = await fetch(url, {
    redirect: "manual",
    headers: { "User-Agent": "THARA-Companion/1.0 (+web browsing)" },
    signal: AbortSignal.timeout(12000),
  });

  if ([301,302,303,307,308].includes(response.status)) {
    const location = response.headers.get("location");
    if (!location) throw new Error("Redirect without location");
    const next = new URL(location, url).toString();
    const safeNext = await assertSafeUrl(next);
    const redirected = await fetch(safeNext, {
      headers: { "User-Agent": "THARA-Companion/1.0 (+web browsing)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!redirected.ok) throw new Error(`Page returned HTTP ${redirected.status}`);
    return { url: safeNext.toString(), title: safeNext.hostname, text: stripHtml(await redirected.text()) };
  }

  if (!response.ok) throw new Error(`Page returned HTTP ${response.status}`);
  return {
    url: url.toString(),
    title: response.headers.get("content-type") || url.hostname,
    text: stripHtml(await response.text()),
  };
}

export async function webSearch(query: string) {
  if (!process.env.TAVILY_API_KEY) throw new Error("TAVILY_API_KEY is not configured");
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query: query.slice(0, 2000),
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error("Web search provider unavailable");
  const data = await response.json();
  return {
    answer: typeof data.answer === "string" ? data.answer : "",
    results: Array.isArray(data.results) ? data.results.slice(0,8).map((r:any)=>({
      title: String(r.title || ""),
      url: String(r.url || ""),
      snippet: String(r.content || "").slice(0,1200),
      score: Number(r.score || 0),
    })) : [],
  };
}
