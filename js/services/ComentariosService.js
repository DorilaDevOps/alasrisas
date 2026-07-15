import { DataService } from './DataService.js';

export const ComentariosService = {
  async getAll() {
    return DataService.getAllCommentsFlat();
  },

  async add({ userId, userName, userNick, userImg, texto }) {
    return DataService.addUserComment(userId, texto);
  },

  async remove(userId, commentId) {
    return DataService.removeUserComment(userId, commentId);
  },

  async update(userId, commentId, newText) {
    return DataService.updateUserComment(userId, commentId, newText);
  },

  async getByUser(userId) {
    return DataService.getUserComments(userId);
  }
};
