const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../expction/invariantError');
const NotFoundError = require('../../expction/notFoundError');
const AuthenticationError = require('../../expction/authenticationsError');
const bcrypt = require('bcrypt');


class UserService {
  constructor() {
    this._pool = new Pool();
  }


  // create new data user
  async addUser ({ username, password, fullname }) {

    // verifikasi data user dengan memanggil class verify
    await this.verifyNewUsername(username);

    // mengirimkan data user ke databse
    const id = "user-" + nanoid(16);
      // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4) RETURNING id',
      values: [id, username, hashedPassword, fullname],
    };
 
    const result = await this._pool.query(query);

    // cek add data user
    if (!result.rows.length) {
      throw new InvariantError('User gagal ditambahkan');
    }

    // mengembalikan id si user
    return result.rows[0].id;
  }

  async verifyNewUsername(username) {

    // mengambil data dari database bedasarkan username
      const query = {
        text: 'SELECT username FROM users WHERE username = $1',
        values: [username],
      };

    // data didapatkan
    const result = await this._pool.query(query);
    
    // jika data tidak ada berarti lolos verify
    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan.')
    }
  }

  async getUserById(userId) {
    
    // meminta data bedasarkan id ke database
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE id = $1',
      values: [userId],
    };

    // data didapatkan
    const result = await this._pool.query(query);
 
    // cek data 
    if (!result.rows.length) {
      throw new NotFoundError('User tidak ditemukan');
    }
    
    // mengembalikan data bedesarkan id
    return result.rows[0];
  }

  // method ini nantinya akan dipakai auhtentications
  async verifyUserCredential(username, password) {

    // query mendapatkan id dan password bedasarkan username
    const query = {
      text: 'SELECT id, password FROM users WHERE username = $1',
      values: [username],
    };

    // mendapatkan data dari databases
    const result = await this._pool.query(query);

    // cek data di 
    if (!result.rows.length) {
      throw new AuthenticationError('!kredensial = pasword dan id tidak ditemukan di database');
    }
    
    // jika data ada akan mendapatkan data dari tabases
    const { id, password: hashedPassword } = result.rows[0];

    // mengembalikan value password yang sudah di hash
    const match = await bcrypt.compare(password, hashedPassword);
    // cek password 
    if (!match) {
      throw new AuthenticationError('Kredensial yang Anda berikan salah');
    }
    return id;

  }

}
module.exports = UserService;
