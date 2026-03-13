import express from 'express';
import jwt from 'jsonwebtoken';
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
    // 1. Check if user exists in StaffDetails table (Mock logic for password checking)
    // In production, you would fetch the user's hashed password and compare it with bcrypt
    const query = `
      SELECT Name, EmailAddress, Designation, Role 
      FROM [SmartBoxData].[LASIMRA_StaffDetails_SMO] 
      WHERE EmailAddress = @email
    `;
    
    // Attempting query. For now, we will handle mock fallback since the DB might not be connected locally yet.
    let user;
    try {
        const users = await executeQuery(query, { email });
        user = users.length > 0 ? users[0] : null;
    } catch(err) {
        console.warn("Database connection issue. Using mock user for development.");
        // Mock user fallback for testing UI without real DB connection
        if (email === 'admin@lasimra.gov.ng' && password === 'admin') {
            user = { Name: 'Admin User', EmailAddress: email, Role: 'ADMIN' };
        } else if (email === 'analyst@lasimra.gov.ng' && password === 'analyst') {
            user = { Name: 'Analyst User', EmailAddress: email, Role: 'ANALYST' };
        }
    }

    if (!user) {
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Mock password check. If it were real, you'd do: 
    // const isMatch = await bcrypt.compare(password, user.passwordHash)
    // if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' })

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
    console.error(err.message);
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
