// 获取静态图片
export const getAssetsImages = (fileName: string) => new URL(fileName, import.meta.url).href
