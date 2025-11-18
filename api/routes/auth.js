// ============================================
// Rotas de Autenticação (Login/Signup)
// ============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../utils/db');
const { success, error, validationError, serverError } = require('../utils/responses');
const { validateSignup, validateLogin } = require('../middleware/validation');
const { generateToken } = require('../middleware/auth');

// ============================================
// POST /api/signup - Registro de novo usuário
// ============================================
router.post('/signup', validateSignup, async (req, res) => {
  try {
    const { nome, email, senha, data_nasc, idade, sexo } = req.body;

    // Verifica se email já existe
    const existingUser = await db.query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      return error(res, 'Email já cadastrado');
    }

    // Hash da senha (10 rounds)
    const senhaHash = await bcrypt.hash(senha, 10);

    // Insere usuário
    const result = await db.query(
      `INSERT INTO usuarios (nome, email, senha_hash, data_nasc, idade, sexo) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nome, email, senhaHash, data_nasc || null, idade || null, sexo || null]
    );

    const userId = result.insertId;

    // Cria categorias padrão para o usuário
    const defaultCategories = [
      ['Saúde', '💪', userId],
      ['Estudos', '📚', userId],
      ['Trabalho', '💼', userId],
      ['Pessoal', '🌟', userId],
      ['Fitness', '🏃', userId],
      ['Mindfulness', '🧘', userId]
    ];

    for (const cat of defaultCategories) {
      await db.query(
        'INSERT INTO categorias (nome, emoji, user_id) VALUES (?, ?, ?)',
        cat
      );
    }

    return success(res, {
      message: 'Usuário criado com sucesso',
      usuario: {
        id: userId,
        nome,
        email
      }
    }, 201);

  } catch (err) {
    console.error('Erro no signup:', err);
    return serverError(res, 'Erro ao criar usuário');
  }
});

// ============================================
// POST /api/login - Login de usuário
// ============================================
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Busca usuário por email
    const users = await db.query(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return error(res, 'Email ou senha incorretos');
    }

    const user = users[0];

    // Verifica senha
    const senhaValida = await bcrypt.compare(senha, user.senha_hash);

    if (!senhaValida) {
      return error(res, 'Email ou senha incorretos');
    }

    // Gera token JWT
    const token = generateToken(user);

    // Retorna token e dados do usuário (sem senha)
    return success(res, {
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        data_nasc: user.data_nasc,
        idade: user.idade,
        sexo: user.sexo
      }
    });

  } catch (err) {
    console.error('Erro no login:', err);
    return serverError(res, 'Erro ao fazer login');
  }
});

// ============================================
// PUT /api/users/:id - Atualizar perfil
// ============================================
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, email, data_nasc, idade, sexo, senha } = req.body;

    // Verifica se usuário existe
    const users = await db.query('SELECT * FROM usuarios WHERE id = ?', [id]);
    
    if (users.length === 0) {
      return error(res, 'Usuário não encontrado', 404);
    }

    // Se está alterando email, verifica se não existe outro usuário com esse email
    if (email && email !== users[0].email) {
      const existingEmail = await db.query(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      );

      if (existingEmail.length > 0) {
        return error(res, 'Email já cadastrado');
      }
    }

    // Monta query de atualização
    const updates = [];
    const values = [];

    if (nome) {
      updates.push('nome = ?');
      values.push(nome);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (data_nasc !== undefined) {
      updates.push('data_nasc = ?');
      values.push(data_nasc || null);
    }
    if (idade !== undefined) {
      updates.push('idade = ?');
      values.push(idade || null);
    }
    if (sexo !== undefined) {
      updates.push('sexo = ?');
      values.push(sexo || null);
    }
    if (senha) {
      const senhaHash = await bcrypt.hash(senha, 10);
      updates.push('senha_hash = ?');
      values.push(senhaHash);
    }

    if (updates.length === 0) {
      return error(res, 'Nenhum campo para atualizar');
    }

    values.push(id);

    await db.query(
      `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Busca dados atualizados
    const updatedUser = await db.query(
      'SELECT id, nome, email, data_nasc, idade, sexo FROM usuarios WHERE id = ?',
      [id]
    );

    return success(res, {
      message: 'Perfil atualizado com sucesso',
      usuario: updatedUser[0]
    });

  } catch (err) {
    console.error('Erro ao atualizar perfil:', err);
    return serverError(res, 'Erro ao atualizar perfil');
  }
});

module.exports = router;