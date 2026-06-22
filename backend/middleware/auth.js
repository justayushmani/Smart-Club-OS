const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
      
      if (decoded.isSimulated) {
        req.user = decoded;
        return next();
      }
      
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const requireRole = (rolesArray) => {
  return (req, res, next) => {
    if (!req.user || !rolesArray.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient privileges' });
    }
    next();
  };
};

const requireDeptOrPresident = () => {
  return (req, res, next) => {
    if (!req.user) return res.status(403).json({ message: 'Forbidden: Not logged in' });
    
    // If president, allow. If department lead, allow but resource check happens in route.
    if (req.user.role === 'president' || req.user.role === 'department_lead') {
      return next();
    }
    
    return res.status(403).json({ message: 'Forbidden: Requires Lead or President access' });
  };
};

module.exports = { protect, requireRole, requireDeptOrPresident };
