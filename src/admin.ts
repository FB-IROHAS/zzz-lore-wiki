export interface Env {
  ADMIN_EMAIL: string;
  GITHUB_TOKEN: string;
  GITHUB_OWNER?: string;
  GITHUB_REPO?: string;
  GITHUB_BRANCH?: string;
  CLOUDFLARE_DEPLOY_HOOK_URL?: string;
  PUBLIC_IMAGE_BASE_URL?: string;
  ADMIN_DEV_BYPASS?: string;
  MAINTENANCE_MODE?: string;
  MAINTENANCE_MESSAGE?: string;
  ADMIN_IMAGES_BUCKET?: {
    list(options?: { prefix?: string }): Promise<{ objects: { key: string; size: number; uploaded?: Date }[] }>;
    put(key: string, value: ReadableStream, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
    delete(key: string): Promise<unknown>;
  };
  ASSETS?: { fetch(request: Request): Promise<Response> };
}

export interface ArticleMeta {
  title: string;
  description: string;
  category: ArticleCategory;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  status: 'draft' | 'published' | 'archived';
}

export type ArticleCategory =
  | 'character'
  | 'organization'
  | 'terminology'
  | 'theory'
  | 'timeline'
  | 'source';

export interface ArticlePayload {
  meta: ArticleMeta;
  slug: string;
  body: string;
  sha?: string;
  previousSlug?: string;
  previousCategory?: ArticleCategory;
}

const CATEGORY_DIRS: Record<ArticleCategory, string> = {
  character: 'docs/characters',
  organization: 'docs/organizations',
  terminology: 'docs/terminology',
  theory: 'docs/theories',
  timeline: 'docs/timeline',
  source: 'docs/sources',
};

const RESERVED_SLUGS = new Set(['index']);
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...headers,
    },
  });

export const handleError = (error: unknown) => {
  const httpError = asHttpError(error);
  if (httpError) return json({ error: httpError.message }, httpError.status);
  console.error(error);
  return json({ error: 'Internal server error' }, 500);
};

export const asHttpError = (error: unknown) => {
  if (error instanceof HttpError) return error;
  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error &&
    typeof (error as { status?: unknown }).status === 'number' &&
    typeof (error as { message?: unknown }).message === 'string'
  ) {
    return error as { status: number; message: string };
  }
  return null;
};

export const assertAdmin = async (request: Request, env: Env) => {
  const email = await getAccessEmail(request, env);
  const adminEmail = env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) throw new HttpError(401, 'Administrator authentication is required');
  if (!adminEmail || email.toLowerCase() !== adminEmail) throw new HttpError(403, 'Forbidden');
  return { email };
};

const getAccessEmail = async (request: Request, env: Env) => {
  const headerEmail = request.headers.get('cf-access-authenticated-user-email');
  if (headerEmail) return headerEmail;

  const url = new URL(request.url);
  if (isLocalRequest(url) && env.ADMIN_DEV_BYPASS === 'true' && env.ADMIN_EMAIL) {
    return env.ADMIN_EMAIL;
  }

  return null;
};

export const assertWriteSecurity = async (request: Request, env: Env) => {
  await assertAdmin(request, env);
  assertOrigin(request);
  if (request.method !== 'DELETE') {
    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      throw new HttpError(415, 'Unsupported content type');
    }
  }
  assertCsrf(request);
};

export const assertReadSecurity = (request: Request, env: Env) => assertAdmin(request, env);

const assertOrigin = (request: Request) => {
  const origin = request.headers.get('origin');
  if (!origin) return;
  if (origin !== new URL(request.url).origin) throw new HttpError(403, 'Invalid origin');
};

const assertCsrf = (request: Request) => {
  if (!WRITE_METHODS.has(request.method)) return;
  const csrfCookie = parseCookies(request.headers.get('cookie')).admin_csrf;
  const csrfHeader = request.headers.get('x-csrf-token');
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) throw new HttpError(403, 'Invalid CSRF token');
};

export const createCsrfToken = () => crypto.randomUUID();

export const csrfCookie = (request: Request, token: string) => {
  const secure = new URL(request.url).protocol === 'https:' ? ' Secure;' : '';
  return `admin_csrf=${token}; Path=/;${secure} SameSite=Strict; Max-Age=7200`;
};

const parseCookies = (cookieHeader: string | null) => {
  const result: Record<string, string> = {};
  cookieHeader?.split(';').forEach(part => {
    const [key, ...value] = part.trim().split('=');
    if (key) result[key] = decodeURIComponent(value.join('='));
  });
  return result;
};

export const validateCategory = (value: unknown): ArticleCategory => {
  if (typeof value !== 'string' || !(value in CATEGORY_DIRS)) throw new HttpError(400, 'Invalid category');
  return value as ArticleCategory;
};

export const validateSlug = (value: unknown) => {
  if (typeof value !== 'string') throw new HttpError(400, 'Invalid slug');
  const slug = value.trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug)) throw new HttpError(400, 'Invalid slug');
  if (RESERVED_SLUGS.has(slug)) throw new HttpError(400, 'Reserved slug');
  if (slug.includes('..') || slug.includes('/') || slug.includes('\\')) throw new HttpError(400, 'Invalid slug');
  return slug;
};

export const articlePath = (category: ArticleCategory, slug: string) => `${CATEGORY_DIRS[category]}/${slug}.md`;

export const sanitizeMeta = (payload: ArticlePayload): ArticlePayload => {
  const category = validateCategory(payload.meta?.category);
  const slug = validateSlug(payload.slug);
  const status = payload.meta?.status;
  if (!['draft', 'published', 'archived'].includes(status)) throw new HttpError(400, 'Invalid status');
  if (!payload.meta?.title?.trim()) throw new HttpError(400, 'Title is required');
  if (payload.body.length > 250_000) throw new HttpError(400, 'Article is too large');

  return {
    ...payload,
    slug,
    meta: {
      title: payload.meta.title.trim(),
      description: payload.meta.description?.trim() ?? '',
      category,
      tags: Array.isArray(payload.meta.tags) ? payload.meta.tags.map(String).map(tag => tag.trim()).filter(Boolean) : [],
      createdAt: payload.meta.createdAt,
      updatedAt: today(),
      status,
    },
    previousSlug: payload.previousSlug ? validateSlug(payload.previousSlug) : undefined,
    previousCategory: payload.previousCategory ? validateCategory(payload.previousCategory) : undefined,
  };
};

export const serializeMarkdown = (meta: ArticleMeta, body: string) => [
  '---',
  `title: ${quoteYaml(meta.title)}`,
  `description: ${quoteYaml(meta.description)}`,
  `category: ${meta.category}`,
  'tags:',
  ...meta.tags.map(tag => `  - ${quoteYaml(tag)}`),
  `createdAt: ${meta.createdAt || today()}`,
  `updatedAt: ${meta.updatedAt || today()}`,
  `status: ${meta.status}`,
  '---',
  '',
  body.trim(),
  '',
].join('\n');

const quoteYaml = (value: string) => JSON.stringify(value ?? '');
const today = () => new Date().toISOString().slice(0, 10);

export const parseArticle = (path: string, content: string, sha: string) => {
  const [, rawMatter = '', body = content] = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/) ?? [];
  const meta = parseFrontmatter(rawMatter);
  const slug = path.split('/').pop()?.replace(/\.md$/, '') ?? '';
  return { path, slug, sha, meta, body };
};

const parseFrontmatter = (raw: string): Partial<ArticleMeta> => {
  const meta: Record<string, unknown> = {};
  const lines = raw.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!match) continue;
    const [, key, value] = match;
    if (key === 'tags' && value === '') {
      const tags: string[] = [];
      while (lines[i + 1]?.startsWith('  - ')) {
        i += 1;
        tags.push(unquoteYaml(lines[i].slice(4).trim()));
      }
      meta.tags = tags;
    } else {
      meta[key] = unquoteYaml(value.trim());
    }
  }
  return meta;
};

const unquoteYaml = (value: string) => {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const githubBase = (env: Env) => {
  const owner = env.GITHUB_OWNER || 'FB-IROHAS';
  const repo = env.GITHUB_REPO || 'zzz-lore-wiki';
  return `https://api.github.com/repos/${owner}/${repo}`;
};

export const githubRequest = async <T>(env: Env, path: string, init: RequestInit = {}) => {
  if (!env.GITHUB_TOKEN) throw new HttpError(500, 'GitHub token is not configured');
  let response: Response;
  try {
    response = await fetch(`${githubBase(env)}${path}`, {
      ...init,
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `Bearer ${env.GITHUB_TOKEN.trim()}`,
        'content-type': 'application/json',
        'user-agent': 'zzz-lore-admin',
        ...init.headers,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new HttpError(502, `GitHub request failed: ${message}`);
  }
  const text = await response.text();
  let data: { message?: string } | null = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    if (!response.ok) throw new HttpError(response.status, text || 'GitHub API error');
    throw new HttpError(502, 'GitHub API returned an invalid response');
  }
  if (!response.ok) throw new HttpError(response.status, data?.message ?? 'GitHub API error');
  return data as T;
};

export const listGithubArticles = async (env: Env) => {
  const branch = env.GITHUB_BRANCH || 'main';
  const tree = await githubRequest<{ tree: { path: string; type: string; sha: string }[] }>(
    env,
    `/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  return tree.tree.filter(item =>
    item.type === 'blob' &&
    item.path.endsWith('.md') &&
    Object.values(CATEGORY_DIRS).some(dir => item.path.startsWith(`${dir}/`)) &&
    !item.path.endsWith('/index.md')
  );
};

export const getGithubFile = async (env: Env, path: string) => {
  const branch = env.GITHUB_BRANCH || 'main';
  return githubRequest<{ content: string; sha: string; path: string }>(
    env,
    `/contents/${encodeURIComponent(path).replaceAll('%2F', '/')}?ref=${encodeURIComponent(branch)}`,
  );
};

export const decodeBase64 = (value: string) => {
  const binary = atob(value.replace(/\n/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
};

export const encodeBase64 = (value: string) => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => { binary += String.fromCharCode(byte); });
  return btoa(binary);
};

export const triggerDeploy = async (env: Env) => {
  if (!env.CLOUDFLARE_DEPLOY_HOOK_URL) return;
  await fetch(env.CLOUDFLARE_DEPLOY_HOOK_URL, { method: 'POST' });
};

export const safeImageCategory = (value: unknown) => {
  const category = String(value || 'misc');
  if (!/^(characters|terminology|theories|timeline|organizations|sources|misc)$/.test(category)) {
    throw new HttpError(400, 'Invalid image category');
  }
  return category;
};

export const safeImageKey = (category: string, file: File) => {
  if (!IMAGE_TYPES.has(file.type)) throw new HttpError(400, 'Unsupported image type');
  if (file.size > MAX_IMAGE_BYTES) throw new HttpError(400, 'Image is too large');
  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  return `images/${category}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
};

export const validateStoredImageKey = (key: string) => {
  if (!/^images\/(characters|terminology|theories|timeline|organizations|sources|misc)\/[a-z0-9-]+\.(jpg|png|webp|avif|gif)$/.test(key)) {
    throw new HttpError(400, 'Invalid image key');
  }
  return key;
};

export const inferCategory = (path: string) => {
  if (path.startsWith('docs/characters/')) return 'character';
  if (path.startsWith('docs/organizations/')) return 'organization';
  if (path.startsWith('docs/terminology/')) return 'terminology';
  if (path.startsWith('docs/theories/')) return 'theory';
  if (path.startsWith('docs/timeline/')) return 'timeline';
  if (path.startsWith('docs/sources/')) return 'source';
  return 'theory';
};

const isLocalRequest = (url: URL) =>
  url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '[::1]';
