import { createRequire } from 'node:module'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
const require = createRequire(new URL('../artifacts/api-server/package.json', import.meta.url))
const { build } = require('esbuild')
const dir = await mkdtemp(path.join(tmpdir(), 'style-assist-tests-'))
try {
  const outfile = path.join(dir, 'regression.mjs')
  await build({ entryPoints: [new URL('../tests/regression.ts', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm', outfile, logLevel: 'silent' })
  await import(pathToFileURL(outfile).href)
  const httpOut = path.join(dir, 'recognition-http.mjs')
  await build({ entryPoints: [new URL('../tests/recognition-http.ts', import.meta.url).pathname], bundle: true, platform: 'node', format: 'esm', outfile: httpOut, logLevel: 'silent',
    packages: 'external', plugins: [{ name: 'mock-vision-provider', setup(build) {
      build.onResolve({ filter: /^express$/ }, () => ({ path: require.resolve('express'), external: true }))
      build.onResolve({ filter: /^@workspace\/integrations-openai-ai-server$/ }, () => ({ path: 'mock-provider', namespace: 'test' }))
      build.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const openai = globalThis.recognitionTestClient', loader: 'js' }))
    } }],
    banner: { js: `import { createRequire as createTestRequire } from 'node:module'; const require = createTestRequire(${JSON.stringify(new URL('../artifacts/api-server/package.json', import.meta.url).href)});` },
  })
  await import(pathToFileURL(httpOut).href)
} finally { await rm(dir, { recursive: true, force: true }) }
