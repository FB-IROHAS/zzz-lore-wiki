import {
  assertReadSecurity,
  assertWriteSecurity,
  handleError,
  HttpError,
  json,
  safeImageCategory,
  safeImageKey,
  type Env,
} from '../../../_shared/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
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
  } catch (error) {
    return handleError(error);
  }
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
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
  } catch (error) {
    return handleError(error);
  }
};
