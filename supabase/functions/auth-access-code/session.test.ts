import { describe, expect, test } from 'bun:test';
import { createSession, validateSession } from './session';

describe('privileged logging session authorization', () => {
  const secret = 'test-only-session-signing-key';
  test('rejects arbitrary caller session IDs', async () => {
    expect(await validateSession(crypto.randomUUID(), secret)).toBe(false);
  });
  test('accepts a server-issued session', async () => {
    expect(await validateSession(await createSession(secret), secret)).toBe(true);
  });
  test('rejects tampered session signatures', async () => {
    const token = await createSession(secret);
    expect(await validateSession(`${token.slice(0, token.indexOf('.'))}.forged`, secret)).toBe(false);
  });
  test('rejects expired sessions', async () => {
    const token = await createSession(secret, 1000);
    expect(await validateSession(token, secret, 1000 + 8 * 60 * 60 * 1000)).toBe(false);
  });
});