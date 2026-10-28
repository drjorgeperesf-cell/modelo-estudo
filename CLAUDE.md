# CLAUDE.md

Guia para o Claude Code ao trabalhar neste repositório.

## O que é
App web estático de estudo (questões, flashcards, aulas, desempenho). Sem build, sem dependências, sem backend.
O progresso vive no `localStorage` (`js/progresso.js`). O conteúdo vem de `data/*.json`.

## Primeiros passos (quando a pessoa abrir esta pasta pela primeira vez)
1. Pergunte qual é o assunto (ex.: teste de inglês, concurso, certificação), quantas questões, cartões e aulas ela quer, e a cor preferida.
2. Troque `data/` pelo conteúdo dela: `config.json` primeiro (nome, cor, áreas), depois questões, cartões, aulas e plano.
3. Rode `python tools/validar.py`, depois `python servir.py` e confira no navegador. Mostre o que mudou em poucas linhas.
4. Ideias de próximos passos, uma por vez e só se ela pedir: simulado cronometrado, importar questões de uma planilha CSV,
   filtro por tema, embaralhar alternativas, publicar no Vercel (`vercel --prod`).

## Regras
- Para mudar de assunto, edite só `data/` e `data/config.json` (nome, cor, áreas). Depois rode `python tools/validar.py` (código 1 = erro).
- Não adicione frameworks, bundlers nem `npm install` ao app. Python só stdlib.
- `id` de questão, cartão e aula é estável: o progresso usa o id. Não renumere conteúdo que já existe.
- `gabarito` é o índice da alternativa certa (0 = primeira).
- Toda pessoa que abrir o site vê `data/`: nada secreto ali (chaves, gabaritos de prova sigilosa, dados pessoais).
- Só use conteúdo que você tem direito de publicar (próprio, licença livre, ou domínio público).
- Mudou o código das telas? Rode `python servir.py 8765` e, se tiver Playwright, `node tools/testar-navegador.cjs`.

## Comandos
```
python servir.py            # http://localhost:8000
python tools/validar.py     # confere data/
```
