import { sql } from "./db";
import { deleteFromR2 } from "./r2";

export type Article = {
  id: number;
  number: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string;
  content: string;
  published: boolean;
  created_at: string;
  published_at: string | null;
};

const TABLE = "oc_discussions";

export async function ensureTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS oc_discussions (
      id           SERIAL PRIMARY KEY,
      number       INTEGER NOT NULL DEFAULT 1,
      title        TEXT NOT NULL,
      slug         TEXT NOT NULL UNIQUE,
      excerpt      TEXT NOT NULL DEFAULT '',
      cover_url    TEXT NOT NULL DEFAULT '',
      content      TEXT NOT NULL DEFAULT '',
      published    BOOLEAN NOT NULL DEFAULT false,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ
    )
  `;
}

export async function getPublishedArticles(): Promise<Article[]> {
  try {
    const rows = await sql`
      SELECT * FROM oc_discussions
      WHERE published = true
      ORDER BY number ASC, created_at DESC
    `;
    return rows as Article[];
  } catch {
    return [];
  }
}

export async function getAllArticles(): Promise<Article[]> {
  const rows = await sql`
    SELECT * FROM oc_discussions ORDER BY number ASC, created_at DESC
  `;
  return rows as Article[];
}

export type ArticlesPage = {
  rows: Article[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Server-side paginated articles. `page` is 1-based. */
export async function getArticlesPage(page = 1, pageSize = 10): Promise<ArticlesPage> {
  const safeSize = Math.min(Math.max(1, Math.floor(pageSize)), 100);
  try {
    const countRows = await sql`SELECT COUNT(*)::int AS total FROM oc_discussions`;
    const total = (countRows[0] as { total: number })?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / safeSize));
    const safePage = Math.min(Math.max(1, Math.floor(page)), pageCount);
    const offset = (safePage - 1) * safeSize;
    const rows = await sql`
      SELECT * FROM oc_discussions
      ORDER BY number ASC, created_at DESC
      LIMIT ${safeSize} OFFSET ${offset}
    `;
    return { rows: rows as Article[], total, page: safePage, pageSize: safeSize, pageCount };
  } catch {
    return { rows: [], total: 0, page: 1, pageSize: safeSize, pageCount: 1 };
  }
}

export async function countArticles(): Promise<number> {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oc_discussions`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getArticleById(id: number): Promise<Article | null> {
  const rows = await sql`SELECT * FROM oc_discussions WHERE id = ${id}`;
  return (rows[0] as Article) ?? null;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const rows = await sql`
      SELECT * FROM oc_discussions WHERE slug = ${slug} AND published = true
    `;
    return (rows[0] as Article) ?? null;
  } catch {
    return null;
  }
}

export async function resolveNumberConflict(number: number, excludeId?: number): Promise<void> {
  const conflict = excludeId
    ? await sql`SELECT id FROM oc_discussions WHERE number = ${number} AND id != ${excludeId} LIMIT 1`
    : await sql`SELECT id FROM oc_discussions WHERE number = ${number} LIMIT 1`;

  if (conflict.length === 0) return;

  const maxRows = excludeId
    ? await sql`SELECT COALESCE(MAX(number), 0) AS m FROM oc_discussions WHERE id != ${excludeId}`
    : await sql`SELECT COALESCE(MAX(number), 0) AS m FROM oc_discussions`;

  const next = (maxRows[0] as { m: number }).m + 1;
  await sql`UPDATE oc_discussions SET number = ${next} WHERE id = ${(conflict[0] as { id: number }).id}`;
}

export async function createArticle(data: {
  number: number;
  title: string;
  slug: string;
  excerpt: string;
  cover_url: string;
  content: string;
  published: boolean;
}): Promise<Article> {
  const rows = await sql`
    INSERT INTO oc_discussions (number, title, slug, excerpt, cover_url, content, published, published_at)
    VALUES (
      ${data.number},
      ${data.title},
      ${data.slug},
      ${data.excerpt},
      ${data.cover_url},
      ${data.content},
      ${data.published},
      ${data.published ? new Date().toISOString() : null}
    )
    RETURNING *
  `;
  return rows[0] as Article;
}

export async function updateArticle(
  id: number,
  data: {
    number: number;
    title: string;
    slug: string;
    excerpt: string;
    cover_url: string;
    content: string;
    published: boolean;
  }
): Promise<Article> {
  const existing = await getArticleById(id);
  if (existing?.cover_url && existing.cover_url !== data.cover_url) {
    await deleteFromR2([existing.cover_url]);
  }

  const rows = await sql`
    UPDATE oc_discussions SET
      number       = ${data.number},
      title        = ${data.title},
      slug         = ${data.slug},
      excerpt      = ${data.excerpt},
      cover_url    = ${data.cover_url},
      content      = ${data.content},
      published    = ${data.published},
      published_at = CASE
        WHEN ${data.published} = true AND published_at IS NULL THEN NOW()
        ELSE published_at
      END
    WHERE id = ${id}
    RETURNING *
  `;
  return rows[0] as Article;
}

export async function deleteArticle(id: number): Promise<void> {
  const article = await getArticleById(id);
  await sql`DELETE FROM oc_discussions WHERE id = ${id}`;
  if (article?.cover_url) await deleteFromR2([article.cover_url]);
}

// Keep TABLE export for reference
export { TABLE };
