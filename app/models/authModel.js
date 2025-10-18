const pool = require('../../config.js');

const Auth = {
    getUserByEmail: async (email) => {
        const res = await pool.query(
            `SELECT 
                u.id_usuario, 
                u.nome, 
                u.email, 
                u.senha, 
                p.nome_perfil AS role
             FROM usuario u
             JOIN perfil p ON u.id_perfil = p.id_perfil
             WHERE u.email = $1`,
            [email]
        );
        return res.rows[0];
    }
};

module.exports = Auth;
