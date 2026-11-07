// routes/commentRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authMiddleware');

router.use(authenticateToken);

router.get('/', commentController.getComments);
router.post('/', commentController.createComment);
router.delete('/:id', commentController.deleteComment);

module.exports = router;
