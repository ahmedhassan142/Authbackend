import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import Joi from "joi";

// Define the possible user roles as a type
export type UserRole = 'admin' | 'user' | 'moderator'; // Add other roles as needed

export interface IUser extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole; // Added role field
  verified: boolean;
  verificationLinkSent: boolean;
  
  generateAuthToken: () => string;
  isAdmin: () => boolean; // Helper method to check admin status
}

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'user', 'moderator'], 
      default: 'user' 
    },
    verified: { type: Boolean, default: false },
    verificationLinkSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add method to generate auth token with role
userSchema.methods.generateAuthToken = function (): string {
  const token = jwt.sign(
    {
      _id: this._id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role, // Include role in JWT
    },
    process.env.JWTPRIVATEKEY as string,
    { expiresIn: "7d" }
  );
  return token;
};

// Add method to check admin status
userSchema.methods.isAdmin = function (): boolean {
  return this.role === 'admin';
};

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

// Updated validation with role
export const validateRegister = (data: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole; // Optional in registration
}) => {
  const schema = Joi.object({
    firstName: Joi.string().required().label("First Name"),
    lastName: Joi.string().required().label("Last Name"),
    email: Joi.string().email().required().label("Email"),
    password: Joi.string()
      .min(8)
      .max(26)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
      .required()
      .label("Password")
      .messages({
        'string.pattern.base': 'Password must contain at least one lowercase, one uppercase, one number, and one special character'
      }),
    role: Joi.string().valid('admin', 'user', 'moderator').default('user')
  });
  return schema.validate(data);
};

export const validateLogin = (data: { 
  email: string; 
  password: string 
}) => {
  const schema = Joi.object({
    email: Joi.string().email().required().label("Email"),
    password: Joi.string().required().label("Password"),
  });
  return schema.validate(data); 
};

// Add validation for updating user role (admin only)
export const validateRoleUpdate = (data: {
  role: UserRole;
}) => {
  const schema = Joi.object({
    role: Joi.string().valid('admin', 'user', 'moderator').required()
  });
  return schema.validate(data);
};