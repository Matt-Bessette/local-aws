export const getPathFromUrl = (url: string) => {

  try {
    const obj = new URL(url);
    return obj.pathname;
  } catch (err) {}

  return url;
}
