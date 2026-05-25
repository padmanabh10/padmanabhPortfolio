import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "a", "img", "figure", "figcaption",
  "blockquote", "code", "pre",
  "strong", "em", "u", "s", "mark", "small", "sub", "sup",
  "ul", "ol", "li",
  "table", "thead", "tbody", "tr", "th", "td",
  "div", "span",
];

export function sanitizeRichText(html: string): string {
  if (!html) return "";
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      "*": ["class", "style"],
      code: ["class"],
      pre: ["class"],
    },
    allowedSchemesByTag: {
      img: ["http", "https", "data"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}
