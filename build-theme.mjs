/* ============================================================
   Sports.Cars — static → WordPress theme builder
   ------------------------------------------------------------
   Ports the Concept #3 static pages into classic-theme templates.
   Slices each page's content out from between the shared nav and
   footer (single-sourced in the theme's header.php/footer.php),
   rewrites asset paths to the theme URI and .html links to WP
   permalinks, and wraps with get_header()/get_footer().

   Re-runnable: `node build-theme.mjs`. Source of truth stays the
   static HTML in the repo root, so this doubles as the mapping
   doc for the GitHub → WP Engine deploy step.
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";

const THEME = "theme/sportscars";
mkdirSync(THEME, { recursive: true });

// Emit taxonomy.json from the single-source JS taxonomy so the PHP proxy and
// the browser share identical make/model/generation/hp data.
const require = createRequire(import.meta.url);
const TAX = require("./assets/data/taxonomy.js");
mkdirSync(`${THEME}/assets/data`, { recursive: true });
writeFileSync(
  `${THEME}/assets/data/taxonomy.json`,
  JSON.stringify({ currentYear: TAX.currentYear, makes: TAX.data.makes }, null, 2)
);
console.log(`✓ ${THEME}/assets/data/taxonomy.json (${TAX.rows.length} generations)`);

// source html → output template (front-page.php for home, page-<slug>.php else)
const PAGES = [
  { src: "index.html",     out: "front-page.php", name: "Home" },
  { src: "search.html",    out: "page-search.php", name: "Search" },
  { src: "listing.html",   out: "page-listing.php", name: "Listing" },
  { src: "sell.html",      out: "page-sell.php", name: "Sell" },
  { src: "dealers.html",   out: "page-dealers.php", name: "Dealers" },
  { src: "resources.html", out: "page-resources.php", name: "Journal" },
  { src: "company.html",   out: "page-company.php", name: "Company" },
];

function extractContent(html, src) {
  // Content = everything between the end of the nav header and the footer.
  const afterHeader = html.indexOf("</header>");
  const footerStart = html.indexOf('<footer class="c3-footer"');
  if (afterHeader === -1 || footerStart === -1) {
    throw new Error(`${src}: could not find nav </header> or c3-footer boundaries`);
  }
  return html.slice(afterHeader + "</header>".length, footerStart).trim();
}

function rewrite(content) {
  let c = content;
  // asset paths → theme URI
  c = c.replace(/(src|href)="assets\//g, '$1="<?php echo SC_URI; ?>/assets/');
  // home
  c = c.replace(/(href|action)="index\.html"/g, '$1="<?php echo esc_url( home_url( \'/\' ) ); ?>"');
  // other .html links → /slug/ permalinks, preserving ?query and #anchor
  c = c.replace(/(href|action)="([\w-]+)\.html(\?[^"#]*)?(#[^"]*)?"/g,
    (_m, attr, slug, query, anchor) =>
      `${attr}="<?php echo esc_url( home_url( '/${slug}/' ) ); ?>${query || ""}${anchor || ""}"`);
  return c;
}

function wrap(name, out, content) {
  const isFront = out === "front-page.php";
  const tplHeader = isFront ? "" : `/**\n * Template Name: ${name}\n * @package sportscars\n */\n`;
  return `<?php\n${tplHeader ? tplHeader : `/**\n * ${name}\n * @package sportscars\n */\n`}get_header();\n?>\n${content}\n<?php get_footer();\n`;
}

for (const p of PAGES) {
  const html = readFileSync(p.src, "utf8");
  const content = rewrite(extractContent(html, p.src));
  writeFileSync(`${THEME}/${p.out}`, wrap(p.name, p.out, content));
  console.log(`✓ ${p.src} → ${THEME}/${p.out} (${content.length} bytes)`);
}

// index.php fallback → same as front page content is not guaranteed; use a
// minimal loop-free fallback that just loads the front page look via home.
writeFileSync(`${THEME}/index.php`,
  `<?php\n/**\n * Fallback template.\n * @package sportscars\n */\nget_header();\n?>\n<main class="c3-section"><div class="c3__container"><h1 class="c3-h2"><?php echo esc_html( get_the_title() ?: 'Sports.Cars' ); ?></h1></div></main>\n<?php get_footer();\n`);
console.log(`✓ ${THEME}/index.php (fallback)`);
