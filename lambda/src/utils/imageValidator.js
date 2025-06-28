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
  getFormatFromContentType,
  SUPPORTED_FORMATS
};
