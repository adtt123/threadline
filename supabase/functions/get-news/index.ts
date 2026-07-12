// Supabase Edge Function: get-news
// Pulls headlines directly from established news organizations' own public RSS feeds
// (no third-party news API, no API key, no cost). Pulling straight from the source
// avoids the extra re-editorializing layer that news-aggregator APIs can introduce.
//
// Feeds included: BBC Business, BBC Technology, NPR Business, CNBC Top News, MarketWatch.
// Note: no free public feed exists specifically for "BPO industry" news — these feeds
// cover general business, tech, markets, and company news, which is the closest realistic
// free coverage available. You can add/remove feed URLs in the FEEDS list below anytime.

const FEEDS = [
  { url: "http://feeds.bbci.co.uk/news/business/rss.xml", source: "BBC Business" },
  { url: "http://feeds.bbci.co.uk/news/technology/rss.xml", source: "BBC Technology" },
  { url: "https://feeds.npr.org/1006/rss.xml", source: "NPR Business" },
  { url: "https://www.cnbc.com/id/100003114/device/rss/rss.html", source: "CNBC" },
  { url: "http://feeds.marketwatch.com/marketwatch/topstories/", source: "MarketWatch" },
];

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .trim();
}

function parseRss(xml, source) {
  const items = [];
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/g) || [];
  for (const raw of itemMatches.slice(0, 8)) {
    const title = raw.match(/<title>([\s\S]*?)<\/title>/)?.[1];
    const link = raw.match(/<link>([\s\S]*?)<\/link>/)?.[1];
    const pubDate = raw.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1];
    if (title && link) {
      items.push({
        title: decodeEntities(title),
        link: decodeEntities(link),
        pubDate: pubDate ? new Date(pubDate).toISOString() : null,
        source,
      });
    }
  }
  return items;
}

Deno.serve(async (_req) => {
  try {
    const results = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ThreadlineApp/1.0)" },
        });
        const xml = await res.text();
        return parseRss(xml, feed.source);
      })
    );

    let articles = [];
    for (const r of results) {
      if (r.status === "fulfilled") articles = articles.concat(r.value);
    }

    // Newest first
    articles.sort((a, b) => new Date(b.pubDate || 0) - new Date(a.pubDate || 0));

    return new Response(JSON.stringify({ articles: articles.slice(0, 30) }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
