"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../lib/appError");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const prisma = new client_1.PrismaClient();
class UserService {
    static async getUsers({ page = 1, limit = 10, search = "", }) {
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
        }
        catch (error) {
            console.error("Error fetching users:", error);
            throw new appError_1.InternalServerError("Unable to fetch users");
        }
    }
    static async getUserById(userId) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profileImage: true,
                    nickName: true,
                    gender: true,
                    role: true
                },
            });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            return user;
        }
        catch (error) {
            console.error("Error fetching user by ID:", error);
            throw new appError_1.InternalServerError("Unable to fetch user");
        }
    }
    static async deleteUser(userId) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            await prisma.user.delete({ where: { id: userId } });
            return { message: "User deleted successfully" };
        }
        catch (error) {
            console.error("Error deleting user:", error);
            throw new appError_1.InternalServerError("Unable to delete user");
        }
    }
    static async updateUser(userId, updates) {
        try {
            if (!userId)
                throw new appError_1.BadRequestError("User ID is required");
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user)
                throw new appError_1.NotFoundError("User not found");
            const { fullName, email, password, role, profileImageFile, gender, country, phone, nickName } = updates;
            const updateData = {};
            if (fullName)
                updateData.fullName = fullName;
            if (email) {
                const existingUser = await prisma.user.findUnique({ where: { email } });
                if (existingUser && existingUser.id !== userId) {
                    throw new appError_1.DuplicateError("Email already in use");
                }
                updateData.email = email;
            }
            if (password) {
                const hashedPassword = await bcryptjs_1.default.hash(password, 10);
                updateData.password = hashedPassword;
            }
            if (role) {
                const validRoles = ["GUEST", "ADMIN", "SUPERADMIN"];
                if (!validRoles.includes(role)) {
                    throw new appError_1.BadRequestError("Invalid role");
                }
                updateData.role = role;
                updateData.gender = gender;
                updateData.country = country;
                updateData.phone = phone;
                updateData.nickName = nickName;
            }
            // Upload profile image if provided
            if (profileImageFile) {
                const result = cloudinary_1.default.uploader.upload_stream({ folder: "profile_images" }, (error, result) => {
                    if (error)
                        throw new Error("Error uploading image to Cloudinary");
                    updateData.profileImage = result?.secure_url;
                });
                console.log(result);
                result.end(profileImageFile.buffer);
            }
            console.log("update", updateData);
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
            return updatedUser;
        }
        catch (error) {
            console.error("Error updating user:", error);
            throw new appError_1.InternalServerError("Unable to update user");
        }
    }
}
exports.UserService = UserService;
