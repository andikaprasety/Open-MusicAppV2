const { AlbumsPayloadSchema } = require('./schema');
const InvariantError = require('../../expction/invariantError');

const albumsValidator = {
  validateAlbumsPayload: (payload) => {
    const validationResult = AlbumsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = albumsValidator;