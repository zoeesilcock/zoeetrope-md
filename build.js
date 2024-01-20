import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import markdownit from 'markdown-it';
import Handlebars from 'handlebars';

const md = markdownit({
  html: true,
  typographer: true
});

// Build our HTML pages.
buildHtmlFromMarkdown('index');
buildHtmlFromMarkdown('404');

// Copy the CSS.
copyFileSync('src/styles.css', 'dist/styles.css');

function buildHtmlFromMarkdown(fileName) {
  // Load the page contents.
  const markdownContent = readFileSync(`src/${fileName}.md`, 'utf8');
  const htmlContent = md.render(markdownContent);

  // Load the html template.
  Handlebars.registerPartial('content', '{{content}}')
  const pageTemplate = Handlebars.compile(readFileSync('src/template.hbs', 'utf8'), { noEscape: true });
  const renderedContent = Handlebars.compile('{{{html}}}')({ html: md.render(htmlContent) });

  // Generate the html.
  writeFileSync(`dist/${fileName}.html`, pageTemplate({ content: renderedContent }));
}
