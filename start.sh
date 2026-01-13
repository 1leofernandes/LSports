#!/bin/bash

# Script para rodar backend e frontend em paralelo

echo "🚀 Iniciando LSports..."
echo "📌 Backend em http://localhost:3000"
echo "📌 Frontend em http://localhost:3001"
echo ""

# Rodar backend em background
cd D:\Área\ de\ Trabalho\LSports
npm start &
BACKEND_PID=$!

# Esperar um pouco para o backend iniciar
sleep 3

# Rodar frontend
cd D:\Área\ de\ Trabalho\LSports\client
PORT=3001 npm start

# Cleanup ao encerrar
trap "kill $BACKEND_PID" EXIT
