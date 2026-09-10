import {
  articlePath,
  assertReadSecurity,
  assertWriteSecurity,
  decodeBase64,
  encodeBase64,
  getGithubFile,
  githubRequest,
  handleError,
  json,
  listGithubArticles,
  parseArticle,
  sanitizeMeta,
  serializeMarkdown,
  triggerDeploy,
  type ArticlePayload,
  type Env,
} from '../../../_shared/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
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
  } catch (error) {
    return handleError(error);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
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
  } catch (error) {
    return handleError(error);
  }
};

const inferCategory = (path: string) => {
  if (path.startsWith('docs/characters/')) return 'character';
  if (path.startsWith('docs/organizations/')) return 'organization';
  if (path.startsWith('docs/terminology/')) return 'terminology';
  if (path.startsWith('docs/theories/')) return 'theory';
  if (path.startsWith('docs/timeline/')) return 'timeline';
  if (path.startsWith('docs/sources/')) return 'source';
  return 'theory';
};
