const ClientError = require('../../expction/clientError');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
  }
 
  async postUserHandler(request, h) {
    try {

      //cek data yang dikirim user sesuai
      this._validator.validateUserPayload(request.payload);

      // ambil data dari req.payload
      const { username, password, fullname } = request.payload;

      // mengirimkan data user ke file service
      const userId = await this._service.addUser({ username, password, fullname });
 
      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId,
        },
      });
      response.code(201);
      return response;
      
    } catch (error) {

      //error handle
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }
        // Server ERROR!
        const response = h.response({
          status: 'error',
          message: 'Maaf, terjadi kegagalan pada server kami.',
        });
        response.code(500);
        console.error(error);
        return response;
    }
  }

  async getUserByIdHandler(request, h) {
    try {
      
      const { id } = request.params;
 
      const user = await this._service.getUserById(id);
 
      return {
        status: 'success',
        data: {
          user,
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
 
      // server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}
module.exports = UsersHandler;
