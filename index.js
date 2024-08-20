import fs from "fs";
import fetch from "node-fetch";

async function fetchArticles(username) {
  const response = await fetch(`https://dev.to/api/articles?username=${username}`);
  const articles = await response.json();
  return articles;
}

async function fetchGitHubRepos(username) {
  const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
  const repos = await response.json();
  return repos;
}

function formatArticles(articles) {
  return articles.map((article) => `[${article.title}](${article.url}) - ${article.published_at}`).join("\n");
}

function formatRepos(repos) {
  return repos.map((repo) => `[${repo.name}](${repo.html_url}) - ${repo.description || "-"}`).join("\n");
}

async function main() {
  try {
    const [articles, repos] = await Promise.all([fetchArticles("ferryops"), fetchGitHubRepos("ferryops")]);

    const formattedArticles = formatArticles(articles);
    const formattedRepos = formatRepos(repos);
    const now = new Date();
    const formattedDate = now.toLocaleString("id-ID", {
      timeZone: "Asia/Makassar",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour12: false,
    });
    const readmeContent = `
Saya tidak cuma nulis tentang teknologi, tapi juga nulis kode yang bagus dan minim bug
${formattedDate}
| Artikel Terbaru | Projects Terbaru |
|--|--|
${mergeColumns(formattedArticles, formattedRepos)}
`;

    fs.writeFileSync("README.md", readmeContent);

    console.log("README.md berhasil diperbarui.");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
}

function mergeColumns(column1, column2) {
  const lines1 = column1.split("\n");
  const lines2 = column2.split("\n");
  let mergedContent = "";

  for (let i = 0; i < Math.max(lines1.length, lines2.length); i++) {
    const content1 = lines1[i] || "";
    const content2 = lines2[i] || "";
    mergedContent += `| ${content1.trim()} | ${content2.trim()} |\n`;
  }

  return mergedContent;
}

main();
