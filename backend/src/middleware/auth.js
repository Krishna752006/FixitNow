import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Professional from '../models/Professional.js';

// Generate JWT token
export const generateToken = (userId, userType = 'user') => {
  return jwt.sign(
    { 
      userId, 
      userType 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRE || '7d' 
    }
  );
};

// Verify JWT token middleware
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies (if using cookie-based auth)
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user based on userType
      let user;
      if (decoded.userType === 'professional') {
        user = await Professional.findById(decoded.userId).select('-password');
      } else {
        user = await User.findById(decoded.userId).select('-password');
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user not found.',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account has been deactivated.',
        });
      }

      // Add user to request object
      req.user = user;
      req.userType = decoded.userType;
      next();

    } catch (tokenError) {
      if (tokenError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired.',
        });
      } else if (tokenError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token.',
        });
      } else {
        throw tokenError;
      }
    }

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
    });
  }
};

// Alias for authenticate for backward compatibility
export const authenticateToken = authenticate;

// Middleware to check if user is a specific type
export const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate first.',
      });
    }

    if (!userTypes.includes(req.userType)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required user type: ${userTypes.join(' or ')}`,
      });
    }

    next();
  };
};

// Middleware to check if professional is verified
export const requireVerifiedProfessional = (req, res, next) => {
  if (req.userType !== 'professional') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Professional account required.',
    });
  }

  if (req.user.verificationStatus !== 'verified') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Professional verification required.',
    });
  }

  next();
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        let user;
        if (decoded.userType === 'professional') {
          user = await Professional.findById(decoded.userId).select('-password');
        } else {
          user = await User.findById(decoded.userId).select('-password');
        }

        if (user && user.isActive) {
          req.user = user;
          req.userType = decoded.userType;
        }
      } catch (tokenError) {
        // Token is invalid, but we don't fail - just continue without user
        console.log('Optional auth - invalid token:', tokenError.message);
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next(); // Continue without authentication
  }
};
