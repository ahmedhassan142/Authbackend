"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileUpdate = exports.profileController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const usermodel_js_1 = require("../models/usermodel.js");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const profileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Authorization token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWTPRIVATEKEY);
        const user = yield usermodel_js_1.User.findById(decoded._id).select('-password');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const response = {
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };
        res.json(response);
    }
    catch (err) {
        console.error('Profile error:', err);
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.profileController = profileController;
const profileUpdate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: "Authorization required" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWTPRIVATEKEY);
        const { firstName, lastName, email, currentPassword, newPassword } = req.body;
        const user = yield usermodel_js_1.User.findById(decoded._id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        // Update basic info
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (email)
            user.email = email;
        // Password change logic
        if (currentPassword && newPassword) {
            if (newPassword.length < 6) {
                return res.status(400).json({ error: "Password must be at least 6 characters" });
            }
            const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ error: "Current password is incorrect" });
            }
            const salt = yield bcryptjs_1.default.genSalt(10);
            user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        }
        else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({ error: "Both current and new password are required to change password" });
        }
        yield user.save();
        // Return updated user data
        const response = {
            _id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
        };
        res.json(response);
    }
    catch (err) {
        console.error('Update profile error:', err);
        if (err instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(403).json({ error: "Invalid or expired token" });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.profileUpdate = profileUpdate;
