const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../expction/invariantError');
const { mapDBToModelSongs } = require('../../util/songsDb');
const NotFoundError = require('../../expction/notFoundError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongs({ title, year, genre, performer, duration }) {
    const id = nanoid(16);

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, "albumId"],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT * FROM songs');
    return result.rows.map(mapDBToModelSongs);
  }

  async getSongsById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModelSongs)[0];
  }

  async editSongsById(id, { title, year, genre, performer, duration }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, "albumId", id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }
  }

  async deleteSongsById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Catatan gagal dihapus. Id tidak ditemukan');
    }
  }

  async getSongsByPlaylistId(playlistId) {
    const result = await this._pool.query({
      text: `SELECT songs.id, songs.title, songs.performer FROM songs 
                LEFT JOIN playlistssongs ON playlistssongs.song_id = songs.id 
                WHERE playlistssongs.playlist_id = $1`,
      values: [playlistId],
    });
    return result.rows;
  }
}

module.exports = SongsService;