// import { Request, Response, NextFunction } from "express";
// import AuthService from "../services/auth.service";
// import { generateRefreshToken, generateToken } from "../../../utils/jwt";
// import appResponse from "../../../lib/appResponse";
// import { BadRequestError } from "../../../lib/appError";
// class AuthController {
//   static async register(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { fullName, email, password, profileImage } = req.body;
//       const lowercaseEmail = email.toLowerCase();
//       const newUser = await AuthService.register({
//         fullName,
//         email,
//         profileImage,
//         password,
//       });
//       const { password: _, resetToken, resetTokenExpires, ...rest } = newUser;
//       res.status(201).json(appResponse("User registered successfully", rest));
//     } catch (error) {
//       console.error("Error in register controller:", error);
//       next(error);
//     }
//   }
  

  
//   static async login(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email, password } = req.body;
//       const lowercaseEmail = email.toLowerCase();
//       const { user } = await AuthService.login(lowercaseEmail, password);
  
//       const token = generateToken(user.id);
//       const refreshToken = generateRefreshToken(user.id);
  
     
//       res.setHeader("Authorization", `Bearer ${token}`);
//       res.setHeader("x-refresh-token", refreshToken);
  
//       const { password: _, resetToken, resetTokenExpires, ...rest } = user;
      
//       res.status(200).json({
//         message: "Login successful",
//         user: rest,
//         token, 
//       });
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }
  

//   static async forgotPassword(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { email } = req.body;
//       const lowercaseEmail = email.toLowerCase();
//       const result = await AuthService.forgotPassword(lowercaseEmail);
//       res.send(appResponse("Message:", result));
//     } catch (error) {
//       next(error);
//     }
//   }

//   static async resetPassword(
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<void> {
//     try {
//       const { password, confirmPassword, token } = req.body;

//       if (!token || !password || !confirmPassword)
//         throw new BadRequestError(
//           "OTP, password, and confirm password are required"
//         );

//       if (password !== confirmPassword)
//         throw new BadRequestError("Password and confirm password do not match");

//       const passwordRegex =
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
//       if (!passwordRegex.test(password)) {
//         throw new BadRequestError(
//           "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character"
//         );
//       }
//       const result = await AuthService.resetPassword(
//         token,
//         password,
//         confirmPassword
//       );
//       res.send(appResponse("Password reset successful", result));
//     } catch (error) {
//       console.error("Reset password error:", error);
//       next(error);
//     }
//   }

//   // static async logout(
//   //   req: Request,
//   //   res: Response,
//   //   next: NextFunction
//   // ): Promise<void> {
//   //   try {
//   //     const token = req.cookies?.token;
//   //     if (!token) throw new Error("Token not provided");
//   //     const result = await AuthService.logout(token);
//   //     res.clearCookie("token", { httpOnly: true, secure: true });
//   //     res.send(appResponse("Message:", result));
//   //   } catch (error) {
//   //     next(error);
//   //   }
//   // }

//   static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         throw new Error("Token not provided or malformed token");
//       }
  
//       const token = authHeader.split(" ")[1];
  
//       const result = await AuthService.logout(token);
      
//       res.status(200).json({ message: "Logout successful", data: result });
//     } catch (error) {
//       next(error);
//     }
//   }
  
// }

// export default AuthController;



import { Request, Response, NextFunction } from "express";
import AuthService from "../services/auth.service";

class AuthController {

  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }


  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
         res.status(400).json({ message: "Invalid verification token" });
         return;
      }

      const result = await AuthService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      if (!email || typeof email !== "string") {
        res.status(400).json({ message: "Invalid email address" });
        return;
      }

      const result = await AuthService.resendVerificationEmail(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }


  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

 
  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  
  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword, confirmPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword, confirmPassword);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

 
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const result = await AuthService.logout(token);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await AuthService.findById(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
