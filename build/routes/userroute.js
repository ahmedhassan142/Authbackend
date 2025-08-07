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
const express = require("express");
const registercontroller_js_1 = __importDefault(require("../controllers/registercontroller.js"));
const logincontroller_js_1 = __importDefault(require("../controllers/logincontroller.js"));
const verfiyemail_js_1 = require("../controllers/verfiyemail.js");
const profilecontroller_js_1 = require("../controllers/profilecontroller.js");
const profilecontroller_js_2 = require("../controllers/profilecontroller.js");
const usermodel_js_1 = require("../models/usermodel.js");
const protect_js_1 = require("../middleware/protect.js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const router = express.Router();
router.post("/register", registercontroller_js_1.default);
router.post("/login", logincontroller_js_1.default);
// router.get("/:id/verify/:token", verifyEmail);
router.get("/profile", profilecontroller_js_1.profileController);
router.get("/verify", verfiyemail_js_1.verifyEmail);
router.put("/profile/update", profilecontroller_js_2.profileUpdate);
// In your auth routes
router.post('/logout', (req, res) => {
    try {
        res.clearCookie('authToken', {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/'
        });
        res.status(200).json({ message: 'Logged out successfully' });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Logout failed' });
    }
});
// auth middleware
const SERVICE_SECRET = process.env.SERVICE_SECRET;
const verifyServiceSecret = (req, res, next) => {
    const secret = req.headers['service-secret'];
    console.log('Received request for user:', req.params.userId); // Add this
    console.log('Headers:', req.headers);
    if (secret !== SERVICE_SECRET) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
};
// Auth Service (app.ts)
router.post("/verify-token", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token } = req.body;
        const userData = yield (0, protect_js_1.protect)({ cookies: { authToken: token } });
        res.json({ valid: true, user: userData });
    }
    catch (error) {
        res.json({ valid: false });
    }
}));
// route handler
router.get('/internal/:userId', verifyServiceSecret, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usermodel_js_1.User.findById(req.params.userId).select('email');
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ email: user.email });
    }
    catch (error) {
        console.error('Error fetching user email:', error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, search } = req.query;
        const query = {};
        if (category)
            query.category = category;
        if (search)
            query.$text = { $search: search };
        const users = yield usermodel_js_1.User.find(query);
        return res.json({
            success: true,
            data: users
        });
    }
    catch (error) {
        console.error('Error fetching products:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
}));
// In your Auth Service (backend)
router.get('/basic/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usermodel_js_1.User.findById(req.params.userId)
            .select('firstName lastName email');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield usermodel_js_1.User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            success: true,
            data: user
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}));
// Middleware
exports.default = router;
