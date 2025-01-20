import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";
import appResponse from "../../../lib/appResponse";
import { BadRequestError } from "../../../lib/appError";
class AuthController {
  static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { fullName, email, password, profileImage } = req.body;
      const newUser = await AuthService.register({
        fullName,
        email,
        profileImage,
        password,
      });
      res.send(appResponse("User registered successfully", newUser));
    } catch (error) {
      next(error);
      console.log(error);
    }
  }

  static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email, password } = req.body;
      const { user } = await AuthService.login(email, password);

      const token = generateToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      res.status(200).json({ message: "Login successful", token, user });

    } catch (error) {
      console.log(error);
      next(error);
    }
  }

static async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.send(appResponse("Message:", result));
    } catch (error) {
      next(error);
    }
  }

  // static async resetPassword(
  //   req: Request,
  //   res: Response,
  //   next: NextFunction
  // ): Promise<void> {
  //   try {
  //     const { password, otp } = req.body;
  //     if(!otp || !password) throw new BadRequestError("Otp and password are required");
  //     const result = await AuthService.resetPassword(otp, password);
  //     res.send(appResponse("message:", result));
  //   } catch (error) {
  //     console.log(error);
  //     next(error);
  //   }
  // }

  static async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { password, confirmPassword, otp } = req.body;
  
      if (!otp || !password || !confirmPassword) 
        throw new BadRequestError("OTP, password, and confirm password are required");
      
      if (password !== confirmPassword) 
        throw new BadRequestError("Password and confirm password do not match");
    
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        throw new BadRequestError(
          "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character"
        );
      }
      const result = await AuthService.resetPassword(otp, password);
      res.send(appResponse("Password reset successful", result));
    } catch (error) {
      console.error("Reset password error:", error);
      next(error);
    }
  }
  


  static async logout(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const token = req.cookies?.token; 
      if (!token)  throw new Error("Token not provided");
      const result = await AuthService.logout(token);
      res.clearCookie("token", { httpOnly: true, secure: true });
      res.send(appResponse("Message:", result));
    } catch (error) {
      next(error);
    }
  }
  
}

export default AuthController;
