import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { markdown } from 'markdown';
import Handlebars from 'handlebars';

// Build our HTML pages.
buildHtmlFromMarkdown('index');
buildHtmlFromMarkdown('404');

// Copy the CSS.
copyFileSync('src/styles.css', 'dist/styles.css');

function buildHtmlFromMarkdown(fileName) {
  // Load the page contents.
  const pageContent = readFileSync(`src/${fileName}.md`, 'utf8');

  // Load the html template.
  const template = Handlebars.compile(readFileSync('src/template.hbs', 'utf8'));

  // Generate the html.
  writeFileSync(`dist/${fileName}.html`, template({ content: markdown.toHTML(pageContent) }));
}
