import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { executeQuery } from '../config/db';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ msg: 'Please enter all fields' });
  }

  try {
    // 1. Fetch user and their hashed password from the database
    const query = `
      SELECT Name, EmailAddress, Designation, Role, PasswordHash
      FROM [SmartBoxData].[LASIMRA_StaffDetails_SMO] 
      WHERE EmailAddress = @email
    `;
    
    const users = await executeQuery(query, { email });
    const user = users.length > 0 ? users[0] : null;

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare the provided password with the hashed password in the DB
    if (!user.PasswordHash) {
       console.warn(`User ${email} found but has no PasswordHash.`);
       return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.PasswordHash);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Create payload
    const userPayload = {
      user: {
        id: user.EmailAddress,
        name: user.Name,
        role: user.Role || 'PUBLIC'
      }
    };

    // 4. Sign Access Token
    const accessToken = jwt.sign(
      userPayload,
      (process.env.JWT_ACCESS_SECRET as string) || 'secret123',
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as any }
    );

    // 5. Sign Refresh Token
    const refreshToken = jwt.sign(
      userPayload,
      (process.env.JWT_REFRESH_SECRET as string) || 'refresh_secret123',
      { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '24h') as any }
    );

    res.json({ 
      accessToken, 
      refreshToken, 
      user: userPayload.user 
    });
    
  } catch (err: any) {
    console.error("Login Error:", err.message);
    res.status(500).send('Server Error');
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Get new access token using refresh token
 * @access  Public
 */
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ msg: 'No refresh token, authorization denied' });
  }

  try {
    const decoded: any = jwt.verify(
      refreshToken, 
      (process.env.JWT_REFRESH_SECRET as string) || 'refresh_secret123'
    );

    // Create new access token
    const userPayload = {
      user: decoded.user
    };

    const accessToken = jwt.sign(
      userPayload,
      (process.env.JWT_ACCESS_SECRET as string) || 'secret123',
      { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '1h') as any }
    );

    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ msg: 'Refresh token is not valid' });
  }
});

export default router;
