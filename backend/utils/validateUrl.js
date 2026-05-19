// Utility to validate URLs using the built-in URL constructor
export const validateUrl = (urlStr) => {
  try {
    const newUrl = new URL(urlStr);
    return newUrl.protocol === 'http:' || newUrl.protocol === 'https:';
  } catch (err) {
    return false;
  }
};
