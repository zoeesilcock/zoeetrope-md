import fs, { readFileSync, writeFileSync, copyFileSync } from "fs";
import markdownit from "markdown-it";
import Handlebars from "handlebars";

const md = markdownit({
  html: true,
  typographer: true,
});

// Create output directories.
if (!fs.existsSync("dist")) {
  fs.mkdirSync("dist");
}
if (!fs.existsSync("dist/posts")) {
  fs.mkdirSync("dist/posts");
}

// Load the templates.
const pageTemplate = Handlebars.compile(
  readFileSync("src/template.hbs", "utf8"),
  { noEscape: true },
);
const indexTemplate = Handlebars.compile(
  readFileSync("src/index.hbs", "utf8"),
  { noEscape: true },
);
const postsTemplate = Handlebars.compile(
  readFileSync("src/posts.hbs", "utf8"),
  { noEscape: true },
);

// Load the CSS styles.
const styles = readFileSync(`src/styles.css`, "utf8");

// Build our HTML pages.
await buildIndexPage("index");
await buildPostsPage("posts");
await buildPostPages();
buildSimplePage("about");
buildSimplePage("reddit-hover-text-privacy-policy");
buildSimplePage("404");

async function buildIndexPage(fileName) {
  const markdownContent1 = readFileSync(`src/index_part1.md`, "utf8");
  const markdownContent2 = readFileSync(`src/index_part2.md`, "utf8");

  const content = indexTemplate({
    content1: md.render(markdownContent1),
    latestPosts: await renderPostList(3, "h2"),
    content2: md.render(markdownContent2),
  });

  buildHtmlFromMarkdown(fileName, content);
}

function buildSimplePage(fileName) {
  const markdown = readFileSync(`src/${fileName}.md`, "utf8");
  buildHtmlFromMarkdown(fileName, md.render(markdown));
}

function buildHtmlFromMarkdown(fileName, content) {
  writeFileSync(`dist/${fileName}.html`, pageTemplate({ styles, content }));
}

// Posts.
async function buildPostsPage(fileName) {
  const content = await renderPostList();
  buildHtmlFromMarkdown(fileName, md.render(content));
}

async function buildPostPages(fileName) {
  const dir = await fs.promises.opendir("src/posts");
  for await (const item of dir) {
    const markdown = readFileSync(`${item.parentPath}/${item.name}`, "utf8");
    const postName = getPostNameFromFileName(item.name);
    buildHtmlFromMarkdown(`posts/${postName}`, md.render(markdown));
  }
}

function getPostNameFromFileName(fileName) {
  return fileName
    .replace(/^[0-9]+_/, "") // Remove prefix.
    .replace(/\.[a-z]+$/, ""); // Remove extension.
}

async function getPosts(limit) {
  const posts = [];

  const dir = await fs.promises.opendir("src/posts");
  for await (const item of dir) {
    const markdown = readFileSync(`${item.parentPath}/${item.name}`, "utf8");
    const tokens = md.parse(markdown).filter((t) => t.type == "inline");
    const postName = getPostNameFromFileName(item.name);

    posts.push({
      order: item.name,
      title: tokens[0].content,
      date: tokens[1].content,
      intro: tokens[2].content,
      url: `/posts/${postName}`,
    });
  }

  // Sort by file name, descending, and limit.
  return posts.sort((a, b) => b.order.localeCompare(a.order)).slice(0, limit);
}

async function renderPostList(limit, heading) {
  const posts = await getPosts(limit);

  let content = "";
  if (posts && posts.length > 0) {
    content = postsTemplate({ posts, heading: heading || "h1" });
  }

  return content;
}
