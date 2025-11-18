-- ============================================
-- OASIS Habit Tracker - MySQL Database Schema
-- ============================================

-- Criar banco de dados (se necessário)
-- CREATE DATABASE IF NOT EXISTS oasis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE oasis;

-- ============================================
-- Tabela de Usuários
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    data_nasc DATE NULL,
    idade INT NULL,
    sexo VARCHAR(50) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Categorias
-- ============================================
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    emoji VARCHAR(10) NOT NULL DEFAULT '📌',
    user_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Hábitos
-- ============================================
CREATE TABLE IF NOT EXISTS habitos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NULL,
    categoria INT NOT NULL,
    repetir BOOLEAN DEFAULT FALSE,
    tipo_repeticao ENUM('diario', 'semanal', 'mensal') NULL,
    completado BOOLEAN DEFAULT FALSE,
    proxima_data DATE NULL,
    user_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (categoria) REFERENCES categorias(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_categoria (categoria),
    INDEX idx_proxima_data (proxima_data)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Tabela de Diário (Journal)
-- ============================================
CREATE TABLE IF NOT EXISTS diario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conteudo TEXT NOT NULL,
    data DATE NOT NULL,
    user_id INT NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_user_id_data (user_id, data),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Inserir Categorias Padrão (opcional)
-- ============================================
-- Essas categorias serão criadas automaticamente para cada usuário
-- quando ele se registrar (implementado no código)

-- Exemplo de categorias:
-- INSERT INTO categorias (nome, emoji, user_id) VALUES
-- ('Saúde', '💪', 1),
-- ('Estudos', '📚', 1),
-- ('Trabalho', '💼', 1),
-- ('Pessoal', '🌟', 1),
-- ('Fitness', '🏃', 1),
-- ('Mindfulness', '🧘', 1);

-- ============================================
-- Verificar estrutura criada
-- ============================================
-- SHOW TABLES;
-- DESCRIBE usuarios;
-- DESCRIBE categorias;
-- DESCRIBE habitos;
-- DESCRIBE diario;