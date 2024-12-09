const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) {
        console.log('No token provided');
        return res.status(401).json({ message: "Access denied" });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (verified.exp && currentTimestamp >= verified.exp) {
            console.log('Token expired');
            return res.status(401).json({ message: "Token expired" });
        }
        
        req.user = verified;
        next();
    } catch (error) {
        console.error("Token verification error:", error.message);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authenticateToken };