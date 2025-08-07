import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/usermodel.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

interface JwtPayload {
  _id: string;
}

interface ProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role:string;
}

interface UpdateProfileBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const profileController = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY as string) as JwtPayload;
    const user = await User.findById(decoded._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const response: ProfileResponse = {
       _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role:user.role
    };

    res.json(response);
  } catch (err) {
    console.error('Profile error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

export const profileUpdate = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Authorization required" });
    }

    const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY as string) as JwtPayload;
    const { firstName, lastName, email, currentPassword, newPassword } = req.body as UpdateProfileBody;

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    // Password change logic
    if (currentPassword && newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }
      
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return res.status(400).json({ error: "Both current and new password are required to change password" });
    }

    await user.save();
    
    // Return updated user data
    const response: ProfileResponse = {
       _id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role:user.role
    };

    res.json(response);
  } catch (err) {
    console.error('Update profile error:', err);
    if (err instanceof jwt.JsonWebTokenError) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};