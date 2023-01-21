const { SongsPayloadSchema } = require('./schema');
const InvariantError = require('../../expction/invariantError');

const songsValidator = {
  validateSongsPayload: (payload) => {
    const validationResult = SongsPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = songsValidator;