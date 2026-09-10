import { assertAdmin, createCsrfToken, csrfCookie, handleError, json, type Env } from '../../_shared/admin';

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const identity = await assertAdmin(request, env);
    const csrf = createCsrfToken();
    return json({ email: identity.email, csrf }, 200, { 'set-cookie': csrfCookie(csrf) });
  } catch (error) {
    return handleError(error);
  }
};
