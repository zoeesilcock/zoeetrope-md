import { readFileSync, writeFileSync, copyFileSync } from 'fs';
import { markdown } from 'markdown';
import Handlebars from 'handlebars';

// Load the page contents.
const pageContent = readFileSync('src/index.md', 'utf8');

// Load the html template.
const template = Handlebars.compile(readFileSync('src/index.hbs', 'utf8'));

// Generate the html.
writeFileSync('dist/index.html', template({ content: markdown.toHTML(pageContent) }));

// Copy the CSS.
copyFileSync('src/styles.css', 'dist/styles.css');
