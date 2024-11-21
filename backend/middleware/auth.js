const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]; // Ensure 'Bearer' is removed
    console.log("Received token:", req.header("Authorization"));
    if (!token) return res.status(403).json({ message: "Access denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        res.status(401).json({ message: "Invalid token" });
    }
};


module.exports = { verifyToken };
