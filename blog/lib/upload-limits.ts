export const maxImageUploadBytes = 5 * 1024 * 1024;
export const maxImageUploadMegabytes = Math.round(maxImageUploadBytes / (1024 * 1024));

export function formatUploadLimit() {
  return `${maxImageUploadMegabytes} Mo`;
}
