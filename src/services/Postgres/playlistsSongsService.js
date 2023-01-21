const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../expction/invariantError');
const NotFoundError = require('../../expction/notFoundError');

class PlaylistsSongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongsToPlaylist(playlistId, songId) {
    const id = `playlistssongs-${nanoid(16)}`;
    const result = await this._pool.query({
      text: 'INSERT INTO playlistssongs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    });
    if (!result.rows[0].id) {
      throw new InvariantError('Song dalam playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteSongsFromPlaylist(playlistId, songId) {
    const result = await this._pool.query({
      text: 'DELETE FROM playlistssongs WHERE playlist_id = $1 AND song_id = $2 RETURNING id',
      values: [playlistId, songId],
    });
    if (!result.rows.length) {
      throw new NotFoundError('Song dalam Playlist gagal dihapus. Id tidak ditemukan');
    }
  }
}

module.exports = PlaylistsSongsService;