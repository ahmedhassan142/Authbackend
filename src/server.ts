import userroute from "./routes/userroute"
const express=require('express')
import dotenv from 'dotenv'
import mongoose from 'mongoose'


import cors from 'cors'

dotenv.config()

const app=express()
app.use(cors({
    origin: process.env.FRONTEND_URL, // Allow requests from Next.js frontend
    credentials: true,
     exposedHeaders: ['service-secret'], // Allows browser to read this header
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'service-secret', // Allows client to send this header
        'Cookie',
        'Set-Cookie'
    ],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    maxAge: 86400
  }));
app.use(express.json())
const mongooseuri=process.env.MONGODB_URI||"";
mongoose
.connect(mongooseuri)
.then(()=>console.log("Server connected to database"))
.catch((error:any)=>console.log("failed to connect server"))

app.use('/api/auth',userroute);

app.listen(3012,()=>console.log("Server connected to Port 3012"))
// db.users.updateMany({}, { $set: { role: 'user' } })
// const ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL || 'admin@example.com';
// const ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || 'Password123!';
// async function runMigration() {
//   try {
//     console.log('Starting migration...');
    
//     // Connect to MongoDB
//     await mongoose.connect(mongooseuri);
//     console.log('Connected to MongoDB');

//     // Step 1: Add role field to all existing users
//     const updateResult = await mongoose.connection.collection('users').updateMany(
//       { role: { $exists: false } }, // Only update documents without role field
//       { $set: { role: 'user' } } // Set default role
//     );
//     console.log(`Updated ${updateResult.modifiedCount} users with default role`);

//     // Step 2: Create initial admin user if doesn't exist
//     const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
    
//     if (!existingAdmin) {
//       const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
//       const adminUser = new User({
//         firstName: 'Admin',
//         lastName: 'User',
//         email: ADMIN_EMAIL,
//         password: hashedPassword,
//         role: 'admin',
//         verified: true,
//         verificationLinkSent: true
//       });

//       await adminUser.save();
//       console.log('Initial admin user created:', ADMIN_EMAIL);
//     } else {
//       // Ensure existing admin has the correct role
//       if (existingAdmin.role !== 'admin') {
//         existingAdmin.role = 'admin';
//         await existingAdmin.save();
//         console.log('Updated existing user to admin role:', ADMIN_EMAIL);
//       } else {
//         console.log('Admin user already exists:', ADMIN_EMAIL);
//       }
//     }

//     console.log('Migration completed successfully');
//     process.exit(0);
    
//   } catch (error) {
//     console.error('Migration failed:', error);
//     process.exit(1);
//   }
// }

// runMigration();