#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SITEMAP_URL = "https://encore.dev/sitemap.xml";

async function fetchSitemap() {
  const response = await fetch(SITEMAP_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch sitemap: ${response.status}`);
  }
  return response.text();
}

function extractUrls(xml) {
  const urls = [];
  const regex = /<loc>([^<]+)<\/loc>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1]);
  }
  return urls;
}

function filterUrls(urls, pattern) {
  return urls.filter((url) => url.includes(pattern));
}

async function main() {
  console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
  const xml = await fetchSitemap();

  const urls = extractUrls(xml);
  console.log(`Found ${urls.length} URLs in sitemap`);

  const tsUrls = filterUrls(urls, "/ts");
  const goUrls = filterUrls(urls, "/go");
  const platformUrls = filterUrls(urls, "/platform");

  const scriptsDir = path.dirname(__filename);

  fs.writeFileSync(path.join(scriptsDir, "ts.txt"), tsUrls.join("\n"));
  console.log(`Wrote ${tsUrls.length} URLs to ts.txt`);

  fs.writeFileSync(path.join(scriptsDir, "go.txt"), goUrls.join("\n"));
  console.log(`Wrote ${goUrls.length} URLs to go.txt`);

  fs.writeFileSync(
    path.join(scriptsDir, "platform.txt"),
    platformUrls.join("\n")
  );
  console.log(`Wrote ${platformUrls.length} URLs to platform.txt`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
