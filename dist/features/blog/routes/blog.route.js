"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_controller_1 = __importDefault(require("../controllers/blog.controller"));
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const multer_1 = __importDefault(require("multer"));
const comment_controller_1 = require("../../comments/comment.controller");
const like_contoller_1 = require("../../like/like.contoller");
const updatePost_validator_1 = require("../../../validators/updatePost.validator");
const commentController = new comment_controller_1.CommentController();
const likeController = new like_contoller_1.LikeController();
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post("/", auth_middleware_1.default, upload.single("file"), blog_controller_1.default.createPost);
router.get("/", blog_controller_1.default.getAllPosts);
router.get("/:id", blog_controller_1.default.getPostById);
router.delete("/:id", auth_middleware_1.default, blog_controller_1.default.deletePost);
router.patch("/:id", auth_middleware_1.default, updatePost_validator_1.validateUpdatePost, blog_controller_1.default.updatePost);
router.post("/:postId/comment", auth_middleware_1.default, commentController.createComment);
router.get("/:postId/comment", auth_middleware_1.default, commentController.getCommentsByPostId);
router.put("/:postId/comment", auth_middleware_1.default, commentController.updateComment);
router.delete("/:postId/comment", auth_middleware_1.default, commentController.deleteComment);
router.post("/:postId/like", auth_middleware_1.default, likeController.like);
router.delete("/:postId/unlike", auth_middleware_1.default, likeController.unlike);
exports.default = router;
