#!/bin/sh
# EFCwork — monta e roda todas as suítes (regressão). Uso: sh tools/rodar-tudo.sh
set -e
cd "$(dirname "$0")/.."
python3 tools/montar.py
for t in tools/testes/t_*.js; do echo "== $t"; node "$t"; done
