import { spawn } from "node:child_process";
import { createServer, request as httpRequest } from "node:http";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export function removeUpgradeInsecureRequests(policy) {
  return policy
    .split(";")
    .map((directive) => directive.trim())
    .filter(
      (directive) =>
        directive && directive.toLowerCase() !== "upgrade-insecure-requests",
    )
    .join("; ");
}

function forwardResponseHeaders(headers, response) {
  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || HOP_BY_HOP_HEADERS.has(name.toLowerCase()))
      continue;

    if (name.toLowerCase() === "content-security-policy") {
      const policies = Array.isArray(value) ? value : [value];
      response.setHeader(name, policies.map(removeUpgradeInsecureRequests));
      continue;
    }

    response.setHeader(name, value);
  }
}

export async function startBrowserTestServer({
  publicPort = 8788,
  workerPort = 8789,
} = {}) {
  const projectRoot = fileURLToPath(new URL("..", import.meta.url));
  const wranglerCli = fileURLToPath(
    new URL("../node_modules/wrangler/bin/wrangler.js", import.meta.url),
  );

  // Astro's current Cloudflare adapter uses the unified Wrangler entrypoint
  // declared in wrangler.jsonc and redirects it to the generated build config
  // after `astro build`. Do not override that contract with a legacy positional
  // dist/server/entry.mjs argument; doing so prevents Wrangler 4.x from making
  // the minimal main-branch Worker ready for browser QA.
  const wrangler = spawn(
    process.execPath,
    [
      wranglerCli,
      "dev",
      "--port",
      String(workerPort),
      "--local-protocol=http",
      "--config",
      "wrangler.jsonc",
    ],
    {
      cwd: projectRoot,
      env: process.env,
      stdio: "inherit",
    },
  );

  wrangler.once("error", (error) => {
    console.error(`Browser QA Wrangler failed to start: ${error.message}`);
  });

  const proxy = createServer((incoming, outgoing) => {
    const requestHeaders = Object.fromEntries(
      Object.entries(incoming.headers).filter(
        ([name, value]) => value !== undefined && !HOP_BY_HOP_HEADERS.has(name),
      ),
    );
    requestHeaders.host = `127.0.0.1:${workerPort}`;

    const upstream = httpRequest(
      {
        hostname: "127.0.0.1",
        port: workerPort,
        path: incoming.url ?? "/",
        method: incoming.method,
        headers: requestHeaders,
      },
      (upstreamResponse) => {
        outgoing.statusCode = upstreamResponse.statusCode ?? 502;
        if (upstreamResponse.statusMessage)
          outgoing.statusMessage = upstreamResponse.statusMessage;
        forwardResponseHeaders(upstreamResponse.headers, outgoing);
        upstreamResponse.pipe(outgoing);
      },
    );

    upstream.on("error", (error) => {
      if (!outgoing.headersSent) {
        outgoing.statusCode = 503;
        outgoing.setHeader("content-type", "text/plain; charset=utf-8");
      }
      outgoing.end(
        `Browser QA Worker is not ready: ${error.code ?? "upstream-error"}`,
      );
    });
    incoming.on("aborted", () => upstream.destroy());
    incoming.pipe(upstream);
  });

  await new Promise((resolveListen, rejectListen) => {
    proxy.once("error", rejectListen);
    proxy.listen(publicPort, "127.0.0.1", () => {
      proxy.off("error", rejectListen);
      resolveListen();
    });
  });

  let stopping = false;
  const stop = (signal = "SIGTERM") => {
    if (stopping) return;
    stopping = true;
    proxy.close();
    if (wrangler.exitCode === null && wrangler.signalCode === null)
      wrangler.kill(signal);

    const forceStop = setTimeout(() => {
      if (wrangler.exitCode === null && wrangler.signalCode === null)
        wrangler.kill("SIGKILL");
    }, 5_000);
    forceStop.unref();
  };

  process.once("SIGINT", () => stop("SIGINT"));
  process.once("SIGTERM", () => stop("SIGTERM"));
  wrangler.once("exit", (code, signal) => {
    proxy.close();
    if (stopping || code === 0) return;
    console.error(
      `Browser QA Wrangler exited unexpectedly (${signal ?? code ?? "unknown"}).`,
    );
    process.exitCode = code || 1;
  });

  return { proxy, wrangler, stop };
}

const isMain =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await startBrowserTestServer();
