/** Keep a resize-service failure from hiding an otherwise valid image. */
export async function fetchWithImageFallback(request, env, ctx, handler) {
  const url = new URL(request.url);
  const canFallback = ['GET', 'HEAD'].includes(request.method)
    && url.pathname.replace(/\/$/, '') === '/_next/image'
    && env.IMAGES !== undefined;

  let response;
  try {
    response = await handler.fetch(request, env, ctx);
  } catch (error) {
    if (!canFallback) throw error;
    console.warn('Image optimization failed; retrying with the original image', error);
    return handler.fetch(request, { ...env, IMAGES: undefined }, ctx);
  }

  if (!canFallback || response.status < 500) return response;
  console.warn('Image optimization returned a server error; retrying with the original image', response.status);
  // OpenNext still validates source URLs and image types with IMAGES disabled.
  // Image protection has already run in custom-worker.ts and remains enforced.
  await response.body?.cancel();
  return handler.fetch(request, { ...env, IMAGES: undefined }, ctx);
}
