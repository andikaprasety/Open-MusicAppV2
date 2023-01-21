const Jwt = require('@hapi/jwt');
const InvariantError = require('../../src/expction/invariantError');
 
const TokenManager = {
  // membuat token
  generateAccessToken: (payload) => Jwt.token.generate(payload, process.env.ACCESS_TOKEN_KEY),
  // membuat refreshToken
  generateRefreshToken: (payload) => Jwt.token.generate(payload, process.env.REFRESH_TOKEN_KEY),

  // mengecek apakah refreshtoken sudah benar
  verifyRefreshToken: (refreshToken) => {
    try {
      const artifacts = Jwt.token.decode(refreshToken);
      Jwt.token.verifySignature(artifacts, process.env.REFRESH_TOKEN_KEY);
      const { payload } = artifacts.decoded;

      // nilai payload akan digunakan untuk membuat akses token baru
      return payload;
    } catch (error) {
      throw new InvariantError('Refresh token tidak valid');
    }
  },
};
 
module.exports = TokenManager;