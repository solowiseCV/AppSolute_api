import { PostCategory, PrismaClient } from "@prisma/client";
import { PostData, UpdatePostData } from "../../../interfaces/post.interface";
import { BadRequestError } from "../../../lib/appError";

const prisma = new PrismaClient();

class PostService {
  static async createPost(userId: string, postData: PostData) {
    const {
      title,
      imageUrl,
      description,
      category,
      contributors,
      isPublished,
    } = postData;

    if (!title || !description || !imageUrl) {
      throw new BadRequestError("Title, description and imageUrl are required");
    }

    const validCategories: PostCategory[] = [
      "AI",
      "TECHNOLOGY",
      "MARKETING",
      "DESIGN",
      "SOFTWARE",
    ];

    const sanitizedCategory = category?.trim().toUpperCase() as PostCategory;

    const postCategory: PostCategory = validCategories.includes(
      sanitizedCategory
    )
      ? sanitizedCategory
      : "TECHNOLOGY";

    try {
      const post = await prisma.post.create({
        data: {
          title,
          description,
          category: postCategory,
          authorId: userId,
          imageUrl,
          contributors,
          isPublished,
        },
      });
      return post;
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async getAllPosts(publishedOnly: boolean = true) {
    try {
      return await prisma.post.findMany({
        where: publishedOnly ? { isPublished: true } : undefined,
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async getPostById(postId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        include: {
          author: { select: { id: true, fullName: true, email: true } },
        },
      });

      if (!post) throw { statusCode: 404, message: "Post not found" };

      return post;
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async updatePost(
    postId: string,
    userId: string,
    updateData: UpdatePostData
  ) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });

      if (!post) throw { statusCode: 404, message: "Post not found" };
      if (post.authorId !== userId)
        throw {
          statusCode: 403,
          message: "Not authorized to update this post",
        };

      return await prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
    } catch (error) {
      throw PostService.formatError(error);
    }
  }

  static async deletePost(postId: string, userId: string) {
    try {
      const post = await prisma.post.findUnique({ where: { id: postId } });
      if (!post) throw { statusCode: 404, message: "Post not found" };

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw { statusCode: 404, message: "User not found" };

      if (user.role !== "ADMIN" && post.authorId !== userId) {
        throw {
          statusCode: 403,
          message: "Not authorized to delete this post",
        };
      }
      // First, delete all comments related to the post
      await prisma.comment.deleteMany({
        where: { postId: postId },
      });
      await prisma.post.delete({ where: { id: postId } });
      return { message: "Post deleted successfully" };
    } catch (error) {
      console.log(error);
      throw PostService.formatError(error);
    }
  }

  private static formatError(error: any) {
    if (error.statusCode && error.message) return error;
    return { statusCode: 500, message: "An unexpected error occurred" };
  }
}

export default PostService;
