import { Request, Response } from "express";
import { Types } from "mongoose";
import { UserService } from "../services/user.service";
import { AdminCreateUserDTO, UpdateUserDTO } from "../dtos/user.dto";

const userService = new UserService();

export class AdminController {
  async createUser(req: Request, res: Response) {
    try {
      const parsedData = AdminCreateUserDTO.safeParse(req.body);

      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const imagePath = req.file ? `uploads/${req.file.filename}` : undefined;

      const newUser = await userService.createUserFromAdmin({
        ...parsedData.data,
        image: imagePath,
      });

      return res.status(201).json({
        success: true,
        message: "User created",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async listUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const userId = String(req.params.id);
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }
      const user = await userService.getUserById(userId);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const parsedData = UpdateUserDTO.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: parsedData.error,
        });
      }

      const imagePath = req.file ? `uploads/${req.file.filename}` : undefined;

      const userId = String(req.params.id);
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }
      const updatedUser = await userService.updateUserById(userId, {
        ...parsedData.data,
        image: imagePath,
      });

      return res.status(200).json({
        success: true,
        message: "User updated",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      const userId = String(req.params.id);
      if (!Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user id",
        });
      }
      await userService.deleteUserById(userId);
      return res.status(200).json({
        success: true,
        message: "User deleted",
      });
    } catch (error: any) {
      return res.status(error.statusCode ?? 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
