const SUPPORTED_FORMATS = ['gif', 'jpeg', 'png', 'webp'];

function isValidPng(bytes) {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function isValidImageFormat(bytes) {
  if (bytes.length < 8) return false;
  
  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }
  
  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }
  
  // GIF: 47 49 46
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return true;
  }
  
  // WebP: 52 49 46 46 (RIFF) + WebP signature
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes.length > 11 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return true;
  }
  
  return false;
}

function detectImageFormat(bytes) {
  if (bytes.length < 4) return 'png';
  
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return 'png';
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) return 'jpeg';
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return 'gif';
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes.length > 11 && bytes[8] === 0x57) return 'webp';
  return 'png'; // fallback
}

function getFormatFromContentType(contentType) {
  if (!contentType) return 'png';
  if (contentType.includes('image/')) {
    const type = contentType.split('/')[1];
    if (SUPPORTED_FORMATS.includes(type)) return type;
  }
  return 'png';
}

module.exports = {
  isValidPng,
  isValidImageFormat,
  detectImageFormat,
  getFormatFromContentType,
  SUPPORTED_FORMATS
};
