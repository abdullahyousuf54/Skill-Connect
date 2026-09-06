const cookieName = 'skillconnect_guest';

export function guestOwner(req: Request): string | null {
  const value = (req.headers.get('cookie') || '')
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(cookieName + '='))
    ?.slice(cookieName.length + 1);
  return value && /^[a-f0-9]{64}$/.test(value) ? 'guest:' + value : null;
}

export function createGuest(req: Request) {
  const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return {
    owner: 'guest:' + token,
    cookie: `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${new URL(req.url).protocol === 'https:' ? '; Secure' : ''}`,
  };
}
