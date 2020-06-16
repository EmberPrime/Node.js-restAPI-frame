const crypto = require('crypto');

exports.md5 = (str, encoding = 'utf8') => crypto.createHash('md5').update(str, encoding).digest('hex');