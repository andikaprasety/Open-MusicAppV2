const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

// songs
const songs = require('./api/songs');
const SongsService = require('./services/dbPostgres/songsService');
const validatorSongs = require('./src/validator/songsValidate');

// albums
const albums = require('./api/albums')
const AlbumsService = require ('./services/dbPostgres/albumService')
const albumsValidator = require ('./validator/albums')

// users
const users = require('./src/api/Users');
const UsersService = require('./services/dbPostgres/usersService');
const userValidator = require('./validator/Users');

// playlist
const playlist = require('./api/Playlist');
const PlaylistsService = require('./services/dbPostgres/playlistsService');
const playlistValidator = require('./validator/Playlist')

//authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/dbPostgres/authenticationsService');
const TokenManager = require('./Tokenize/tokenManeger');
const AuthenticationsValidator = require('./validator/Authentications');

//Collaborations
const CollaborationsService = require('./services/dbPostgres/collaborationsService');

// PlaylistSongs
const playlistSongs = require('./api/PlaylistSongs');
const PlaylistsSongsService = require('./services/dbPostgres/playlistsSongsService');
const PlaylistSongsValidator = require('./validator/PlaylistsSongsValidator');

require('dotenv').config();

const init = async () => {
  const albumsService  = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistsSongsService = new PlaylistsSongsService()
  const server = Hapi.server({
    host: process.env.HOST,
    port: process.env.PORT,
    routes: true,
  });

    // registrasi plugin eksternal
    await server.register([
      {
        plugin: Jwt,
      },
    ]);
   
    // mendefinisikan strategy autentikasi jwt
    server.auth.strategy('openmusic_jwt', 'jwt', {
      keys: process.env.ACCESS_TOKEN_KEY,
      verify: {
        aud: false,
        iss: false,
        sub: false,
        maxAgeSec: process.env.ACCESS_TOKEN_AGE,
      },
      validate: (artifacts) => ({
        isValid: true,
        credentials: {
          id: artifacts.decoded.payload.id,
        },
      }),
    });

  await server.register([{
    plugin: albums,
    options: {
      service: albumsService,
      validator: albumsValidator,
    },
  },
  {
    plugin: songs,
    options: {
      service: songsService,
      validator: validatorSongs,
    },
  },
  {
    plugin: users,
    options: {
      service: usersService,
      validator: userValidator,
    },
  },
  {
    plugin: playlist,
    options: {
      service: playlistsService,
      validator: playlistValidator,
    },
  },
  {
    plugin: authentications,
    options: {
      authenticationsService,
      usersService,
      tokenManager: TokenManager,
      validator: AuthenticationsValidator,
    },
  },
  {
    plugin: playlistSongs,
    options: {
      service: {
        playlistsSongsService,
          songsService,
          playlistsService,
        },
        validator: PlaylistSongsValidator,
    },
  },

  ]);
  await server.start();
  console.log(`Server Berjalan pada ${server.info.uri}`);
};
init();