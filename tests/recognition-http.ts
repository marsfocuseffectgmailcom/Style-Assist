import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import router from '../artifacts/api-server/src/routes/recognition'
const requireFromApp = createRequire(pathToFileURL(process.cwd() + '/artifacts/api-server/package.json'))
const express = requireFromApp('express')
let mode = 'success'
let providerCalls = 0
const fixture = { isClothing: true, category: 'Tops', garmentType: 'jersey', colour: 'blue', pattern: 'Solid', style: 'Sporty', season: 'All season', occasion: 'Sport', materialGuess: 'knitted appearance', materialFromLabel: '', labelText: '', brand: '', size: '', needsReview: false, notes: '' }
Object.assign(globalThis, { recognitionTestClient: { chat: { completions: { create: async (payload: any, options: any) => {
  providerCalls++
  assert.equal(payload.response_format.json_schema.strict, true)
  assert.equal(options.timeout, 45_000)
  assert.ok(payload.messages[1].content.some((c: any) => c.type === 'image_url'))
  if (mode === 'failure') throw new Error('provider unavailable')
  return { choices: [{ finish_reason: 'stop', message: { content: mode === 'malformed' ? '{}' : JSON.stringify(fixture) } }] }
} } } } })
const app = express(); app.use(express.json({limit:'9mb'})); app.use('/api', router)
const server = app.listen(0, '127.0.0.1')
await new Promise<void>(resolve => server.once('listening', resolve))
const url = `http://127.0.0.1:${server.address().port}/api/wardrobe/recognize`
const post = (body: object) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
try {
  let response = await post({ front: 'http://localhost/private' })
  assert.equal(response.status,400); assert.equal(providerCalls,0)
  response = await post({ front: 'data:image/jpeg;base64,YWJj' })
  assert.equal(response.status,200);assert.equal((await response.json()).category,'Tops')
  mode = 'malformed'; response = await post({ front: 'data:image/jpeg;base64,YWJj' }); assert.equal(response.status,503)
  mode = 'failure'; response = await post({ front: 'data:image/jpeg;base64,YWJj' }); assert.equal(response.status,503)
  assert.ok(!(await response.text()).includes('provider unavailable'))
  for(let i=0;i<7;i++) await post({front:'data:image/jpeg;base64,YWJj'})
  response=await post({front:'data:image/jpeg;base64,YWJj'});assert.equal(response.status,429)
  assert.equal(providerCalls,10)
  console.log('PASS HTTP recognition: image contract, validation, provider errors, malformed output and throttling (mock provider)')
} finally { await new Promise<void>(resolve => server.close(() => resolve())) }
