#!/bin/bash

# Script de deploiement pour le VPS
echo "🚀 Demarrage du deploiement de la plateforme E-learning..."

# 1. S'assurer qu'on a la derniere version du code (Si le VPS est relie a Git)
# git pull origin main

# 2. Installer les dependances (npm ci est plus sur pour la prod)
echo "📦 Installation des dependances..."
npm install

# 3. Appliquer les migrations de base de donnees et regenerer le client Prisma
echo "🗄️ Mise a jour de la base de donnees..."
npx prisma migrate deploy
npx prisma generate

# 4. Recompiler l'application Next.js avec les nouvelles modifications
echo "🏗️ Compilation du code..."
npm run build

# 5. Redemarrer l'application via PM2 sans coupure (Zero Downtime)
echo "🔄 Redemarrage du serveur..."
pm2 reload school-platform --update-env || pm2 start ecosystem.config.cjs

echo "✅ Deploiement termine avec succes !"
