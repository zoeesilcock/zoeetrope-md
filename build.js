import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import markdownit from 'markdown-it';
import Handlebars from 'handlebars';

const md = markdownit({
  html: true,
  typographer: true
});

// Load the main template.
const pageTemplate = Handlebars.compile(readFileSync('src/template.hbs', 'utf8'), { noEscape: true });

// Load the CSS styles.
const css = readFileSync(`src/styles.css`, 'utf8');
const styles = Handlebars.compile('{{{css}}}')({ css });

// Register the handlebars partials.
Handlebars.registerPartial('styles', '{{styles}}');
Handlebars.registerPartial('content', '{{content}}');

// Build our HTML pages.
buildHtmlFromMarkdown('index');
buildHtmlFromMarkdown('404');

function buildHtmlFromMarkdown(fileName) {
  // Load the page contents.
  const markdownContent = readFileSync(`src/${fileName}.md`, 'utf8');

  // Render the markdown into a handlebars template.
  const content = Handlebars.compile('{{{html}}}')({ html: md.render(markdownContent) });

  // Generate the html.
  writeFileSync(`dist/${fileName}.html`, pageTemplate({ styles, content }));
}
