const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
  "span",
  "div",
]);

function isAllowedClass(className: string) {
  return (
    className === "editor-inline-heading" ||
    /^editor-inline-h[123]$/.test(className) ||
    /^editor-font-(sans|serif|mono)$/.test(className) ||
    /^editor-size-(sm|base|lg|xl|2xl)$/.test(className) ||
    /^editor-color-(default|blue|green|gold|wine)$/.test(className)
  );
}

function sanitizeAttributes(tag: string, rawAttrs: string) {
  const attrs: string[] = [];
  const attrRe = /([a-zA-Z0-9:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>]+))/g;
  let match: RegExpExecArray | null;
  while ((match = attrRe.exec(rawAttrs))) {
    const name = match[1].toLowerCase();
    const value = (match[3] ?? match[4] ?? match[5] ?? "").trim();
    if (name.startsWith("on")) continue;
    if (name === "style") continue;
    if ((name === "href" || name === "src") && /^javascript:/i.test(value)) continue;
    if (name === "class") {
      if (tag !== "span") continue;
      const allowedClasses = value
        .split(/\s+/)
        .filter(isAllowedClass);
      if (!allowedClasses.length) continue;
      attrs.push(`class="${allowedClasses.join(" ")}"`);
      continue;
    }
    if (tag !== "a" && name === "target") continue;
    if (tag !== "img" && name === "alt") continue;
    attrs.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  return attrs.length ? " " + attrs.join(" ") : "";
}

export function sanitizeHtml(html: string) {
  if (!html) return "";
  let output = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
  output = output.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<!--[\s\S]*?-->/g, "");
  output = output.replace(/<\s*\/?\s*([a-zA-Z0-9:-]+)([^>]*)>/g, (full, rawTag: string, rawAttrs: string) => {
    const tag = String(rawTag).toLowerCase();
    const closing = /^<\s*\//.test(full);
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;
    return `<${tag}${sanitizeAttributes(tag, String(rawAttrs || ""))}>`;
  });
  return output;
}
