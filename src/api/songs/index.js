const Songshandler = require('./handler');
const routes = require('./routeSongs');

module.exports = {
  name: 'songs',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const newSongsHandler = new Songshandler(service, validator);
    server.route(routes(newSongsHandler));
  },
};