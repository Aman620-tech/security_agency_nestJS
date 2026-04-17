import { MongoClient } from 'mongodb';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/security_agency';

async function initAdminUser() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Check if any user exists
    const userCount = await usersCollection.countDocuments();
    
    if (userCount === 0) {
      console.log('No users found. Creating default admin user...');
      
      const hashedPassword = await bcrypt.hash('12345', 10);
      
      await usersCollection.insertOne({
        fullName: 'System Administrator',
        email: 'padneyaman997@gmail.com',
        username: 'admin',
        password: hashedPassword,
        mobileNumber: '9999999999',
        role: 'director',
        isActive: true,
        permissions: {
          canCreateGuard: true,
          canEditGuard: true,
          canDeleteGuard: true,
          canCreateTender: true,
          canEditTender: true,
          canDeleteTender: true,
          canMarkAttendance: true,
          canGenerateReports: true,
          canManageUsers: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log('✅ Default admin user created successfully!');
      console.log('📋 Login credentials:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log(`✅ ${userCount} users already exist. Skipping initialization.`);
    }
    
  } catch (error) {
    console.error('Error initializing admin user:', error);
  } finally {
    await client.close();
  }
}

initAdminUser();