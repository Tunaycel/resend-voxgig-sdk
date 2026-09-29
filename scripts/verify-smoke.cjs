const assert = require('node:assert/strict');
const { ResendSDK } = require('../ts/dist/ResendSDK');

async function main() {
  let calls = 0;
  const client = new ResendSDK({ apikey: 'fixture-not-a-real-key', headers: { 'user-agent': 'resend-voxgig-sdk/0.0.1' }, system: {
    fetch: async (url, init) => {
      calls++;
      assert.equal(url, 'https://api.resend.com/domains');
      assert.equal(init.method, 'GET');
      assert.equal(init.headers.authorization, 'Bearer fixture-not-a-real-key');
      assert.equal(init.headers['user-agent'], 'resend-voxgig-sdk/0.0.1');
      return new Response(JSON.stringify({ object: 'list', has_more: false, data: [] }), {
        status: 200, headers: { 'content-type': 'application/json' },
      });
    },
  } });
  const result = await client.direct({ method: 'GET', path: '/domains' });
  assert.equal(result.ok, true);
  assert.equal(result.status, 200);
  assert.deepEqual(result.data.data, []);
  const domains = await client.Domain().list();
  assert.deepEqual(domains, []);
  assert.equal(calls, 2);
  console.log('PASS: direct and Domain.list requests, bearer authentication, user-agent and empty response (offline).');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
