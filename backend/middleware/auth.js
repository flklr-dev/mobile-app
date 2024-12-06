const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    console.log("Received token:", req.header("Authorization"));
    
    if (!token) return res.status(403).json({ message: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if token is expired
        if (verified.exp && Date.now() >= verified.exp * 1000) {
            return res.status(401).json({ message: "Token expired" });
        }
        
        req.user = verified;
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = { authenticateToken };
