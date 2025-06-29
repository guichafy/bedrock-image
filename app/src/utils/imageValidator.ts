export const SUPPORTED_FORMATS = ['gif', 'jpeg', 'png', 'webp'] as const;

export function isValidPng(bytes: Buffer): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

export function isValidImageFormat(bytes: Buffer): boolean {
  if (bytes.length < 8) return false;

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return true;
  }

  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }

  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }

  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes.length > 11 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return true;
  }

  return false;
}

export function detectImageFormat(bytes: Buffer): string {
  if (bytes.length < 4) return 'png';

  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'png';
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'gif';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes.length > 11 && bytes[8] === 0x57) return 'webp';
  return 'png';
}

export function getFormatFromContentType(contentType?: string): string {
  if (!contentType) return 'png';
  if (contentType.includes('image/')) {
    const type = contentType.split('/')[1];
    if (SUPPORTED_FORMATS.includes(type as any)) return type;
  }
  return 'png';
}
