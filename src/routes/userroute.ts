const express=require("express")
import  registercontroller from '../controllers/registercontroller.js';

import  logincontroller  from '../controllers/logincontroller.js';
import { verifyEmail } from '../controllers/verfiyemail.js';
import  {profileController}  from '../controllers/profilecontroller.js';
import { profileUpdate } from '../controllers/profilecontroller.js';
import { Request,Response } from 'express';
import { NextFunction } from 'express';
import { User } from 'src/models/usermodel.js';
import { protect } from 'src/middleware/protect.js';
import dotenv from 'dotenv';
dotenv.config()

const router = express.Router();

router.post("/register", registercontroller);
router.post("/login", logincontroller);
// router.get("/:id/verify/:token", verifyEmail);
router.get("/profile", profileController);

router.get("/verify", verifyEmail);
router.put("/profile/update", profileUpdate);

// In your auth routes
router.post('/logout', (req:Request, res:Response) => {
  try {
    res.clearCookie('authToken', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      path: '/'
    });
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});
// auth middleware
const SERVICE_SECRET = process.env.SERVICE_SECRET 
const verifyServiceSecret = (req: Request, res: Response, next: NextFunction) => {
  const secret = req.headers['service-secret'];
   console.log('Received request for user:', req.params.userId); // Add this
  console.log('Headers:', req.headers); 
  if (secret !== SERVICE_SECRET) {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};
// Auth Service (app.ts)
router.post("/verify-token", async (req:Request,res:Response)=>{
  try {
    const { token } = req.body;
    const userData = await protect({ cookies: { authToken: token } });
    res.json({ valid: true, user: userData });
  } catch (error) {
    res.json({ valid: false });
  }
});

// route handler
router.get('/internal/:userId', verifyServiceSecret, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('email');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ email: user.email });
  } catch (error) {
    console.error('Error fetching user email:', error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    const query: any = {};
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search as string };

    const users = await User.find(query);

    return res.json({
      success: true,
      data: users
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch products'
    });
  }
});
// In your Auth Service (backend)
router.get('/basic/:userId', async (req:Request, res:Response) => {
  try {
    const user = await User.findById(req.params.userId)
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
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/:userId', async (req:Request, res:Response) => {
  try {
    const user = await User.findById(req.params.userId)
      
      
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
  success:true,
  data:user
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Middleware


export default router;