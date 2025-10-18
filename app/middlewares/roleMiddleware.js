function authorizeRoles(...perfisPermitidos) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Usuário não autenticado.' });
        }

        if (!perfisPermitidos.includes(req.user.role)) {
            return res.status(403).json({ error: 'Acesso negado. Perfil não autorizado.' });
        }

        next();
    };
}

module.exports = authorizeRoles;