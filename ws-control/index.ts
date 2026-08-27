// ws-control: minimal WebSocket relay
//
// Two kinds of clients connect here:
//   - "controller"  -> your phone, sends touch/orientation deltas
//   - "viewer"       -> your Three.js scene, receives deltas and applies them
//
// Everything on the "scene-control" topic is broadcast to everyone else
// on that topic. No persistence, no state — just a pub/sub relay.

const PORT = Number(process.env.PORT ?? 8787);

// Optional shared secret so randoms on your LAN can't drive your scene.
// Set CONTROL_TOKEN in the environment; leave unset to disable the check.
const TOKEN = process.env.CONTROL_TOKEN ?? null;

const TOPIC = "scene-control";

Bun.serve({
  port: PORT,

  fetch(req, server) {
    const url = new URL(req.url);
    const ip = server.requestIP(req)?.address ?? "unknown";

    if (url.pathname === "/health") {
      return new Response("ok");
    }

    // Serve the phone control page for convenience during dev.
    // Dedicated path only — "/" is reserved for the WebSocket upgrade below,
    // so viewer/controller clients connecting to ws://host:port/?role=... aren't
    // accidentally handed back an HTML response instead of an upgrade.
    if (url.pathname === "/control") {
      console.log(`[ws-control] ${ip} served control.html`);
      return new Response(Bun.file(`${import.meta.dir}/public/control.html`), {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (TOKEN && url.searchParams.get("token") !== TOKEN) {
      console.log(`[ws-control] ${ip} REJECTED (bad/missing token) path=${url.pathname}`);
      return new Response("unauthorized", { status: 401 });
    }

    const role = url.searchParams.get("role") ?? "viewer"; // "controller" | "viewer"

    const upgraded = server.upgrade(req, { data: { role, ip } });
    if (upgraded) {
      console.log(`[ws-control] ${ip} upgrade OK, role=${role}`);
      return; // Bun takes over the response
    }

    console.log(`[ws-control] ${ip} upgrade FAILED (not a websocket request), path=${url.pathname}`);
    return new Response("expected a websocket upgrade", { status: 400 });
  },

  websocket: {
    open(ws) {
      ws.subscribe(TOPIC);
      console.log(`[ws-control] OPEN  role=${ws.data.role} ip=${ws.data.ip}`);
    },

    message(ws, message) {
      // Relay as-is to every other subscriber (phone -> viewer(s)).
      // Keep payloads small: { type: "rotate" | "zoom" | "pan", dx, dy, scale }
      console.log(`[ws-control] MSG   role=${ws.data.role} ip=${ws.data.ip} -> ${message}`);
      ws.publish(TOPIC, message);
    },

    close(ws, code, reason) {
      console.log(`[ws-control] CLOSE role=${ws.data.role} ip=${ws.data.ip} code=${code} reason=${reason}`);
    },
  },
});

console.log(`[ws-control] listening on :${PORT}`);