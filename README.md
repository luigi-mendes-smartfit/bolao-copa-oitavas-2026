# 🏆 Bolão Copa 2026 — Oitavas de Final · Smart Fit

Dashboard ao vivo do bolão interno das **oitavas de final** da Copa do Mundo 2026 entre colaboradores (e convidados) da Smart Fit. Página única, sem servidor, que lê os palpites e resultados direto de uma planilha Google e atualiza sozinha.

### 🔗 [Acessar o dashboard](https://luigi-mendes-smartfit.github.io/bolao-copa-oitavas-2026/)

---

## ⚽ Sobre

16 seleções, 8 jogos. Cada participante palpita, em cada jogo, **quem passa para as quartas**, o **placar** e o **período + minuto do primeiro gol**. Os dados saem de um Google Forms → planilha Google (pontuação em Apps Script) → planilha pública (espelho) → site. Tudo roda no navegador, hospedado de graça no GitHub Pages, com atualização automática a cada 5 minutos.

## ✨ Funcionalidades

- 🏅 **Ranking ao vivo** — pontuação ordenada com desempates. **Clique em um participante** para ver o detalhamento jogo a jogo: o palpite dele × o resultado real, com os pontos de placar, classificação e minuto do 1º gol (inclusive distinguindo "período errado" de "período certo, mas outro chegou mais perto").
- ⚽ **Jogos** — cada jogo abre um popup com **quem votou em cada seleção** (e o placar que cada um chutou) e **todos os palpites do 1º gol** agrupados por período, destacando o gol real.
- 🗺️ **Chaveamento** — estilo mata-mata, com placar e classificados das oitavas se preenchendo conforme o Gabarito é lançado, e as datas/horários de cada fase.
- 📊 **Estatísticas** — participantes, arrecadação, média de gols palpitada, favorito de cada jogo.
- 📋 **Regras** — sistema de pontuação atualizado.
- 🔄 **Auto-refresh** a cada 5 minutos.

---

## 📋 Regras de pontuação

Por jogo, a pontuação soma **eixos independentes**:

### Placar (tempo normal + prorrogação, sem pênaltis)

| Acerto | Pontos |
|--------|--------|
| Placar cravado | **5** |
| Acertou o resultado (vitória A / vitória B / empate) | **3** |
| Errou | **0** |

### Classificação (independente do placar)

| Acerto | Pontos |
|--------|--------|
| Acertou quem passa para as quartas | **+3** |

> Se o jogo for aos pênaltis, o placar oficial é **empate** — dá pra pontuar o empate **e** somar os +3 da classificação.

### Minuto do 1º gol

| Acerto | Pontos |
|--------|--------|
| Cravou o minuto (período certo) | **5** |
| Ninguém cravou → mais próximo(s) no período certo | **3** |
| Errou o período | **0** |
| Jogo 0x0 e marcou "Sem gol" | **5** |

A proximidade é **relativa entre os participantes válidos** e exige acertar o **período** primeiro (1ºT, 2ºT, prorrogação). Empates na menor distância pontuam para todos.

**Máximo por jogo: 13 pts** (5 + 3 + 5) · **Total: 104 pts** (8 jogos).

### Desempate

1. Maior número de **cravadas** (placares cravados + minutos cravados).
2. Quem **enviou o formulário primeiro**.

### Premiação

🥇 50% · 🥈 30% · 🥉 20% — arrecadação = nº de participantes × R$ 20,00.

---

## 🏗️ Arquitetura

```
Google Forms ──> Planilha MASTER (privada)              Planilha PÚBLICA (espelho)
                 ├─ Respostas (palpites + e-mail)        ├─ Palpites (sem e-mail) ─┐
                 ├─ Gabarito (resultados reais)     ==>  ├─ Gabarito              ├─> index.html (GitHub Pages)
                 ├─ Pontuação (motor em Apps Script)     ├─ Pontuação             │      lê via gviz (JSON)
                 ├─ Ranking                              └─ Ranking              ─┘
                 └─ Controle (status / dedupe)
```

- A **master** é privada (tem e-mails) e roda toda a lógica de pontuação em Apps Script (`master.gs`).
- A **pública** é "qualquer pessoa com link: leitor" e só espelha nome + palpites + pontos via `QUERY(IMPORTRANGE(...))` — sem e-mail, sem celular.
- O **site** consome a pública pelo endpoint **gviz** (`/gviz/tq?...`), sem API key.

### Regras de integridade (na master)

- **Dedupe por e-mail:** vale sempre a **última** resposta de cada e-mail (as anteriores não pontuam).
- **Aba Controle:** status por e-mail (Pago / Pendente / Eliminado / Teste). "Eliminado" e "Teste" saem do ranking. Palpites inválidos também não entram na disputa de proximidade do minuto.

---

## 📂 Estrutura do repositório

```
.
├── index.html                 # o dashboard inteiro (HTML + CSS + JS, single-file)
├── apps-scripts/
│   ├── forms.gs               # gera o Google Forms + planilha + abertura/fechamento automático
│   ├── master.gs              # planilha privada: pontuação, Gabarito via API, Controle/dedupe
│   └── publica.gs             # planilha pública: espelhos via IMPORTRANGE
└── README.md
```

> Os `.gs` rodam dentro do editor de Apps Script de cada planilha (Extensões → Apps Script), não a partir do GitHub. **Nenhuma chave de API fica nos arquivos** — ela é digitada no editor e guardada nas Propriedades do Projeto.

---

## 🚀 Configuração

### 1. Formulário (`forms.gs`)

Cria o Google Forms com as 9 seções (dados + 8 jogos), cria e vincula a planilha de respostas, monta o Gabarito e agenda a abertura (08h) e o fechamento (14h) automáticos. Ajuste o bloco `CONFIG`/`JOGOS` e rode as funções indicadas no topo do arquivo.

### 2. Master (`master.gs`) — na planilha de respostas

1. Extensões → Apps Script → cole `master.gs`.
2. `configurarMaster()` → cria Pontuação, Ranking e Controle.
3. `criarGatilhoRecalculo()` → recalcula ao editar o Gabarito.
4. Resultados: `SETUP_API_KEY()` (key da football-data.org) → `atualizarGabarito()` preenche placar + quem passou; `criarGatilhoGabarito()` roda a cada 2h. **Período/minuto do 1º gol são manuais** (colunas E e F do Gabarito).

### 3. Pública (`publica.gs`) — em uma planilha nova

1. Crie a planilha, compartilhe como **"Qualquer pessoa com o link: Leitor"**.
2. Cole `publica.gs`, rode `SETUP_PUBLICA()` (ID da master + nome da aba de respostas) e `configurarPublica()`.
3. Abra a aba **Gabarito** e clique em **"Permitir acesso"** no aviso do `IMPORTRANGE` (autoriza 1x, vale pras 4 abas).

### 4. Dashboard (`index.html`)

1. Em `SPREADSHEET_ID`, coloque o ID da planilha **pública**.
2. Publique no GitHub Pages (Settings → Pages → branch `main`, `/root`). O repositório precisa ser **público**.

---

## 🛠️ Operação durante os jogos

`atualizarGabarito()` (ou o gatilho de 2h) traz placar e quem passou → você completa o **período e o minuto do 1º gol** no Gabarito → a Pontuação/Ranking recalculam e a pública/site atualizam sozinhos. O dado oficial da **FIFA prevalece**: o Gabarito é editável, então qualquer divergência é só corrigir na célula.

---

## 🧰 Tecnologias

HTML, CSS e JavaScript puro (single-page, sem build) · Google Sheets via **gviz** · Google Apps Script · [football-data.org](https://www.football-data.org/) (resultados) · GitHub Pages.

---

## 🔒 Privacidade

A planilha pública **não** expõe e-mails nem celulares — só nome, unidade, palpites e pontos. A master, com os dados sensíveis, permanece privada.

---

<div align="center">

**SMART FIT** · Bolão Copa 2026 — Oitavas de Final · feito com ⚽ e 💛

</div>