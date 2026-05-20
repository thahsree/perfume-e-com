import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/user.repository";

export const AuthService = {
  async register(email: string, passwordPlain: string, name: string) {
    const existing = await UserRepository.getByEmail(email);
    if (existing) {
      throw new Error("Email is already registered.");
    }
    
    // Hash password with 10 rounds
    const passwordHash = bcrypt.hashSync(passwordPlain, 10);
    return await UserRepository.create({
      email,
      passwordHash,
      name,
    });
  },

  async verifyCredentials(email: string, passwordPlain: string) {
    const user = await UserRepository.getByEmail(email);
    if (!user) {
      return null;
    }

    const match = bcrypt.compareSync(passwordPlain, user.passwordHash);
    if (!match) {
      return null;
    }

    // Exclude password hash before returning
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
