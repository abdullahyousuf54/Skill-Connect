import { env } from 'cloudflare:workers';
import { ownerOf, initialize, put, get, sameOrigin } from '@/lib/server';
export async function POST(req: Request) {
  try {
    sameOrigin(req);
    const owner = ownerOf(req);
    await initialize();
    const form = await req.formData();
    const file = form.get('file');
    const role = form.get('role');
    if (!['Student', 'Faculty'].includes(String(role)))
      throw new Error('Choose a student or faculty profile.');
    if (!(file instanceof File) || file.size > 5 * 1024 * 1024 || !file.size)
      throw new Error('Choose a PDF, PNG or JPEG up to 5 MB.');
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(file.type))
      throw new Error('Only PDF, PNG and JPEG are supported.');
    const id = crypto.randomUUID();
    const key = owner + '/' + id;
    await env.FILES.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });
    const item = {
      role,
      title: file.name.slice(0, 150),
      type: 'Document',
      description: 'Uploaded document',
      verified: false,
      fileKey: key,
      mime: file.type,
      date: new Date().toISOString(),
    };
    await put(owner, 'portfolio', id, item);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
}
export async function GET(req: Request) {
  try {
    const owner = ownerOf(req);
    await initialize();
    const id = new URL(req.url).searchParams.get('id');
    const p = id ? await get(owner, 'portfolio', id) : null;
    if (!p?.fileKey) return new Response('Not found', { status: 404 });
    const file = await env.FILES.get(p.fileKey);
    if (!file) return new Response('Not found', { status: 404 });
    return new Response(file.body, {
      headers: {
        'Content-Type': p.mime,
        'Content-Disposition':
          "attachment; filename*=UTF-8''" + encodeURIComponent(p.title),
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }
}
