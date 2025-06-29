export function decodeBase64(data: string): Buffer {
  return Buffer.from(data, 'base64');
}
