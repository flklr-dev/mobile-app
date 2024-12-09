const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    
    if (!token) return res.status(403).json({ message: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        const currentTimestamp = Math.floor(Date.now() / 1000);
        if (verified.exp && currentTimestamp >= verified.exp) {
            return res.status(401).json({ message: "Token expired" });
        }
        
        req.user = verified;
        next();
    } catch (error) {
        console.error("Token error:", error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authenticateToken };
