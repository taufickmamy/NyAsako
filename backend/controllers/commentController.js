const commentService = require('../services/commentService');
const { sendSuccess } = require('../utils/response');

const getComments = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const comments = await commentService.getTaskComments(taskId, req.workspaceId);
    return sendSuccess(res, 200, 'Commentaires récupérés avec succès.', comments);
  } catch (error) {
    next(error);
  }
};

const createComment = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const comment = await commentService.addComment(
      taskId, req.user.id, content, req.app.get('socketio'), req.workspaceId
    );
    return sendSuccess(res, 201, 'Commentaire ajouté avec succès.', comment);
  } catch (error) {
    next(error);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const { taskId, id } = req.params;
    await commentService.removeComment(taskId, id, req.user, req.workspaceId);
    return sendSuccess(res, 200, 'Commentaire supprimé avec succès.', null);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
