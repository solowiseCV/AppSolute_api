import { PrismaClient, Role } from "@prisma/client";
import { RegisterInput } from "../../interfaces/auth.interfaces";
import {
  BadRequestError,
  DuplicateError,
  InternalServerError,
  NotFoundError,
} from "../../lib/appError";
import bcrypt from "bcryptjs";
import cloudinary from "../../config/cloudinary";

const prisma = new PrismaClient();


export class UserService {
  static async getUsers({
    page = 1,
    limit = 10,
    search = "",
  }: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    try {
      const skip = (page - 1) * limit;

      const users = await prisma.user.findMany({
        where: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
        skip,
        take: limit,
      });

      const totalUsers = await prisma.user.count({
        where: {
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      });

      return {
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new InternalServerError("Unable to fetch users");
    }
  }

  static async getAdmins({ search = "" }: { search?: string }) {
    try {
      const admins = await prisma.user.findMany({
        where: {
          role: {
            in: ["ADMIN", "SUPERADMIN"],
          },
          OR: [
            { fullName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        },
      });
  
      return admins;
    } catch (error) {
      console.error("Error fetching admins:", error);
      throw new InternalServerError("Unable to fetch admins");
    }
  }
  
  static async getUserById(userId: string) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");
  
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          fullName: true,
          nickName: true,
          country: true,
          phone: true,
          gender: true,
          email: true,
          profileImage: true,
          role: true,
          totalScore: true,
          answered: true,
         
         
        },
      });
  
      if (!user) throw new NotFoundError("User not found");
  
      return user;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw new InternalServerError("Unable to fetch user");
    }
  }
  

  static async deleteUser(userId: string) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");

      await prisma.user.delete({ where: { id: userId } });

      return { message: "User deleted successfully" };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new InternalServerError("Unable to delete user");
    }
  }





  static async updateUser(
    userId: string,
    updates: Partial<{
      fullName: string;
      gender: string;
      country: string;
      nickName: string;
      phone: string;
      email: string;
      role: Role;
    }>
  ) {
    try {
      if (!userId) throw new BadRequestError("User ID is required");
  
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundError("User not found");
  
      const { fullName, email, role, gender, country, phone, nickName } = updates;
  
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== userId) {
          throw new DuplicateError("Email already in use");
        }
        updateData.email = email;
      }
      if (role) {
        const validRoles = ["GUEST", "ADMIN", "SUPERADMIN"];
        if (!validRoles.includes(role)) {
          throw new BadRequestError("Invalid role");
        }
        updateData.role = role;
      }
  
      
      if (gender !== undefined) updateData.gender = gender;
      if (country !== undefined) updateData.country = country;
      if (phone !== undefined) updateData.phone = phone;
      if (nickName !== undefined) updateData.nickName = nickName;
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          fullName: true,
          gender: true,
          country: true,
          nickName: true,
          phone: true,
          email: true,
          role: true,
          joined: true,
          profileImage: true,
          updatedAt: true,
        },
      });
  
      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new InternalServerError("Unable to update user");
    }
  }
  

  static async updateProfileImage(userId: string, imageUrl: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { profileImage: imageUrl },
    });
  }
  

}
