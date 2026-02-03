import bcryptjs from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { AdminCreateUserDTO, CreateUserDTO, LoginUserDTO, UpdateUserDTO } from "../dtos/user.dto";
import { UserRepository } from "../repositories/user.repository";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET, JWT_EXPIRES_IN, BCRYPT_SALT_ROUNDS } from "../config";
import { IUser } from "../models/user.model";

const userRepository = new UserRepository();

export class UserService {
  private sanitizeUser(user: IUser) {
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    if ((userObj as any)._id) {
      (userObj as any)._id = String((userObj as any)._id);
      if (!(userObj as any).id) {
        (userObj as any).id = (userObj as any)._id;
      }
    }
    delete (userObj as any).password;
    return userObj;
  }

  async createUser(data: CreateUserDTO) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const usernameCheck = await userRepository.getUserByUsername(data.name);
    if (usernameCheck) {
      throw new HttpError(409, "Username already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);
    data.password = hashedPassword;

    const newUser = await userRepository.createUser(data);

    return this.sanitizeUser(newUser as IUser);
  }

  async createUserFromAdmin(data: AdminCreateUserDTO & { image?: string }) {
    const emailCheck = await userRepository.getUserByEmail(data.email);
    if (emailCheck) {
      throw new HttpError(409, "Email already in use");
    }

    const usernameCheck = await userRepository.getUserByUsername(data.name);
    if (usernameCheck) {
      throw new HttpError(409, "Username already in use");
    }

    const hashedPassword = await bcryptjs.hash(data.password, BCRYPT_SALT_ROUNDS);

    const newUser = await userRepository.createUser({
      ...data,
      password: hashedPassword,
    });

    return this.sanitizeUser(newUser as IUser);
  }

  async loginUser(data: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(data.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(data.password, user.password);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    return { token, user: this.sanitizeUser(user as IUser) };
  }

  async getAllUsers() {
    const users = await userRepository.getAllUsers();
    return users.map((user) => this.sanitizeUser(user as IUser));
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    return this.sanitizeUser(user as IUser);
  }

  async updateUserById(id: string, updateData: UpdateUserDTO & { image?: string }) {
    if (updateData.password) {
      updateData.password = await bcryptjs.hash(updateData.password, BCRYPT_SALT_ROUNDS);
    }

    const cleanedData = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    ) as UpdateUserDTO & { image?: string };

    const updatedUser = await userRepository.updateUser(id, cleanedData);
    if (!updatedUser) {
      throw new HttpError(404, "User not found");
    }

    return this.sanitizeUser(updatedUser as IUser);
  }

  async deleteUserById(id: string) {
    const deleted = await userRepository.deleteUser(id);
    if (!deleted) {
      throw new HttpError(404, "User not found");
    }

    return true;
  }
}