const ClientError = require('../../expction/clientError');

class PlaylistSongsHandler {
  constructor(service, validator) {
    const {
      playlistsSongsService, songsService, playlistsService,
    } = service;
    this._service = playlistsSongsService;
    this._playlistsService = playlistsService;
    this._songsService = songsService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getPlaylistSongsHandler = this.getPlaylistSongsHandler.bind(this);
    this.deletePlaylistSongsHandler = this.deletePlaylistSongsHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      const { songId } = request.payload;
      const { id: playlistId } = request.params;
      this._validator.validatePlaylistSongsPayload({ playlistId, songId });
      const { id: credentialId } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._songsService.getSongsById(songId);
      const SongId = await this._service.addSongsToPlaylist(playlistId, songId);
      const response = h.response({
        status: 'success',
        message: 'Lagu Playlist berhasil ditambahkan',
        data:
                SongId,
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
      // ==== Untuk Server ERROR ======
      const response = h.response({
        status: 'error',
        message: 'Maaf terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.log(error);
      return response;
    }
  }

  async getPlaylistSongsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { id: playlistId } = request.params;
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      const playlist = await this._playlistsService.getPlaylistsById(playlistId);
      const songs = await this._songsService.getSongsByPlaylistId(playlistId);
      playlist.songs = songs;
      return {
        status: 'success',
        data: {
          playlist,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // ==== Untuk Server ERROR ======
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.log(error);
      return response;
    }
  }

  async deletePlaylistSongsHandler(request, h) {
    try {
      const { id: playlistId } = request.params;
      const { songId } = request.payload;
      this._validator.validatePlaylistSongsPayload({ playlistId, songId });
      const { id: credentialId } = request.auth.credentials;
      await this._playlistsService.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongsFromPlaylist(playlistId, songId);
      return {
        status: 'success',
        message: 'Playlist song berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // ==== Untuk Server ERROR ======
      const response = h.response({
        status: 'fail',
        message: 'Maaf terjadi kegagalan di server kami.',
      });
      response.code(500);
      console.log(error);
      return response;
    }
  }
}

module.exports = PlaylistSongsHandler;
