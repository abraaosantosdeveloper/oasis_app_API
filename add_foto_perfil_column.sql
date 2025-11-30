-- ============================================
-- Script para adicionar coluna foto_perfil
-- Execute este script no seu banco de dados
-- ============================================

-- Adiciona coluna foto_perfil na tabela users
ALTER TABLE users 
ADD COLUMN foto_perfil TEXT NULL 
AFTER email;

-- Verifica se a coluna foi adicionada
DESCRIBE users;
