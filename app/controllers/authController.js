const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Auth = require('../models/authModel.js');
const { jwtSecret, jwtExpiresIn } = require('../../Jwtconfig.js');
const pool = require('../../config.js');

const AuthController = {
    login: async (req, res) => {
        try {
            const { email, senha } = req.body;

            if (!email || !senha) {
                return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
            }

            // Busca o usuário pelo email
            const user = await Auth.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
            }

            // Compara a senha informada com a senha criptografada
            let senhaValida;
            if (user.senha.startsWith('$2')) {
                // Senha já está em hash
                senhaValida = await bcrypt.compare(senha, user.senha);
            } else {
                // Senha em texto puro
                senhaValida = senha === user.senha;

                // Migração gradual: converte para hash no banco se a senha estiver correta
                if (senhaValida) {
                    const hash = await bcrypt.hash(senha, 10);
                    await pool.query(
                        'UPDATE usuario SET senha = $1 WHERE id_usuario = $2',
                        [hash, user.id_usuario]
                    );
                }
            }

            if (!senhaValida) {
                return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
            }

            // Gera o token JWT
            const token = jwt.sign(
                { id: user.id_usuario, role: user.role },
                jwtSecret,
                { expiresIn: jwtExpiresIn }
            );

            // Retorna o token e dados básicos
            res.json({
                message: 'Login realizado com sucesso!',
                token,
                user: {
                    id: user.id_usuario,
                    name: user.nome,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({ error: 'Erro interno no servidor.', details: error.message });
        }
    }
};

module.exports = AuthController;
