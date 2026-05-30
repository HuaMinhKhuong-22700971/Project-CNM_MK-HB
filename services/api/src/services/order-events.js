const clientsByUserId = new Map();

function getClientSet(userId) {
  const key = String(userId);
  let clients = clientsByUserId.get(key);
  if (!clients) {
    clients = new Set();
    clientsByUserId.set(key, clients);
  }
  return clients;
}

function subscribeOrderEvents(userId, res) {
  const key = String(userId);
  const clients = getClientSet(key);
  clients.add(res);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no"
  });
  res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

  const keepAlive = setInterval(() => {
    res.write(`event: ping\ndata: ${JSON.stringify({ at: Date.now() })}\n\n`);
  }, 25000);

  res.on("close", () => {
    clearInterval(keepAlive);
    clients.delete(res);
    if (clients.size === 0) {
      clientsByUserId.delete(key);
    }
  });
}

function publishOrderEvent(userId, payload) {
  if (!userId) return;
  const clients = clientsByUserId.get(String(userId));
  if (!clients || clients.size === 0) return;

  const data = JSON.stringify({
    type: "order.updated",
    ...payload,
    at: new Date().toISOString()
  });

  for (const res of clients) {
    res.write(`event: order.updated\ndata: ${data}\n\n`);
  }
}

module.exports = {
  publishOrderEvent,
  subscribeOrderEvents
};
