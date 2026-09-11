import {
  articlePath,
  assertAdmin,
  assertReadSecurity,
  assertWriteSecurity,
  createCsrfToken,
  csrfCookie,
  decodeBase64,
  encodeBase64,
  getGithubFile,
  githubRequest,
  handleError,
  HttpError,
  inferCategory,
  json,
  listGithubArticles,
  parseArticle,
  safeImageCategory,
  safeImageKey,
  sanitizeMeta,
  serializeMarkdown,
  triggerDeploy,
  validateCategory,
  validateSlug,
  validateStoredImageKey,
  type ArticlePayload,
  type Env,
} from './admin';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/admin/')) {
        return handleAdminApi(request, env, url);
      }
      if (isMaintenanceMode(env)) {
        return handleMaintenanceRequest(request, env, url);
      }
      return serveAssets(request, env);
    } catch (error) {
      console.error(error);
      const url = new URL(request.url);
      if (url.pathname.startsWith('/api/')) {
        return json({ error: 'Worker runtime error' }, 500);
      }
      return new Response('Worker runtime error', {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
  },
};

const serveAssets = (request: Request, env: Env) => {
  if (!env.ASSETS) throw new HttpError(500, 'Static assets binding is not configured');
  return env.ASSETS.fetch(request);
};

const isMaintenanceMode = (env: Env) => env.MAINTENANCE_MODE === 'true';

const handleMaintenanceRequest = async (request: Request, env: Env, url: URL) => {
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    try {
      await assertAdmin(request, env);
      return serveAssets(request, env);
    } catch (error) {
      return handleError(error);
    }
  }

  if (isPublicAsset(url.pathname)) return serveAssets(request, env);

  return new Response(maintenanceHtml(env), {
    status: 503,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
      'retry-after': '600',
    },
  });
};

const isPublicAsset = (pathname: string) =>
  pathname.startsWith('/assets/') ||
  pathname.startsWith('/images/') ||
  pathname === '/favicon.ico' ||
  pathname === '/vp-icons.css';

const maintenanceHtml = (env: Env) => `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>メンテナンス中 | ZZZ Lore & Archive</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #101217; color: #e8ebf2; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(92vw, 560px); padding: 32px; border: 1px solid #262a36; background: #151820; }
    h1 { margin: 0 0 12px; font-size: 24px; }
    p { margin: 0; color: #a9b0be; line-height: 1.8; }
    a { color: #ffd12d; }
  </style>
</head>
<body>
  <main>
    <h1>メンテナンス中です</h1>
    <p>${escapeHtml(env.MAINTENANCE_MESSAGE || '現在 Wiki をメンテナンスしています。しばらくしてから再度アクセスしてください。')}</p>
  </main>
</body>
</html>`;

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const handleAdminApi = async (request: Request, env: Env, url: URL) => {
  try {
    const path = url.pathname.replace(/^\/api\/admin\/?/, '');
    const segments = path.split('/').filter(Boolean).map(segment => decodeURIComponent(segment));

    if (request.method === 'GET' && path === 'health') return getHealth(env);
    if (request.method === 'GET' && path === 'session') return getSession(request, env);

    if (segments[0] === 'articles') {
      if (segments.length === 1 && request.method === 'GET') return listArticles(request, env);
      if (segments.length === 1 && request.method === 'POST') return createArticle(request, env);
      if (segments.length === 3 && request.method === 'GET') return getArticle(request, env, segments[1], segments[2]);
      if (segments.length === 3 && request.method === 'PUT') return updateArticle(request, env, segments[1], segments[2]);
      if (segments.length === 3 && request.method === 'DELETE') return deleteArticle(request, env, segments[1], segments[2]);
    }

    if (segments[0] === 'images') {
      if (segments.length === 1 && request.method === 'GET') return listImages(request, env);
      if (segments.length === 1 && request.method === 'POST') return uploadImage(request, env);
      if (segments.length >= 2 && request.method === 'DELETE') return deleteImage(request, env, segments.slice(1).join('/'));
    }

    throw new HttpError(404, 'Admin API route not found');
  } catch (error) {
    return handleError(error);
  }
};

const getHealth = (env: Env) => json({
  ok: true,
  worker: 'zzz-lore-wiki',
  hasAssetsBinding: Boolean(env.ASSETS),
  hasAdminEmail: Boolean(env.ADMIN_EMAIL),
  hasGithubToken: Boolean(env.GITHUB_TOKEN),
});

const getSession = async (request: Request, env: Env) => {
  const identity = await assertAdmin(request, env);
  const csrf = createCsrfToken();
  return json({ email: identity.email, csrf }, 200, { 'set-cookie': csrfCookie(request, csrf) });
};

const listArticles = async (request: Request, env: Env) => {
  await assertReadSecurity(request, env);
  const files = await listGithubArticles(env);
  const articles = await Promise.all(files.map(async file => {
    const detail = await getGithubFile(env, file.path);
    const article = parseArticle(file.path, decodeBase64(detail.content), detail.sha);
    return {
      path: article.path,
      slug: article.slug,
      sha: article.sha,
      title: article.meta.title ?? article.slug,
      description: article.meta.description ?? '',
      category: article.meta.category ?? inferCategory(article.path),
      tags: article.meta.tags ?? [],
      updatedAt: article.meta.updatedAt ?? '',
      status: article.meta.status ?? 'draft',
    };
  }));
  return json({ articles });
};

const createArticle = async (request: Request, env: Env) => {
  await assertWriteSecurity(request, env);
  const payload = sanitizeMeta(await request.json() as ArticlePayload);
  const path = articlePath(payload.meta.category, payload.slug);
  const markdown = serializeMarkdown(payload.meta, payload.body);
  await githubRequest(env, `/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `content: create ${payload.meta.title}`,
      content: encodeBase64(markdown),
      branch: env.GITHUB_BRANCH || 'main',
    }),
  });
  await triggerDeploy(env);
  return json({ ok: true, path });
};

const getArticle = async (request: Request, env: Env, categoryValue: string, slugValue: string) => {
  await assertReadSecurity(request, env);
  const category = validateCategory(categoryValue);
  const slug = validateSlug(slugValue);
  const path = articlePath(category, slug);
  const file = await getGithubFile(env, path);
  return json({ article: parseArticle(path, decodeBase64(file.content), file.sha) });
};

const updateArticle = async (request: Request, env: Env, categoryValue: string, slugValue: string) => {
  await assertWriteSecurity(request, env);
  const currentCategory = validateCategory(categoryValue);
  const currentSlug = validateSlug(slugValue);
  const payload = sanitizeMeta(await request.json() as ArticlePayload);
  const oldPath = articlePath(currentCategory, currentSlug);
  const newPath = articlePath(payload.meta.category, payload.slug);
  const current = await getGithubFile(env, oldPath);
  if (!payload.sha || payload.sha !== current.sha) throw new HttpError(409, 'Article was changed outside the admin screen');

  const markdown = serializeMarkdown(payload.meta, payload.body);
  if (oldPath !== newPath) {
    await githubRequest(env, `/contents/${newPath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `content: move ${payload.meta.title}`,
        content: encodeBase64(markdown),
        branch: env.GITHUB_BRANCH || 'main',
      }),
    });
    await githubRequest(env, `/contents/${oldPath}`, {
      method: 'DELETE',
      body: JSON.stringify({
        message: `content: remove old slug ${currentSlug}`,
        sha: current.sha,
        branch: env.GITHUB_BRANCH || 'main',
      }),
    });
  } else {
    await githubRequest(env, `/contents/${oldPath}`, {
      method: 'PUT',
      body: JSON.stringify({
        message: `content: update ${payload.meta.title}`,
        content: encodeBase64(markdown),
        sha: current.sha,
        branch: env.GITHUB_BRANCH || 'main',
      }),
    });
  }
  await triggerDeploy(env);
  return json({ ok: true, path: newPath });
};

const deleteArticle = async (request: Request, env: Env, categoryValue: string, slugValue: string) => {
  await assertWriteSecurity(request, env);
  const category = validateCategory(categoryValue);
  const slug = validateSlug(slugValue);
  const { title, sha } = await request.json() as { title?: string; sha?: string };
  if (!title?.trim()) throw new HttpError(400, 'Title confirmation is required');
  const path = articlePath(category, slug);
  const current = await getGithubFile(env, path);
  if (!sha || sha !== current.sha) throw new HttpError(409, 'Article was changed outside the admin screen');
  const article = parseArticle(path, decodeBase64(current.content), current.sha);
  if (article.meta.title !== title) throw new HttpError(400, 'Title confirmation does not match');
  await githubRequest(env, `/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({
      message: `content: delete ${title}`,
      sha: current.sha,
      branch: env.GITHUB_BRANCH || 'main',
    }),
  });
  await triggerDeploy(env);
  return json({ ok: true });
};

const listImages = async (request: Request, env: Env) => {
  await assertReadSecurity(request, env);
  if (!env.ADMIN_IMAGES_BUCKET) throw new HttpError(500, 'R2 bucket is not configured');
  const list = await env.ADMIN_IMAGES_BUCKET.list({ prefix: 'images/' });
  const base = env.PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, '') ?? '';
  return json({
    images: list.objects.map(object => ({
      key: object.key,
      size: object.size,
      uploadedAt: object.uploaded?.toISOString(),
      url: base ? `${base}/${object.key}` : `/${object.key}`,
    })),
  });
};

const uploadImage = async (request: Request, env: Env) => {
  await assertWriteSecurity(request, env);
  if (!env.ADMIN_IMAGES_BUCKET) throw new HttpError(500, 'R2 bucket is not configured');
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) throw new HttpError(400, 'Image file is required');
  const category = safeImageCategory(form.get('category'));
  const key = safeImageKey(category, file);
  await env.ADMIN_IMAGES_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });
  const base = env.PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, '') ?? '';
  return json({ key, url: base ? `${base}/${key}` : `/${key}` });
};

const deleteImage = async (request: Request, env: Env, rawKey: string) => {
  await assertWriteSecurity(request, env);
  if (!env.ADMIN_IMAGES_BUCKET) throw new HttpError(500, 'R2 bucket is not configured');
  const key = validateStoredImageKey(rawKey);
  await env.ADMIN_IMAGES_BUCKET.delete(key);
  return json({ ok: true });
};
