const encoder = new TextEncoder();

async function keyFor(secret: string) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

function encode(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

function decode(value: string) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
}

export async function createSession(secret: string, now = Date.now()) {
  const payload = encode(encoder.encode(JSON.stringify({ id: crypto.randomUUID(), expires: now + 8 * 60 * 60 * 1000 })));
  const signature = await crypto.subtle.sign('HMAC', await keyFor(secret), encoder.encode(payload));
  return `${payload}.${encode(new Uint8Array(signature))}`;
}

export async function validateSession(token: unknown, secret: string, now = Date.now()): Promise<boolean> {
  if (typeof token !== 'string' || token.length > 1024) return false;
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payload, signature] = parts;
    if (!payload || !signature) return false;
    if (!await crypto.subtle.verify('HMAC', await keyFor(secret), decode(signature), encoder.encode(payload))) return false;
    const claims = JSON.parse(new TextDecoder().decode(decode(payload)));
    return typeof claims.id === 'string' && typeof claims.expires === 'number' && claims.expires > now;
  } catch {
    return false;
  }
}