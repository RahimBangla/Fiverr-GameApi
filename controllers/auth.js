const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.get("Authorization");
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, "kwi9owl");
        
    }
    catch(err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        return res.status(500).json({ message: "Authentication Failed!" });
    }
    req.playerId = decodedToken.playerId;
    next();
}