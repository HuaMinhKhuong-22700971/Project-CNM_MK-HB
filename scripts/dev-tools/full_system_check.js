const axios = require('axios');
const BASE = 'http://localhost:4000/api';

const results = [];

function log(actor, test, status, detail = '') {
  const icon = status === 'PASS' ? 'PASS' : 'FAIL';
  results.push({ actor, test, status, detail });
  console.log(`[${icon}] [${actor}] ${test}${detail ? ' | ' + detail : ''}`);
}

async function request(method, path, data, token) {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await axios({ method, url: `${BASE}${path}`, data, headers, timeout: 8000 });
    return { ok: true, data: res.data, status: res.status };
  } catch (e) {
    return { ok: false, status: e.response?.status, error: e.response?.data?.message || e.message };
  }
}

async function login(email, pass) {
  const r = await request('post', '/auth/login', { email, password: pass });
  if (r.ok) return r.data?.data?.token || r.data?.token;
  return null;
}

async function main() {
  console.log('\n========================================');
  console.log('   PC Mall — Full System Check (5 Actor)');
  console.log('========================================\n');

  // Health
  const h = await request('get', '/health');
  log('SYSTEM', 'API Health', h.ok ? 'PASS' : 'FAIL', h.ok ? 'online' : h.error);

  // GUEST
  console.log('\n== GUEST ==');
  const cat = await request('get', '/catalog/products?limit=5');
  log('GUEST', 'Danh sách sản phẩm', cat.ok ? 'PASS' : 'FAIL', cat.ok ? `total=${cat.data?.data?.total}` : cat.error);

  const det = await request('get', '/products/razer-blade-15');
  log('GUEST', 'Chi tiết sản phẩm', det.ok ? 'PASS' : 'FAIL', det.ok ? `id=${det.data?.data?.product_id}` : det.error);

  const cats = await request('get', '/catalog/categories');
  log('GUEST', 'Categories', cats.ok ? 'PASS' : 'FAIL', cats.ok ? `count=${cats.data?.data?.length}` : cats.error);

  const brds = await request('get', '/catalog/brands');
  log('GUEST', 'Brands', brds.ok ? 'PASS' : 'FAIL', brds.ok ? `count=${brds.data?.data?.length}` : brds.error);

  const compat = await request('get', '/compatibility-rules');
  log('GUEST', 'Compatibility rules (public)', compat.ok ? 'PASS' : 'FAIL', compat.ok ? 'ok' : compat.error);

  // CUSTOMER
  console.log('\n== CUSTOMER ==');
  let tc = await login('user01@example.com', '123456');
  if (!tc) tc = await login('customer@example.com', '123456');
  log('CUSTOMER', 'Đăng nhập', tc ? 'PASS' : 'FAIL', tc ? 'token OK' : 'FAIL - check credentials');

  if (tc) {
    const cart = await request('get', '/cart', null, tc);
    log('CUSTOMER', 'Xem giỏ hàng', cart.ok ? 'PASS' : 'FAIL', cart.ok ? `${cart.data?.data?.items?.length||0} items` : cart.error);

    const addC = await request('post', '/cart/items', { productId: '110', quantity: 1 }, tc);
    log('CUSTOMER', 'Thêm Laptop vào giỏ', addC.ok ? 'PASS' : 'FAIL', addC.ok ? 'added' : addC.error);

    const ords = await request('get', '/orders', null, tc);
    log('CUSTOMER', 'Danh sách đơn hàng', ords.ok ? 'PASS' : 'FAIL', ords.ok ? 'ok' : ords.error);

    const tix = await request('get', '/tickets', null, tc);
    log('CUSTOMER', 'Danh sách ticket', tix.ok ? 'PASS' : 'FAIL', tix.ok ? `${tix.data?.data?.length||0} tickets` : tix.error);

    const war = await request('get', '/warranties', null, tc);
    log('CUSTOMER', 'Bảo hành', war.ok ? 'PASS' : 'FAIL', war.ok ? 'ok' : war.error);

    const chatQ = await request('get', '/chat/queue', null, tc);
    log('CUSTOMER', 'Chat queue', chatQ.ok ? 'PASS' : 'FAIL', chatQ.ok ? 'ok' : chatQ.error);
  }

  // SALES STAFF
  console.log('\n== SALES STAFF ==');
  const ts = await login('sales@pcmall.vn', '123456');
  log('SALES', 'Đăng nhập Sales', ts ? 'PASS' : 'FAIL', ts ? 'token OK' : 'Fail');

  if (ts) {
    const sOrds = await request('get', '/staff/orders', null, ts);
    log('SALES', 'Danh sách đơn hàng', sOrds.ok ? 'PASS' : 'FAIL', sOrds.ok ? 'ok' : sOrds.error);

    const queue = await request('get', '/chat/queue', null, ts);
    log('SALES', 'Chat queue', queue.ok ? 'PASS' : 'FAIL', queue.ok ? `${queue.data?.data?.length||0} chờ` : queue.error);

    const sess = await request('get', '/chat/sessions', null, ts);
    log('SALES', 'Chat sessions', sess.ok ? 'PASS' : 'FAIL', sess.ok ? 'ok' : sess.error);
  }

  // TECH STAFF
  console.log('\n== TECH STAFF ==');
  const tt = await login('tech@pcmall.vn', '123456');
  log('TECH', 'Đăng nhập Tech', tt ? 'PASS' : 'FAIL', tt ? 'token OK' : 'Fail');

  if (tt) {
    const tixT = await request('get', '/tickets', null, tt);
    log('TECH', 'Xem tickets', tixT.ok ? 'PASS' : 'FAIL', tixT.ok ? `${tixT.data?.data?.length||0} tickets` : tixT.error);

    const rulesT = await request('get', '/compatibility-rules', null, tt);
    log('TECH', 'Luật tương thích', rulesT.ok ? 'PASS' : 'FAIL', rulesT.ok ? 'ok' : rulesT.error);
  }

  // ADMIN
  console.log('\n== ADMIN ==');
  const ta = await login('admin@pcmall.vn', '123456');
  log('ADMIN', 'Đăng nhập Admin', ta ? 'PASS' : 'FAIL', ta ? 'token OK' : 'Fail');

  if (ta) {
    const dash = await request('get', '/admin/dashboard', null, ta);
    log('ADMIN', 'Dashboard', dash.ok ? 'PASS' : 'FAIL', dash.ok ? 'ok' : dash.error);

    const usrs = await request('get', '/admin/users', null, ta);
    log('ADMIN', 'Quản lý users', usrs.ok ? 'PASS' : 'FAIL', usrs.ok ? 'ok' : usrs.error);

    const prods = await request('get', '/admin/products', null, ta);
    log('ADMIN', 'Quản lý sản phẩm', prods.ok ? 'PASS' : 'FAIL', prods.ok ? 'ok' : prods.error);

    const attrsA = await request('get', '/attributes', null, ta);
    log('ADMIN', 'Attributes', attrsA.ok ? 'PASS' : 'FAIL', attrsA.ok ? 'ok' : attrsA.error);

    const sysInfo = await request('get', '/admin/system', null, ta);
    log('ADMIN', 'System info', sysInfo.ok ? 'PASS' : 'FAIL', sysInfo.ok ? 'ok' : sysInfo.error);
  }

  // Summary
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;

  console.log('\n========================================');
  console.log(`TONG KET: ${pass} PASS | ${fail} FAIL | ${results.length} total`);
  if (fail > 0) {
    console.log('\nFAILED:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  [${r.actor}] ${r.test} => ${r.detail}`);
    });
  }
  console.log('========================================\n');
}

main().catch(console.error);
