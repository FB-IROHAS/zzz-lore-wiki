import {
  articlePath,
  assertReadSecurity,
  assertWriteSecurity,
  decodeBase64,
  encodeBase64,
  getGithubFile,
  githubRequest,
  handleError,
  HttpError,
  json,
  parseArticle,
  sanitizeMeta,
  serializeMarkdown,
  triggerDeploy,
  validateCategory,
  validateSlug,
  type ArticlePayload,
  type Env,
} from '../../../../_shared/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await assertReadSecurity(request, env);
    const category = validateCategory(params.category);
    const slug = validateSlug(params.slug);
    const path = articlePath(category, slug);
    const file = await getGithubFile(env, path);
    return json({ article: parseArticle(path, decodeBase64(file.content), file.sha) });
  } catch (error) {
    return handleError(error);
  }
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await assertWriteSecurity(request, env);
    const currentCategory = validateCategory(params.category);
    const currentSlug = validateSlug(params.slug);
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
  } catch (error) {
    return handleError(error);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await assertWriteSecurity(request, env);
    const category = validateCategory(params.category);
    const slug = validateSlug(params.slug);
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
  } catch (error) {
    return handleError(error);
  }
};
