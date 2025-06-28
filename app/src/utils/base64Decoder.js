function decodeBase64(data) {
  return Buffer.from(data, 'base64');
}

module.exports = { decodeBase64 };
