import esbuild from 'esbuild';
import { copyFile, mkdir } from 'node:fs/promises';

const watch = process.argv.includes('--watch');

await mkdir('dist', { recursive: true });
await copyFile('public/index.html', 'dist/index.html');

const ctx = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  target: 'es2020',
  sourcemap: true,
  minify: !watch,
  loader: { '.css': 'css' },
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
});

if (watch) {
  await ctx.watch();
  const { host, port } = await ctx.serve({ servedir: 'dist', port: 3000 });
  console.log(`dev server: http://${host}:${port}`);
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('built dist/');
}
