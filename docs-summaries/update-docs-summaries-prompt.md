## Task: Sync Documentation Summaries with Sitemap

### Step 1: Fetch Current Links
Run `fetch-docs-links.js` to extract links from sitemap.xml.
This creates: `ts.txt`, `go.txt`, `platform.txt`

### Step 2: Update Each Summary File

Process these three pairs:

| Links file       | Summary file                  |
|------------------|-------------------------------|
| `ts.txt`         | `ts-docs-summary.md`          |
| `go.txt`         | `go-docs-summary.md`          |
| `platform.txt`   | `platform-docs-summary.md`    |

**For each pair:**

1. **Find missing links**
   - Read all URLs from the links file
   - Compare against URLs already in the summary file
   - Identify any links not yet documented

2. **For each missing link:**
   - Fetch the page content
   - Write a 1-2 sentence summary describing what the page covers
   - Summary should give an LLM enough context to know when this page is relevant

3. **Add to summary file**
   - Append the link and summary to the corresponding summary file

### Output Format for Summaries

Each entry in the summary files should follow this format:
```
- https://url — Brief description of what this page covers and when to reference it.
```

### Notes
- Preserve existing entries; only add missing links
- Keep summaries concise but informative for LLM retrieval