import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.resolve(__dirname, '..', 'dist');

const routesToPrerender = ['/', '/Dithering/Image', '/Dithering/Video', '/Algorithms'];

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

const readFileIfExists = async (filePath) => {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) return null;
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
};

const createStaticServer = async () => {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      const pathname = decodeURIComponent(url.pathname);

      const requestedPath = pathname === '/' ? '/index.html' : pathname;
      const candidateFile = path.join(distDir, requestedPath);

      const direct = await readFileIfExists(candidateFile);
      if (direct) {
        const ext = path.extname(candidateFile).toLowerCase();
        res.writeHead(200, { 'Content-Type': contentTypes[ext] ?? 'application/octet-stream' });
        res.end(direct);
        return;
      }

      // Directory index fallback: /foo -> /foo/index.html
      const dirIndex = await readFileIfExists(path.join(distDir, requestedPath, 'index.html'));
      if (dirIndex) {
        res.writeHead(200, { 'Content-Type': contentTypes['.html'] });
        res.end(dirIndex);
        return;
      }

      // SPA fallback for route-like requests (no extension)
      if (!path.extname(pathname)) {
        const spa = await readFileIfExists(path.join(distDir, 'index.html'));
        if (spa) {
          res.writeHead(200, { 'Content-Type': contentTypes['.html'] });
          res.end(spa);
          return;
        }
      }

      res.writeHead(404, { 'Content-Type': contentTypes['.txt'] });
      res.end('Not found');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': contentTypes['.txt'] });
      res.end('Internal error');
    }
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to start server');

  return { server, port: address.port };
};

const outputPathForRoute = (route) => {
  if (route === '/') return path.join(distDir, 'index.html');
  const clean = route.replace(/^\//, '');
  return path.join(distDir, clean, 'index.html');
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  // Ensure dist exists
  await fs.stat(distDir);

  const { server, port } = await createStaticServer();
  const baseUrl = `http://127.0.0.1:${port}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    for (const route of routesToPrerender) {
      const url = `${baseUrl}${route}`;
      // networkidle0 can hang if analytics keeps connections open; networkidle2 is safer.
      await page.goto(url, { waitUntil: 'networkidle2' });
      await sleep(250);

      const html = await page.content();
      const outFile = outputPathForRoute(route);
      await fs.mkdir(path.dirname(outFile), { recursive: true });
      await fs.writeFile(outFile, html, 'utf8');
      process.stdout.write(`prerendered ${route} -> ${path.relative(process.cwd(), outFile)}\n`);
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
};

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
