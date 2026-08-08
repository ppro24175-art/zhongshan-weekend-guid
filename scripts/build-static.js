const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'server'), { recursive: true });

for (const file of ['index.html', 'style.css', 'data.js', 'script.js']) {
  fs.copyFileSync(path.join(root, file), path.join(dist, file));
}

fs.writeFileSync(path.join(dist, 'server', 'index.js'), `export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404) return response;

    const acceptsHtml = request.headers.get('accept')?.includes('text/html');
    if (acceptsHtml) {
      return env.ASSETS.fetch(new Request(new URL('/index.html', request.url)));
    }
    return response;
  },
};
`);

console.log(`Static deployment build ready: ${dist}`);
