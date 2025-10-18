const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../../Jwtconfig');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ error: 'Token não fornecido.' });

    const token = authHeader.includes(' ') ? authHeader.split(' ')[1] : authHeader;
    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
}

module.exports = authMiddleware;
