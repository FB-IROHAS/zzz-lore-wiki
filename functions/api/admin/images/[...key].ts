import {
  assertWriteSecurity,
  handleError,
  HttpError,
  json,
  validateStoredImageKey,
  type Env,
} from '../../../_shared/admin';

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  try {
    await assertWriteSecurity(request, env);
    if (!env.ADMIN_IMAGES_BUCKET) throw new HttpError(500, 'R2 bucket is not configured');
    const raw = Array.isArray(params.key) ? params.key.join('/') : String(params.key ?? '');
    const key = validateStoredImageKey(raw);
    await env.ADMIN_IMAGES_BUCKET.delete(key);
    return json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
};
