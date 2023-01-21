const { Pool } = require('pg');
const InvariantError = require('../../expction/invariantError');
 
class AuthenticationsService {
  constructor() {
    this._pool = new Pool();
  }
 
  // method add refreshToken ke database
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };
 
    await this._pool.query(query);
  }

  // method memeriksa token di database
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };
 
    const result = await this._pool.query(query);
 
    if (!result.rows.length) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

    // method mendelete token di database
  async deleteRefreshToken(token) {
    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
 
    await this._pool.query(query);
  }

}
module.exports = AuthenticationsService;