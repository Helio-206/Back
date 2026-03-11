#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACK_DIR="$ROOT_DIR/.worktrees/develop"

if ! git -C "$ROOT_DIR" show-ref --verify --quiet refs/heads/develop; then
  echo "Branch 'develop' não encontrada localmente. Faça fetch das branches primeiro."
  exit 1
fi

if [ ! -e "$BACK_DIR/.git" ]; then
  echo "Criando worktree local da branch develop em: $BACK_DIR"
  git -C "$ROOT_DIR" worktree add "$BACK_DIR" develop
else
  echo "Worktree da develop já existe em: $BACK_DIR"
fi

if [ ! -f "$BACK_DIR/.env" ] && [ -f "$BACK_DIR/.env.example" ]; then
  echo "Criando .env do backend a partir de .env.example"
  cp "$BACK_DIR/.env.example" "$BACK_DIR/.env"
fi

if [ ! -d "$BACK_DIR/node_modules" ]; then
  echo "Instalando dependências do backend..."
  npm --prefix "$BACK_DIR" install
fi

if grep -R "from 'bcryptjs'" "$BACK_DIR/src" >/dev/null 2>&1; then
  if [ ! -d "$BACK_DIR/node_modules/bcryptjs" ]; then
    echo "Dependência 'bcryptjs' ausente no backend. Instalando compatibilidade local..."
    npm --prefix "$BACK_DIR" install --no-save bcryptjs @types/bcryptjs
  fi
fi

echo "Setup concluído. Backend pronto em $BACK_DIR"
echo "Se necessário, ajuste DATABASE_URL/JWT no arquivo: $BACK_DIR/.env"
