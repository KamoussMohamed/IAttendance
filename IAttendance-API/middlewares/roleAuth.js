const authorizeRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: 'Forbidden - Role not found' });
        }

        if (allowedRoles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ 
                message: 'Forbidden - Insufficient permissions' 
            });
        }
    };
};

module.exports = authorizeRole;