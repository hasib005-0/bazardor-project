
export type MarketPrice = {
  name: string;
  price: number;
  min?: number;
  max?: number;
  division?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  unit: string;
  price: number;
  previousPrice: number;
  changePercent: number;
  emoji: string;
  description: string;
  markets: MarketPrice[];
  raw: Record<string, unknown>;
};

export type Category = {
  slug: string;
  name: string;
  emoji: string;
};

const BASE = (
  process.env.BAZARDOR_API_URL ||
  "https://api.abcz.workers.dev/api/bazardor"
).replace(/\/+$/, "");

const productEmojis: Record<string, string> = {
  "sorno-machi-chal": "🍚",
  "miniket-chal": "🍚",
  "nazir-chal": "🍚",
  "batash-sweet-chal": "🍚",
  "mosur-dal": "🫘",
  "mug-dal": "🫘",
  "chola": "🫘",
  "peyaj": "🧅",
  "alu": "🥔",
  "rosun": "🧄",
  "ada": "🫚",
  "morich": "🌶️",
  "kacha-morich": "🌶️",
  "begun": "🍆",
  "dherosh": "🥒",
  "tomato": "🍅",
  "dim": "🥚",
  "mach": "🐟",
  "ilish": "🐟",
  "katla-mach": "🐟",
  "mangsho": "🍗",
  "murgi": "🍗",
  "tel": "🫙",
  "chal": "🍚",
  "dal": "🫘",
  "sobji": "🥬",
  "mosla": "🌶️",
};

const categoryEmojis: Record<string, string> = {
  chal: "🍚",
  rice: "🍚",
  dal: "🫘",
  tel: "🫙",
  oil: "🫙",
  sobji: "🥬",
  vegetable: "🥬",
  mach: "🐟",
  fish: "🐟",
  mangsho: "🍗",
  meat: "🍗",
  dim: "🥚",
  egg: "🥚",
  mosla: "🌶️",
  spice: "🌶️",
};

function pick(
  obj: any,
  keys: string[],
  fallback: any = undefined
): any {
  for (const key of keys) {
    if (obj?.[key] !== undefined && obj?.[key] !== null) {
      return obj[key];
    }
  }

  return fallback;
}

function numberValue(value: any): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = String(value ?? "0")
    .replace(/[০-৯]/g, (digit) =>
      String("০১২৩৪৫৬৭৮৯".indexOf(digit))
    )
    .replace(/[^0-9.-]/g, "");

  const result = Number(normalized);

  return Number.isFinite(result) ? result : 0;
}

function unwrap(json: any): any {
  return (
    json?.data ??
    json?.products ??
    json?.categories ??
    json?.result ??
    json
  );
}

function getProductEmoji(product: any, category: string): string {
  const supplied = pick(product, ["emoji", "icon"], "");

  if (typeof supplied === "string" && supplied.trim()) {
    return supplied;
  }

  const slug = String(
    pick(product, ["slug"], "")
  ).toLowerCase();

  const name = String(
    pick(product, ["nameBn", "name", "title"], "")
  );

  if (productEmojis[slug]) {
    return productEmojis[slug];
  }

  // Match product name when the API slug differs.
  if (/চাল/.test(name)) return "🍚";
  if (/ডাল|ছোলা/.test(name)) return "🫘";
  if (/পেঁয়াজ|পেঁয়াজ/.test(name)) return "🧅";
  if (/আলু/.test(name)) return "🥔";
  if (/রসুন/.test(name)) return "🧄";
  if (/আদা/.test(name)) return "🫚";
  if (/মরিচ/.test(name)) return "🌶️";
  if (/বেগুন/.test(name)) return "🍆";
  if (/ঢেঁড়স|ঢেঁড়স/.test(name)) return "🥒";
  if (/টমেটো/.test(name)) return "🍅";
  if (/ডিম/.test(name)) return "🥚";
  if (/মাছ|ইলিশ|কাতলা/.test(name)) return "🐟";
  if (/মুরগি|মাংস/.test(name)) return "🍗";
  if (/তেল/.test(name)) return "🫙";

  const key = category.toLowerCase().replace(/[-_\s]/g, "");

  return categoryEmojis[key] ?? "🛒";
}

export function normalizeProduct(
  product: any,
  index = 0
): Product {
  const category = String(
    pick(
      product,
      [
        "categorySlug",
        "category_slug",
        "category",
        "categoryId",
        "category_id",
      ],
      "other"
    )
  )
    .toLowerCase()
    .replace(/\s+/g, "-");

  const name = String(
    pick(
      product,
      ["nameBn", "name", "title", "productName", "product_name"],
      "পণ্যের নাম পাওয়া যায়নি"
    )
  );

  const price = numberValue(
    pick(
      product,
      ["today", "price", "currentPrice", "current_price", "todayPrice"],
      0
    )
  );

  const previousPrice = numberValue(
    pick(
      product,
      [
        "yesterday",
        "previousPrice",
        "previous_price",
        "yesterdayPrice",
        "oldPrice",
      ],
      price
    )
  );

  const changeData = product?.change;

  let changePercent: number;

  if (changeData && typeof changeData === "object") {
    const percentage = numberValue(changeData.pct);

    changePercent =
      changeData.dir === "down"
        ? -Math.abs(percentage)
        : changeData.dir === "up"
          ? Math.abs(percentage)
          : 0;
  } else {
    const suppliedChange = pick(
      product,
      ["changePercent", "change_percent", "percentageChange"],
      null
    );

    changePercent =
      suppliedChange !== null
        ? numberValue(suppliedChange)
        : previousPrice > 0
          ? ((price - previousPrice) / previousPrice) * 100
          : 0;
  }

  const marketsRaw = pick(
    product,
    ["markets", "marketPrices", "market_prices", "pricesByMarket"],
    []
  );

  const markets: MarketPrice[] = Array.isArray(marketsRaw)
    ? marketsRaw.map((market: any) => ({
        name: String(
          pick(
            market,
            ["market", "name", "bazaar", "bazar"],
            "স্থানীয় বাজার"
          )
        ),
        price: numberValue(
          pick(market, ["today", "price", "currentPrice"], 0)
        ),
        min: numberValue(pick(market, ["min"], 0)),
        max: numberValue(pick(market, ["max"], 0)),
        division: String(pick(market, ["division"], "")),
      }))
    : [];

  const id = String(
    pick(product, ["id", "_id", "slug"], index + 1)
  );

  const slug = String(
    pick(product, ["slug", "id", "_id"], id)
  );

  const categoryName = String(
    pick(
      product,
      ["categoryNameBn", "categoryName", "category_name"],
      category
    )
  );

  const unit = String(
    pick(product, ["unit", "unitName", "unit_name"], "kg")
  );

  const description = String(
    pick(
      product,
      ["description", "summary", "details"],
      `${name} — আজকের বাজারদর ও বাজারভিত্তিক মূল্য তুলনা করুন।`
    )
  );

  return {
    id,
    slug,
    name,
    category,
    categoryName,
    unit,
    price,
    previousPrice,
    changePercent,
    emoji: getProductEmoji(product, category),
    description,
    markets,
    raw: product as Record<string, unknown>,
  };
}

export async function getProducts(
  category?: string
): Promise<Product[]> {
  const url = new URL(`${BASE}/products`);

  if (category) {
    url.searchParams.set("category", category);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Product API failed (${response.status})`);
  }

  const json = await response.json();
  const data = unwrap(json);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : Array.isArray(data?.products)
        ? data.products
        : [];

  return list.map((product: any, index: number) =>
    normalizeProduct(product, index)
  );
}

export async function getProduct(
  slug: string
): Promise<Product | null> {
  const response = await fetch(
    `${BASE}/products/${encodeURIComponent(slug)}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    return null;
  }

  const json = await response.json();
  const data = unwrap(json);

  const product = Array.isArray(data)
    ? data[0]
    : data?.product ?? data?.item ?? data;

  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product)
  ) {
    return null;
  }

  return normalizeProduct(product);
}

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${BASE}/categories`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Category API failed (${response.status})`);
  }

  const json = await response.json();
  const data = unwrap(json);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.items)
      ? data.items
      : [];

  return list.map((category: any) => {
    const slug = String(
      pick(category, ["slug", "id", "_id", "category"], "other")
    ).toLowerCase();

    const name = String(
      pick(
        category,
        ["nameBn", "categoryNameBn", "name", "title", "categoryName"],
        "ক্যাটাগরি"
      )
    );

    return {
      slug,
      name,
      emoji:
        pick(category, ["emoji", "icon"], "") ||
        categoryEmojis[slug] ||
        "🛍️",
    };
  });
}

export function bnNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat("bn-BD", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatMoney(value: number): string {
  return `${bnNumber(value)} টাকা`;
}

export function changeLabel(value: number): string {
  if (Math.abs(value) < 0.05) {
    return "— ০.০%";
  }

  return `${value > 0 ? "▲" : "▼"} ${bnNumber(
    Math.abs(value),
    1
  )}%`;
}
