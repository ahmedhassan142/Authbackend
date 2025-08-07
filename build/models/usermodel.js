"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRoleUpdate = exports.validateLogin = exports.validateRegister = exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const joi_1 = __importDefault(require("joi"));
const userSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// Add method to generate auth token with role
userSchema.methods.generateAuthToken = function () {
    const token = jsonwebtoken_1.default.sign({
        _id: this._id,
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        role: this.role, // Include role in JWT
    }, process.env.JWTPRIVATEKEY, { expiresIn: "7d" });
    return token;
};
// Add method to check admin status
userSchema.methods.isAdmin = function () {
    return this.role === 'admin';
};
exports.User = mongoose_1.default.model("User", userSchema);
// Updated validation with role
const validateRegister = (data) => {
    const schema = joi_1.default.object({
        firstName: joi_1.default.string().required().label("First Name"),
        lastName: joi_1.default.string().required().label("Last Name"),
        email: joi_1.default.string().email().required().label("Email"),
        password: joi_1.default.string()
            .min(8)
            .max(26)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
            .required()
            .label("Password")
            .messages({
            'string.pattern.base': 'Password must contain at least one lowercase, one uppercase, one number, and one special character'
        }),
        role: joi_1.default.string().valid('admin', 'user', 'moderator').default('user')
    });
    return schema.validate(data);
};
exports.validateRegister = validateRegister;
const validateLogin = (data) => {
    const schema = joi_1.default.object({
        email: joi_1.default.string().email().required().label("Email"),
        password: joi_1.default.string().required().label("Password"),
    });
    return schema.validate(data);
};
exports.validateLogin = validateLogin;
// Add validation for updating user role (admin only)
const validateRoleUpdate = (data) => {
    const schema = joi_1.default.object({
        role: joi_1.default.string().valid('admin', 'user', 'moderator').required()
    });
    return schema.validate(data);
};
exports.validateRoleUpdate = validateRoleUpdate;
