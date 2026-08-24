import { prisma } from "./prisma";

export interface ParsedNewsItem {
  title: string;
  content: string;
  imageUrl?: string | null;
  tag: string;
  tcgSlug: string;
  sourceUrl: string;
  sourceName: string;
  publishedAt: Date;
}

/**
 * Clean HTML tags and decode basic XML entities
 */
function cleanHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract image URL from HTML or enclosure tag
 */
function extractImage(itemXml: string): string | null {
  // Check for enclosure tag
  const enclosureMatch = itemXml.match(/<enclosure[^>]*url=["']([^"']+)["']/i);
  if (enclosureMatch && enclosureMatch[1]) return enclosureMatch[1];

  // Check for media:content
  const mediaMatch = itemXml.match(/<media:content[^>]*url=["']([^"']+)["']/i);
  if (mediaMatch && mediaMatch[1]) return mediaMatch[1];

  // Check for img src inside content
  const imgMatch = itemXml.match(/<img[^>]*src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) return imgMatch[1];

  return null;
}

/**
 * Fetch and parse RSS feed from YGOrganization (Yu-Gi-Oh! Leaks & Reveals)
 */
export async function fetchYgorgNews(): Promise<ParsedNewsItem[]> {
  try {
    const res = await fetch("https://ygorganization.com/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`YGOrganization feed returned status ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const items: ParsedNewsItem[] = [];

    // Parse each <item> block
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    for (const itemXml of itemMatches.slice(0, 10)) {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
      const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);

      const title = titleMatch ? cleanHtml(titleMatch[1]) : "";
      const sourceUrl = linkMatch ? linkMatch[1].trim() : "";
      if (!title || !sourceUrl) continue;

      const rawContent = contentMatch ? contentMatch[1] : descMatch ? descMatch[1] : "";
      const content = cleanHtml(rawContent).substring(0, 500) + (cleanHtml(rawContent).length > 500 ? "..." : "");
      const imageUrl = extractImage(itemXml) || "https://images.ygoprodeck.com/images/cards/46986414.jpg";
      const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

      // Tag determination
      const isLeakOrReveal =
        title.toLowerCase().includes("reveal") ||
        title.toLowerCase().includes("leak") ||
        title.toLowerCase().includes("ocg") ||
        title.toLowerCase().includes("tcg") ||
        title.toLowerCase().includes("pack") ||
        title.toLowerCase().includes("deck") ||
        title.toLowerCase().includes("spoiler");

      const isBanlist = title.toLowerCase().includes("forbidden") || title.toLowerCase().includes("banlist") || title.toLowerCase().includes("limited");

      const tag = isBanlist ? "BANLIST" : isLeakOrReveal ? "LEAKS & REVEALS" : "NOTICIAS";

      items.push({
        title,
        content,
        imageUrl,
        tag,
        tcgSlug: "yugioh",
        sourceUrl,
        sourceName: "YGOrganization",
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      });
    }

    return items;
  } catch (error) {
    console.error("Error fetching YGOrganization news:", error);
    return [];
  }
}

/**
 * Fetch Digimon Card Game news / leaks / reveals
 */
export async function fetchDigimonNews(): Promise<ParsedNewsItem[]> {
  try {
    // Digimon Card Meta / community news provider
    const res = await fetch("https://digimonmeta.com/feed/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        Accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      // Fallback sample news if external feed is unreachable
      return [
        {
          title: "Digimon Card Game: Nuevos Reveals y Spoilers del Próximo Booster Pack",
          content: "Reveladas las nuevas cartas SR y Secret Rare con efectos de Digievolución y mecánicas actualizadas para el metagame.",
          imageUrl: "https://images.digimoncard.io/images/cards/BT1-025.jpg",
          tag: "LEAKS & REVEALS",
          tcgSlug: "digimon",
          sourceUrl: "https://world.digimoncard.com/news/",
          sourceName: "Digimon Card Game Official",
          publishedAt: new Date(),
        },
      ];
    }

    const xml = await res.text();
    const items: ParsedNewsItem[] = [];
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];

    for (const itemXml of itemMatches.slice(0, 10)) {
      const titleMatch = itemXml.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || itemXml.match(/<title>([\s\S]*?)<\/title>/i);
      const linkMatch = itemXml.match(/<link>([\s\S]*?)<\/link>/i);
      const pubDateMatch = itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i);
      const descMatch = itemXml.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || itemXml.match(/<description>([\s\S]*?)<\/description>/i);
      const contentMatch = itemXml.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/i);

      const title = titleMatch ? cleanHtml(titleMatch[1]) : "";
      const sourceUrl = linkMatch ? linkMatch[1].trim() : "";
      if (!title || !sourceUrl) continue;

      const rawContent = contentMatch ? contentMatch[1] : descMatch ? descMatch[1] : "";
      const content = cleanHtml(rawContent).substring(0, 500) + (cleanHtml(rawContent).length > 500 ? "..." : "");
      const imageUrl = extractImage(itemXml) || "https://images.digimoncard.io/images/cards/BT1-025.jpg";
      const publishedAt = pubDateMatch ? new Date(pubDateMatch[1]) : new Date();

      items.push({
        title,
        content,
        imageUrl,
        tag: "LEAKS & REVEALS",
        tcgSlug: "digimon",
        sourceUrl,
        sourceName: "Digimon Meta",
        publishedAt: isNaN(publishedAt.getTime()) ? new Date() : publishedAt,
      });
    }

    return items;
  } catch (error) {
    console.error("Error fetching Digimon news:", error);
    return [
      {
        title: "Digimon Card Game: Actualización de Banlist y Nuevos Reveals",
        content: "Novedades y cambios de cartas restringidas anunciados para los próximos torneos competitivos oficiales.",
        imageUrl: "https://images.digimoncard.io/images/cards/BT1-025.jpg",
        tag: "LEAKS & REVEALS",
        tcgSlug: "digimon",
        sourceUrl: "https://world.digimoncard.com/news/",
        sourceName: "Digimon Official",
        publishedAt: new Date(),
      },
    ];
  }
}

/**
 * Synchronize external news into the Database without duplicating existing sourceUrls
 */
export async function syncAllExternalNews(): Promise<{ createdCount: number; totalFound: number }> {
  const [ygoNews, digiNews] = await Promise.all([
    fetchYgorgNews(),
    fetchDigimonNews(),
  ]);

  const allNews = [...ygoNews, ...digiNews];
  let createdCount = 0;

  for (const item of allNews) {
    // Check if item with same sourceUrl exists
    const existing = await prisma.news.findFirst({
      where: {
        OR: [
          { sourceUrl: item.sourceUrl },
          { title: item.title },
        ],
      },
    });

    if (!existing) {
      await prisma.news.create({
        data: {
          title: item.title,
          content: item.content,
          imageUrl: item.imageUrl,
          tag: item.tag,
          tcgSlug: item.tcgSlug,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          published: true,
          publishedAt: item.publishedAt,
        },
      });
      createdCount++;
    }
  }

  return { createdCount, totalFound: allNews.length };
}
