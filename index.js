// index.js
import fs from "fs";
import fetch from "node-fetch";

/** ====== CONFIG ====== */
const GITHUB_USERNAME = "ferryops";
const DEVTO_USERNAME = "ferryops";
const MAX_ITEMS = 8; // batasi jumlah item supaya rapi
const TIMEZONE = "Asia/Makassar";

/** ====== FETCHERS ====== */
async function fetchArticles(username) {
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${username}`);
    if (!res.ok) throw new Error(`Dev.to ${res.status}`);
    const articles = await res.json();
    return Array.isArray(articles) ? articles : [];
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil artikel:", error);
    return [];
  }
}

async function fetchGitHubRepos(username) {
  try {
    // sort=updated untuk yang paling baru disentuh
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`
    );
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const repos = await res.json();
    return Array.isArray(repos) ? repos : [];
  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil repositori:", error);
    return [];
  }
}

/** ====== FORMATTERS ====== */
function fmtDateISOToLocal(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function escapePipes(str = "") {
  // agar deskripsi repo tidak merusak tabel markdown
  return String(str).replace(/\|/g, "\\|");
}

function formatArticles(articles) {
  return articles
    .slice(0, MAX_ITEMS)
    .map(
      (a) => `- [${a.title}](${a.url}) • ${fmtDateISOToLocal(a.published_at)}`
    )
    .join("\n");
}

function formatRepos(repos) {
  return repos
    .slice(0, MAX_ITEMS)
    .map(
      (r) => `[${r.name}](${r.html_url}) — ${escapePipes(r.description) || "-"}`
    )
    .join("\n");
}

function mergeColumns(column1, column2) {
  const lines1 = (column1 || "").split("\n").filter(Boolean);
  const lines2 = (column2 || "").split("\n").filter(Boolean);
  const max = Math.max(lines1.length, lines2.length) || 1;
  let merged = "";

  for (let i = 0; i < max; i++) {
    const c1 = lines1[i] || "";
    const c2 = lines2[i] || "";
    merged += `| ${c1} | ${c2} |\n`;
  }
  return merged;
}

/** ====== TEMPLATE ====== */
function buildReadme({ formattedArticles, formattedRepos, formattedDate }) {
  // deskripsi yang menekankan "penyelesaian solusi"
  const headline =
    "Suka ngerjain **solusi yang jalan cepat ke produksi, gampang dirawat,** dan pastinya **ngasih dampak nyata**, bukan cuma nambah baris kode doang. 🚀";

  const bio = [
    "Saya seorang **Full-stack Developer** dan **freelancer**.",
    "Udah biasa bikin produk dari nol sampe live, dari mikirin arsitektur sampai deploy.",
    "Intinya, saya suka ngeubah ide jadi solusi yang bener-bener kepake",
  ].join(" ");

  const stacks = [
    "`React`",
    "`Next.js`",
    "`Express`",
    "`Node.js`",
    "`TypeScript`",
    "`REST`/`GraphQL`",
    "`CI/CD` (GitHub Actions, Vercel, Docker)",
  ].join(" · ");

  const valueProps = [
    "🔧 End-to-end delivery: dari arsitektur, implementasi, hingga deployment.",
    "🧹 Kualitas: codebase bersih, minim bug, dan observability sejak awal.",
    "⚡ Kecepatan: iterasi cepat tanpa mengorbankan maintainability.",
  ]
    .map((v) => `- ${v}`)
    .join("\n");

  return `# 👋 Halo, saya Ferry

${headline}

${bio}

**Tech yang sering saya dipake:** ${stacks}

${valueProps}

[![Contact Badge](https://img.shields.io/badge/Hire%20Me-Freelance-informational)](mailto:ferryops@gmail.com)
[![Blog Badge](https://img.shields.io/badge/Blog-active-blue)](https://dev.to/${DEVTO_USERNAME})
[![GitHub Followers](https://img.shields.io/github/followers/${GITHUB_USERNAME}?style=social)](https://github.com/${GITHUB_USERNAME})

---

### 🚀 Highlights
- Suka scroll grup facebook **Ingin Menjadi Programmer Handal, Namun Enggan Ngoding** buat cari inspirasi dan berbagi ilmu.
- Rajin nulis soal software engineering & cerita-cerita praktik di lapangan.
- Fokus di **hasil nyata**: cepat dirilis, stabil, gampang diskalakan.

### 📝 Artikel Terbaru
${formattedArticles || "_Belum ada artikel terbaru yang ditampilkan._"}

### 🧩 Projects Terbaru
| Artikel | Repositori |
|--|--|
${mergeColumns(formattedArticles, formattedRepos)}

---

### 📊 Stats
![Github Stats](https://github-readme-stats.vercel.app/api?bg_color=0000&title_color=4C71F1&text_color=8A919F&line_height=24&border_color=8884&username=${GITHUB_USERNAME}&hide=contribs&show_icons=true&count_private=true&theme=vue)
![Top Langs](https://github-readme-stats.vercel.app/api/top-langs/?bg_color=0000&title_color=4C71F1&text_color=8A919F&card_width=240&border_color=8884&username=${GITHUB_USERNAME}&layout=compact&theme=vue)

> Terakhir diperbarui: **${formattedDate}** (${TIMEZONE})

`;
}

/** ====== MAIN ====== */
async function main() {
  try {
    const [articles, repos] = await Promise.all([
      fetchArticles(DEVTO_USERNAME),
      fetchGitHubRepos(GITHUB_USERNAME),
    ]);

    const formattedArticles = formatArticles(articles);
    const formattedRepos = formatRepos(repos);

    const now = new Date();
    const formattedDate = now.toLocaleString("id-ID", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const readmeContent = buildReadme({
      formattedArticles,
      formattedRepos,
      formattedDate,
    });
    fs.writeFileSync("README.md", readmeContent, "utf8");
    console.log("README.md berhasil diperbarui.");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    process.exitCode = 1;
  }
}

main();
