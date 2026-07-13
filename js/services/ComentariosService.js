import { DataService } from './DataService.js';

export const ComentariosService = {
  getAll() {
    return DataService.getAllCommentsFlat();
  },

  add({ userId, userName, userNick, userImg, texto }) {
    return DataService.addUserComment(userId, texto);
  },

  remove(userId, commentId) {
    return DataService.removeUserComment(userId, commentId);
  },

  update(userId, commentId, newText) {
    return DataService.updateUserComment(userId, commentId, newText);
  },

  getByUser(userId) {
    return DataService.getUserComments(userId);
  }
};
