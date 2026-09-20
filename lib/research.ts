import { webSearch, browseUrl } from "@/lib/web-browser";

export type ResearchSource = {
  title: string;
  url: string;
  snippet: string;
};

export type ResearchReport = {
  query: string;
  answer: string;
  sources: ResearchSource[];
  pagesRead: number;
};

export async function autonomousResearch(query: string): Promise<ResearchReport> {
  const search = await webSearch(query);
  const candidates = search.results
    .filter((r) => /^https?:\/\//i.test(r.url))
    .slice(0, 5);

  const pages = await Promise.all(
    candidates.map(async (source) => {
      try {
        const page = await browseUrl(source.url);
        return {
          title: source.title || page.title,
          url: page.url,
          text: page.text.slice(0, 9000),
        };
      } catch {
        return null;
      }
    })
  );

  const read = pages.filter(Boolean) as Array<{title:string;url:string;text:string}>;
  const combined = read.map((p) =>
    `SOURCE: ${p.title}\nURL: ${p.url}\nCONTENT: ${p.text}`
  ).join("\n\n");

  return {
    query,
    answer: search.answer,
    sources: read.map((p) => ({ title: p.title, url: p.url, snippet: p.text.slice(0, 1200) })),
    pagesRead: read.length,
  };
}

export function researchContext(report: ResearchReport) {
  return report.sources.map((s) =>
    `SOURCE: ${s.title}\nURL: ${s.url}\nCONTENT: ${s.snippet}`
  ).join("\n\n");
}
