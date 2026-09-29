const assert = require('node:assert/strict');
const { ResendSDK } = require('../ts/dist/ResendSDK');

async function main() {
  const apikey = process.env.RESEND_API_KEY;
  if (!apikey) throw new Error('Set RESEND_API_KEY locally before running the live test.');
  const client = new ResendSDK({ apikey, headers: { 'user-agent': 'resend-voxgig-sdk/0.0.1' }, system: {
    fetch: (url, init) => fetch(url, { ...init, signal: AbortSignal.timeout(15000) }),
  } });
  const started = performance.now();
  const response = await client.direct({
    method: 'GET', path: '/domains',
  });
  assert.equal(response.status, 200, 'Expected HTTP 200 from GET /domains');
  assert.equal(response.ok, true, 'Expected successful SDK response');
  assert.ok(Array.isArray(response.data?.data), 'Expected the domains response data array');
  console.log(JSON.stringify({
    endpoint: 'GET /domains', status: response.status,
    elapsedMs: Math.round(performance.now() - started),
    domainCount: response.data.data.length, passed: true,
  }, null, 2));
}
main().catch(() => {
  console.error('Live smoke test failed. Check the local API key, permissions, build and connection. Credentials and response bodies are not printed.');
  process.exitCode = 1;
});
