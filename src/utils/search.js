import { Product } from "../models/Product.js";

const searchWords = (s) =>
  String(s || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

const allowedTypos = (len) => (len <= 3 ? 0 : len <= 5 ? 1 : 2);

const levenshtein = (a, b) => {
  a = String(a || "");
  b = String(b || "");
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
};

const prepareProduct = (p) => {
  const name = String(p.name || "").toLowerCase();
  const category = String(p.category || "").toLowerCase();
  const cuisine = String(p.cuisine || "").toLowerCase();
  const tags = (Array.isArray(p.tags) ? p.tags : []).map((t) =>
    String(t).toLowerCase()
  );
  const ingredients = (Array.isArray(p.ingredients) ? p.ingredients : []).map(
    (t) => String(t).toLowerCase()
  );
  const description = String(p.description || "").toLowerCase();

  return {
    name,
    nameWords: searchWords(name),
    category,
    cuisine,
    tags,
    ingredients,
    description,
    fuzzyWords: [
      ...searchWords(name),
      ...searchWords(category),
      ...searchWords(cuisine),
      ...tags.flatMap(searchWords),
      ...ingredients.flatMap(searchWords),
    ],
  };
};

const scoreToken = (token, f) => {
  if (f.nameWords.some((w) => w.startsWith(token))) return { score: 12 };
  if (f.name.includes(token)) return { score: 9 };
  if (
    f.category.includes(token) ||
    f.cuisine.includes(token) ||
    f.tags.some((t) => t.includes(token))
  )
    return { score: 7 };
  if (f.ingredients.some((i) => i.includes(token))) return { score: 5 };
  if (f.description.includes(token)) return { score: 3 };

  const maxDist = allowedTypos(token.length);
  if (maxDist > 0) {
    let best = Infinity;
    for (const w of f.fuzzyWords) {
      if (Math.abs(w.length - token.length) > maxDist) continue;
      const d = levenshtein(token, w);
      if (d < best) best = d;
    }
    if (best <= maxDist) return { score: 4 - best, fuzzy: true };
  }
  return { score: 0 };
};

export const keywordSearch = async (q, { limit = 20, mapFn = (d) => d } = {}) => {
  const query = String(q || "").trim();
  if (!query) return { query: "", count: 0, fuzzy: false, results: [] };

  const tokens = searchWords(query);
  if (tokens.length === 0)
    return { query, count: 0, fuzzy: false, results: [] };

  const qLower = query.toLowerCase();
  const all = await Product.find().lean();
  const matched = [];

  for (const doc of all) {
    const f = prepareProduct(doc);
    let total = 0;
    let usedFuzzy = false;
    let ok = true;

    for (const token of tokens) {
      const r = scoreToken(token, f);
      if (r.score <= 0) {
        ok = false;
        break;
      }
      total += r.score;
      if (r.fuzzy) usedFuzzy = true;
    }
    if (!ok) continue;

    if (f.name.includes(qLower)) total += 5;
    matched.push({ doc, score: total, fuzzy: usedFuzzy });
  }

  matched.sort(
    (a, b) => b.score - a.score || (b.doc.sold || 0) - (a.doc.sold || 0)
  );

  const results = matched.slice(0, limit).map((m) => mapFn(m.doc));

  return {
    query,
    count: results.length,
    fuzzy: matched.length > 0 && matched.every((m) => m.fuzzy),
    results,
  };
};

export { levenshtein, searchWords };