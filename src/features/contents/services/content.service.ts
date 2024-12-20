import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class ContentService {
  /**
   * Create new content
   */
  async createContent(body: string, description: string) {
    try {
      if (!body || !description) {
        throw { statusCode: 400, message: "Body and description are required" };
      }

      const content = await prisma.content.create({
        data: { body, description },
      });

      return content;
    } catch (error: any) {
      throw ContentService.formatError(error);
    }
  }

  /**
   * Get all content
   */
  async getAllContent() {
    try {
      const contents = await prisma.content.findMany();
      return contents;
    } catch (error: any) {
      throw ContentService.formatError(error);
    }
  }

  /**
   * Get a single content by ID
   */
  async getContentById(id: string) {
    try {
      const content = await prisma.content.findUnique({
        where: { id },
      });

      if (!content) {
        throw { statusCode: 404, message: "Content not found" };
      }

      return content;
    } catch (error: any) {
      throw ContentService.formatError(error);
    }
  }

  /**
   * Update content by ID
   */
  async updateContent(id: string, body: string, description: string) {
    try {
      if (!body || !description) {
        throw { statusCode: 400, message: "Body and description are required" };
      }

      const updatedContent = await prisma.content.update({
        where: { id },
        data: { body, description },
      });

      return updatedContent;
    } catch (error: any) {
      throw ContentService.formatError(error);
    }
  }

  /**
   * Delete content by ID
   */
  async deleteContent(id: string) {
    try {
      const deletedContent = await prisma.content.delete({
        where: { id },
      });

      return deletedContent;
    } catch (error: any) {
      throw ContentService.formatError(error);
    }
  }

  /**
   * Format and normalize errors
   */
  private static formatError(error: any) {
    if (error.statusCode && error.message) {
      return error;
    }

    console.error("Unexpected error:", error);
    return { statusCode: 500, message: "An unexpected error occurred" };
  }
}

export default new ContentService();
