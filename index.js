// index.js
import fs from "fs";
import fetch from "node-fetch";

/** ====== CONFIG ====== */
const GITHUB_USERNAME = "ferryops";
const DEVTO_USERNAME = "ferryops";
const MAX_ARTICLES = 6;
const MAX_REPOS = 6;
const TIMEZONE = "Asia/Makassar";
const EMAIL = "ferry.a.febian@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/ferry-ananda-febian";
const PORTFOLIO = "https://ferryops.vercel.app";

/** ====== FETCHERS ====== */
async function fetchArticles(username) {
  try {
    const res = await fetch(`https://dev.to/api/articles?username=${username}&per_page=10`);
    if (!res.ok) throw new Error(`Dev.to responded with ${res.status}`);
    const articles = await res.json();
    // filter out boost/empty title articles
    return Array.isArray(articles)
      ? articles.filter((a) => a.title && !a.title.startsWith("[Boost]"))
      : [];
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return [];
  }
}

async function fetchGitHubRepos(username) {
  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=updated&per_page=100`,
      { headers: { Accept: "application/vnd.github+json" } }
    );
    if (!res.ok) throw new Error(`GitHub responded with ${res.status}`);
    const repos = await res.json();
    return Array.isArray(repos)
      ? repos.filter((r) => !r.fork && r.name !== username) // exclude forks and profile repo itself
      : [];
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return [];
  }
}

/** ====== FORMATTERS ====== */
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
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
  return String(str).replace(/\|/g, "\\|");
}

function formatArticles(articles) {
  return articles
    .slice(0, MAX_ARTICLES)
    .map((a) => `- [${a.title}](${a.url}) — ${fmtDate(a.published_at)}`)
    .join("\n");
}

function formatRepos(repos) {
  return repos
    .slice(0, MAX_REPOS)
    .map((r) => `| [**${r.name}**](${r.html_url}) | ${escapePipes(r.description) || "—"} |`)
    .join("\n");
}

/** ====== TEMPLATE ====== */
function buildReadme({ formattedArticles, formattedRepos, formattedDate }) {
  const stacks = [
    "`JavaScript`",
    "`TypeScript`",
    "`Node.js`",
    "`React`",
    "`Next.js`",
    "`PostgreSQL`",
    "`Docker`",
    "`Kubernetes`",
    "`CI/CD`",
  ].join(" · ");

  return `# Hi, I'm Ferry 👋

**Technical Lead & Full Stack Engineer** based in Balikpapan, East Kalimantan, Indonesia.

I build scalable, reliable end-to-end systems for the mining and enterprise technology ecosystem.  
Currently leading engineering at **Minergo Systems** — owning technical direction, system architecture, and delivery quality.

**Stack:** ${stacks}

---

### 🧭 What I Do

- 🏗️ Design resilient system architecture and REST APIs that handle thousands of daily transactions.
- ⛏️ Build **Fleet & Hauling Management Systems** integrating real-time tracking, IoT, and telematics.
- 🚀 Automate CI/CD pipelines and improve deployment reliability.
- 🧑‍🏫 Mentor engineers, run code reviews, and define engineering standards.
- 🔗 Integrate third-party and legacy systems without disrupting existing workflows.

---

### 🛠️ Selected Projects

| Project | Stack |
|---|---|
| **Famous** — Fleet & Hauling Management System | Express.js · React · MariaDB · IoT |
| **MHaulProX v2** — Next-gen Hauling Platform | Express.js · React · PostgreSQL · AI/ML |
| **Digital Platforms** for Mining Industry | Next.js · TypeScript · Payload CMS · PHP |

---

### 📝 Latest Articles

${formattedArticles || "_No articles found._"}

---

### 🔭 Recent Repositories

| Repository | Description |
|---|---|
${formattedRepos || "| — | — |"}

---

### 📊 Stats

![GitHub Stats](https://github-readme-stats.vercel.app/api?bg_color=0000&title_color=4C71F1&text_color=8A919F&line_height=24&border_color=8884&username=${GITHUB_USERNAME}&hide=contribs&show_icons=true&count_private=true&theme=vue)
![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?bg_color=0000&title_color=4C71F1&text_color=8A919F&card_width=240&border_color=8884&username=${GITHUB_USERNAME}&layout=compact&theme=vue)

---

### 📬 Connect

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ferry%20Ananda%20Febian-0A66C2?logo=linkedin)](${LINKEDIN})
[![Portfolio](https://img.shields.io/badge/Portfolio-ferryops.vercel.app-4C71F1)](${PORTFOLIO})
[![Dev.to](https://img.shields.io/badge/Blog-dev.to%2Fferryops-0A0A0A?logo=devdotto)](https://dev.to/${DEVTO_USERNAME})
[![Email](https://img.shields.io/badge/Email-ferry.a.febian%40gmail.com-EA4335?logo=gmail)](mailto:${EMAIL})

> Last updated: **${formattedDate}** (${TIMEZONE})
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

    const formattedDate = new Date().toLocaleDateString("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const readmeContent = buildReadme({ formattedArticles, formattedRepos, formattedDate });
    fs.writeFileSync("README.md", readmeContent, "utf8");
    console.log("README.md updated successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
    process.exitCode = 1;
  }
}

main();
