// 🏆 BOLÃO COPA 2026 — OITAVAS · SMART FIT · MASTER (motor de pontuação)
// ============================================================
// Rode na planilha PRIVADA (a vinculada às respostas do Forms).
//
// COMO USAR:
// 1) Extensões > Apps Script > cole este arquivo.
// 2) Rode  configurarMaster()   → cria abas Pontuação e Ranking.
// 3) Rode  criarGatilhoRecalculo()  → recalcula sozinho quando você
//    edita o Gabarito (lançar resultados) ou chega resposta.
// 4) Preencha o Gabarito conforme os jogos terminam. A pontuação atualiza.
//
// REGRAS (por jogo, cumulativas):
//   PLACAR (tempo normal + prorrogação, sem pênaltis):
//     • placar exato      → 5
//     • acertou resultado → 3   (vitória A / vitória B / empate)
//     • errou             → 0
//   CLASSIFICAÇÃO (quem passa, independente):  +3 se acertou, senão 0
//   1º GOL (período + minuto):
//     • cravou minuto (período certo)      → 5   (vários podem cravar)
//     • ninguém cravou → mais próximo(s)   → 3
//     • errou o período                    → 0
//     • jogo 0x0: quem marcou "Sem gol"    → 5
//   Máx por jogo = 5 + 3 + 5 = 13   →   8 jogos = 104
//   Desempate: 1) nº de cravadas (placar 5 + minuto 5)  2) quem enviou antes
// ============================================================

var NJOGOS = 8;
var PRIMEIRA_LINHA = 2;   // respostas começam na linha 2 (linha 1 = cabeçalho)
var MAX_PART = 300;       // capacidade de participantes

// Colunas fixas da aba de respostas
var C_TIMESTAMP = 1, C_EMAIL = 2, C_NOME = 3, C_CELULAR = 4, C_UNIDADE = 5, C_CONFIRMO = 6;

// Colunas de um jogo g (0..7) na aba de respostas: 5 colunas por jogo a partir de G(7)
function colsJogo_(g) {
  var base = 7 + g * 5;
  return { quem: base, golsA: base + 1, golsB: base + 2, periodo: base + 3, minuto: base + 4 };
}

// ============================================================
function configurarMaster() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resp = abaRespostas_(ss);
  if (!resp) { Logger.log('❌ Não achei a aba de respostas do Forms.'); return; }
  criarPontuacao_(ss);
  criarRanking_(ss);
  recalcular();
  Logger.log('✅ Master configurado. Abas: Pontuação, Ranking, Controle.');
  Logger.log('📋 Controle: marque o Valter como "Teste"; quem não pagar até 06/07, "Eliminado".');
  Logger.log('   (Duplicadas do mesmo e-mail já são descartadas sozinhas — vale a última.)');
  Logger.log('👉 Rode criarGatilhoRecalculo() para recalcular automático.');
}

function abaRespostas_(ss) {
  var sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName();
    if (n.indexOf('Form') > -1 || n.indexOf('Response') > -1 ||
        (n.indexOf('Resposta') > -1 && n.indexOf('Gabarito') === -1)) return sheets[i];
  }
  return null;
}

// ===== LEITURA DO GABARITO =====
function lerGabarito_(ss) {
  var gab = ss.getSheetByName('Gabarito');
  var out = [];
  for (var g = 0; g < NJOGOS; g++) {
    var row = 3 + g;
    var golsA = gab.getRange(row, 2).getValue();
    var golsB = gab.getRange(row, 3).getValue();
    var quem  = gab.getRange(row, 4).getValue();
    var per   = gab.getRange(row, 5).getValue();
    var min   = gab.getRange(row, 6).getValue();
    // jogo "resolvido" para placar/classe quando gols preenchidos; para minuto quando período preenchido
    out.push({
      temPlacar: (golsA !== '' && golsA !== null && golsB !== '' && golsB !== null),
      temQuem: (quem !== '' && quem !== null),
      temMinuto: (per !== '' && per !== null),
      golsA: toNum_(golsA), golsB: toNum_(golsB), quem: norm_(quem), periodo: per, minuto: min
    });
  }
  return out;
}

// ===== VALOR NUMÉRICO DO MINUTO (para proximidade) =====
// Retorna {semGol:bool, periodo:string, val:number|null}
function valorMinuto_(periodo, minuto) {
  var p = ('' + (periodo || ''));
  if (p.indexOf('Sem gol') > -1) return { semGol: true, periodo: 'SEMGOL', val: null };
  var m = ('' + (minuto == null ? '' : minuto));
  if (m.indexOf('Não se aplica') > -1) return { semGol: true, periodo: 'SEMGOL', val: null };
  var extra = p.indexOf('Prorrogação') > -1;
  var v;
  if (m.indexOf('Acréscimo') > -1 || m.indexOf('Acrescimo') > -1) v = extra ? 16 : 46;
  else { v = toNum_(minuto); if (extra && v > 15) v = 16; }
  return { semGol: false, periodo: p, val: v };
}

// ===== CÁLCULO PRINCIPAL =====
function recalcular() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var resp = abaRespostas_(ss);
  var pts = ss.getSheetByName('Pontuação') || criarPontuacao_(ss);
  if (!ss.getSheetByName('Ranking')) criarRanking_(ss);
  var gabarito = lerGabarito_(ss);

  var lastRow = resp.getLastRow();
  var nPart = Math.max(0, lastRow - PRIMEIRA_LINHA + 1);
  if (nPart <= 0) { Logger.log('ℹ️ Sem respostas.'); return; }

  // Lê todas as respostas de uma vez
  var dados = resp.getRange(PRIMEIRA_LINHA, 1, nPart, 46).getValues();

  // Estrutura de participantes
  // IMPORTANTE: mantém 1 entrada por linha de resposta (mesma ordem/índice das
  // abas Palpites e Pontuação). Linhas sem nome são pontuadas 0 e filtradas do Ranking.
  var parts = [];
  for (var i = 0; i < nPart; i++) {
    var row = dados[i];
    var jogos = [];
    for (var g = 0; g < NJOGOS; g++) {
      var c = colsJogo_(g);
      jogos.push({
        quem: norm_(row[c.quem - 1]),
        golsA: row[c.golsA - 1], golsB: row[c.golsB - 1],
        periodo: row[c.periodo - 1], minuto: row[c.minuto - 1]
      });
    }
    parts.push({
      idx: i, nome: norm_(row[C_NOME - 1]), email: norm_(row[C_EMAIL - 1]), unidade: row[C_UNIDADE - 1],
      timestamp: row[C_TIMESTAMP - 1], jogos: jogos,
      placar: new Array(NJOGOS).fill(0), classe: new Array(NJOGOS).fill(0), minuto: new Array(NJOGOS).fill(0)
    });
  }

  // ---- Dedupe por e-mail (vale a última) + Controle (Teste/Eliminado) ----
  // ANTES de pontuar: palpites INVÁLIDOS não podem entrar na disputa do minuto.
  aplicarControleEDedupe_(ss, parts);

  // ---- Pontua placar + classificação (só VÁLIDOS; inválidos ficam 0) ----
  for (var p = 0; p < parts.length; p++) {
    if (!parts[p].valido) continue;
    for (var g = 0; g < NJOGOS; g++) {
      var real = gabarito[g], pj = parts[p].jogos[g];
      // Placar
      if (real.temPlacar) {
        var pa = toNum_(pj.golsA), pb = toNum_(pj.golsB);
        if (pj.golsA !== '' && pj.golsA !== null) {
          if (pa === real.golsA && pb === real.golsB) parts[p].placar[g] = 5;
          else if (sinal_(pa - pb) === sinal_(real.golsA - real.golsB)) parts[p].placar[g] = 3;
          else parts[p].placar[g] = 0;
        }
      }
      // Classificação
      if (real.temQuem && pj.quem) parts[p].classe[g] = (pj.quem === real.quem) ? 3 : 0;
    }
  }

  // ---- Pontua minuto do 1º gol (proximidade relativa; SÓ entre VÁLIDOS) ----
  for (var g = 0; g < NJOGOS; g++) {
    var real = gabarito[g];
    if (!real.temMinuto) continue;
    var realVM = valorMinuto_(real.periodo, real.minuto);

    if (realVM.semGol) {
      // jogo 0x0: quem (válido) marcou "Sem gol" crava 5
      for (var p = 0; p < parts.length; p++) {
        parts[p].minuto[g] = 0;
        if (!parts[p].valido) continue;
        var vm = valorMinuto_(parts[p].jogos[g].periodo, parts[p].jogos[g].minuto);
        if (vm.semGol) parts[p].minuto[g] = 5;
      }
      continue;
    }

    // candidatos = VÁLIDOS no MESMO período do gol real (período errado = 0)
    var cand = [];
    for (var p = 0; p < parts.length; p++) {
      parts[p].minuto[g] = 0;
      if (!parts[p].valido) continue;
      var vm = valorMinuto_(parts[p].jogos[g].periodo, parts[p].jogos[g].minuto);
      if (!vm.semGol && vm.periodo === realVM.periodo) cand.push({ p: p, dist: Math.abs(vm.val - realVM.val) });
    }
    if (!cand.length) continue; // ninguém válido no período certo → ninguém pontua
    var exatos = cand.filter(function (c) { return c.dist === 0; });
    if (exatos.length) {
      cand.forEach(function (c) { parts[c.p].minuto[g] = (c.dist === 0) ? 5 : 0; });
    } else {
      var minDist = Math.min.apply(null, cand.map(function (c) { return c.dist; }));
      cand.forEach(function (c) { parts[c.p].minuto[g] = (c.dist === minDist) ? 3 : 0; });
    }
  }

  // ---- Totais e desempates (inválidos zerados na Pontuação) ----
  for (var p = 0; p < parts.length; p++) {
    var P = parts[p];
    if (!P.valido) {
      for (var g = 0; g < NJOGOS; g++) { P.placar[g] = 0; P.classe[g] = 0; P.minuto[g] = 0; }
      P.total = 0; P.cravPlacar = 0; P.cravMinuto = 0; P.cravadas = 0;
      continue;
    }
    var total = 0, cravPlacar = 0, cravMinuto = 0;
    for (var g = 0; g < NJOGOS; g++) {
      total += P.placar[g] + P.classe[g] + P.minuto[g];
      if (P.placar[g] === 5) cravPlacar++;
      if (P.minuto[g] === 5) cravMinuto++;
    }
    P.total = total; P.cravPlacar = cravPlacar; P.cravMinuto = cravMinuto;
    P.cravadas = cravPlacar + cravMinuto;
  }

  escreverPontuacao_(pts, parts);
  escreverRanking_(ss, parts);
  var validos = parts.filter(function (p) { return p.valido; }).length;
  Logger.log('✅ Recalculado: ' + parts.length + ' respostas · ' + validos + ' válidas no ranking.');
}

// ===== CONTROLE (Teste / Eliminado) + DEDUPE POR E-MAIL =====
// Regra combinada: vale sempre a ÚLTIMA resposta de cada e-mail (as anteriores
// não pontuam). Além disso, a aba "Controle" permite marcar Status por e-mail:
//   Pago / Pendente  → conta no ranking
//   Eliminado / Teste → NÃO conta no ranking (some do dashboard)
// A aba Controle é APPEND-ONLY: novas respostas viram "Pendente"; o que você
// marcar na mão nunca é sobrescrito. (Ela tem e-mail e NÃO vai para a pública.)
function aplicarControleEDedupe_(ss, parts) {
  // Última resposta por e-mail
  var latest = {};   // emailLower -> {ts, idx}
  var infoNome = {}; // emailLower -> {nome}
  for (var p = 0; p < parts.length; p++) {
    var P = parts[p];
    if (('' + P.nome).trim() === '') continue;
    var key = norm_(P.email).toLowerCase();
    if (!key) continue;
    var ts = new Date(P.timestamp).getTime();
    if (!latest[key] || ts >= latest[key].ts) { latest[key] = { ts: ts, idx: P.idx }; infoNome[key] = { nome: P.nome }; }
  }

  var statusMap = garantirControle_(ss, infoNome); // emailLower -> status

  for (var p = 0; p < parts.length; p++) {
    var P = parts[p];
    var key = norm_(P.email).toLowerCase();
    var temNome = ('' + P.nome).trim() !== '';
    var isLatest = (!key || !latest[key]) ? true : (latest[key].idx === P.idx);
    var status = (key && statusMap[key]) ? statusMap[key] : 'Pendente';
    P.status = status;
    P.valido = temNome && isLatest && status !== 'Eliminado' && status !== 'Teste';
    P.motivo = !temNome ? 'sem nome'
      : (!isLatest ? 'duplicada (vale a última)'
      : (status === 'Eliminado' ? 'eliminado'
      : (status === 'Teste' ? 'teste' : '')));
  }
}

function garantirControle_(ss, infoNome) {
  var ctrl = ss.getSheetByName('Controle');
  if (!ctrl) {
    ctrl = ss.insertSheet('Controle');
    ctrl.getRange('A1:D1').setValues([['Nome', 'E-mail', 'Status', 'Obs']])
      .setBackground('#FFD100').setFontWeight('bold');
    ctrl.setFrozenRows(1);
    ctrl.setColumnWidth(1, 200); ctrl.setColumnWidth(2, 250); ctrl.setColumnWidth(3, 120); ctrl.setColumnWidth(4, 220);
  }
  // Lê status existentes (preserva marcações manuais)
  var last = ctrl.getLastRow();
  var existing = {}, rowByEmail = {};
  if (last >= 2) {
    var vals = ctrl.getRange(2, 1, last - 1, 3).getValues();
    for (var i = 0; i < vals.length; i++) {
      var em = norm_(vals[i][1]).toLowerCase();
      if (em) { existing[em] = norm_(vals[i][2]) || 'Pendente'; rowByEmail[em] = i + 2; }
    }
  }
  // Adiciona e-mails novos como "Pendente" (append-only)
  var toAppend = [];
  Object.keys(infoNome).forEach(function (em) {
    if (!(em in existing)) { toAppend.push([infoNome[em].nome, em, 'Pendente', '']); existing[em] = 'Pendente'; }
  });
  if (toAppend.length) ctrl.getRange(ctrl.getLastRow() + 1, 1, toAppend.length, 4).setValues(toAppend);

  // Validação do Status
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pago', 'Pendente', 'Eliminado', 'Teste'], true).setAllowInvalid(false).build();
  var n = Math.max(ctrl.getLastRow() - 1, 1);
  ctrl.getRange(2, 3, n, 1).setDataValidation(rule);
  return existing;
}

// ===== ESCRITA: PONTUAÇÃO (detalhada, para o dashboard) =====
function escreverPontuacao_(pts, parts) {
  // Cabeçalho: Nome | Unid | por jogo (Placar,Classe,Minuto) | TOTAL | CravPlacar | CravMinuto | Cravadas | Timestamp
  var head = ['Nome', 'Unidade'];
  for (var g = 1; g <= NJOGOS; g++) head.push('J' + g + ' Placar', 'J' + g + ' Classe', 'J' + g + ' Minuto');
  head.push('TOTAL', 'Crav Placar', 'Crav Minuto', 'Cravadas', 'Timestamp', 'Valido', 'Status');

  pts.clearContents();
  pts.getRange(1, 1, 1, head.length).setValues([head])
    .setBackground('#FFD100').setFontWeight('bold').setFontSize(9);

  var out = [];
  for (var p = 0; p < parts.length; p++) {
    var P = parts[p];
    var r = [P.nome, P.unidade];
    for (var g = 0; g < NJOGOS; g++) r.push(P.placar[g], P.classe[g], P.minuto[g]);
    r.push(P.total, P.cravPlacar, P.cravMinuto, P.cravadas, P.timestamp, P.valido ? 1 : 0, P.status || '');
    out.push(r);
  }
  if (out.length) pts.getRange(2, 1, out.length, head.length).setValues(out);
  var tsCol = head.length - 2; // coluna Timestamp (antes de Valido, Status)
  pts.getRange(2, tsCol, Math.max(out.length, 1), 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  pts.setFrozenRows(1);
}

// ===== ESCRITA: RANKING (ordenado) =====
function escreverRanking_(ss, parts) {
  var rank = ss.getSheetByName('Ranking') || criarRanking_(ss);
  // Só entram no ranking os VÁLIDOS (última resposta por e-mail, sem Teste/Eliminado). Idx aponta p/ a linha em Palpites/Pontuação.
  var ordenado = parts.filter(function (p) { return p.valido; }).sort(function (a, b) {
    if (b.total !== a.total) return b.total - a.total;
    if (b.cravadas !== a.cravadas) return b.cravadas - a.cravadas;
    return new Date(a.timestamp) - new Date(b.timestamp); // quem enviou antes
  });

  rank.clearContents();
  rank.getRange(1, 1, 1, 7).setValues([['#', 'Nome', 'Unidade', 'TOTAL', 'Cravadas', 'Enviado em', 'Idx']])
    .setBackground('#FFD100').setFontWeight('bold');
  var out = [];
  for (var i = 0; i < ordenado.length; i++) {
    var P = ordenado[i];
    out.push([i + 1, P.nome, P.unidade, P.total, P.cravadas, P.timestamp, P.idx]);
  }
  if (out.length) rank.getRange(2, 1, out.length, 7).setValues(out);
  rank.getRange(2, 6, Math.max(out.length, 1), 1).setNumberFormat('dd/MM/yyyy HH:mm:ss');
  rank.setFrozenRows(1);
}

function criarPontuacao_(ss) {
  var s = ss.getSheetByName('Pontuação');
  if (!s) s = ss.insertSheet('Pontuação');
  return s;
}
function criarRanking_(ss) {
  var s = ss.getSheetByName('Ranking');
  if (!s) s = ss.insertSheet('Ranking');
  return s;
}

// ===== GATILHO DE RECÁLCULO =====
function criarGatilhoRecalculo() {
  var t = ScriptApp.getProjectTriggers();
  for (var i = 0; i < t.length; i++)
    if (t[i].getHandlerFunction() === 'recalcular') ScriptApp.deleteTrigger(t[i]);
  ScriptApp.newTrigger('recalcular')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet()).onEdit().create();
  Logger.log('✅ Gatilho de recálculo criado (recalcula ao editar o Gabarito).');
}

// ===== HELPERS =====
function toNum_(v) {
  if (v === '' || v === null || v === undefined) return 0;
  var n = Number(('' + v).replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
function sinal_(x) { return x > 0 ? 1 : (x < 0 ? -1 : 0); }
function norm_(v) { return v == null ? '' : ('' + v).trim(); }

// ============================================================
// API football-data.org — preenche PLACAR + QUEM PASSOU no Gabarito
// (tem os dados da Copa 2026 no plano grátis). O PERÍODO/MINUTO do
// 1º gol fica MANUAL: nenhuma API grátis entrega o minuto dos gols de 2026.
// Use a MESMA key do bolão anterior (football-data.org).
// ============================================================
var API_BASE = 'https://api.football-data.org/v4';

// Os 8 jogos na MESMA ordem das linhas 3..10 do Gabarito
var JOGOS = [
  { a: 'Canadá', b: 'Marrocos' }, { a: 'Paraguai', b: 'França' },
  { a: 'Brasil', b: 'Noruega' }, { a: 'México', b: 'Inglaterra' },
  { a: 'Portugal', b: 'Espanha' }, { a: 'Estados Unidos', b: 'Bélgica' },
  { a: 'Argentina', b: 'Egito' }, { a: 'Suíça', b: 'Colômbia' }
];
var FLAGS = {
  'Canadá':'🇨🇦','Marrocos':'🇲🇦','Paraguai':'🇵🇾','França':'🇫🇷','Brasil':'🇧🇷','Noruega':'🇳🇴',
  'México':'🇲🇽','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Portugal':'🇵🇹','Espanha':'🇪🇸','Estados Unidos':'🇺🇸','Bélgica':'🇧🇪',
  'Argentina':'🇦🇷','Egito':'🇪🇬','Suíça':'🇨🇭','Colômbia':'🇨🇴'
};
var TEAM_EN_PT = {
  'Canada':'Canadá','Morocco':'Marrocos','Paraguay':'Paraguai','France':'França',
  'Brazil':'Brasil','Norway':'Noruega','Mexico':'México','England':'Inglaterra',
  'Portugal':'Portugal','Spain':'Espanha','United States':'Estados Unidos','USA':'Estados Unidos',
  'Belgium':'Bélgica','Argentina':'Argentina','Egypt':'Egito','Switzerland':'Suíça','Colombia':'Colômbia'
};
function bandeira_(n) { return FLAGS[n] || '⚽'; }
function comBandeira_(n) { return bandeira_(n) + ' ' + n; }

// 1) Cole a MESMA key do bolão anterior (football-data.org) e rode uma vez.
function SETUP_API_KEY() {
  var MINHA_KEY = '';   // ← cole a API key da football-data.org aqui
  if (!MINHA_KEY) { Logger.log('❌ Cole a API key em MINHA_KEY.'); return; }
  PropertiesService.getScriptProperties().setProperty('FOOTBALL_DATA_KEY', MINHA_KEY);
  Logger.log('✅ API Key salva neste projeto. Rode testarAPI().');
}
function testarAPI() {
  var k = PropertiesService.getScriptProperties().getProperty('FOOTBALL_DATA_KEY');
  if (!k) { Logger.log('❌ Rode SETUP_API_KEY() primeiro.'); return; }
  var r = UrlFetchApp.fetch(API_BASE + '/competitions/WC', { headers: { 'X-Auth-Token': k }, muteHttpExceptions: true });
  Logger.log('HTTP ' + r.getResponseCode() + ' · ' + (JSON.parse(r.getContentText()).name || r.getContentText().slice(0, 200)));
}

// 2) Preenche placar + quem passou dos jogos FINALIZADOS e recalcula.
function atualizarGabarito() {
  var key = PropertiesService.getScriptProperties().getProperty('FOOTBALL_DATA_KEY');
  if (!key) { Logger.log('❌ Rode SETUP_API_KEY() primeiro.'); return; }
  var resp = UrlFetchApp.fetch(API_BASE + '/competitions/WC/matches?stage=LAST_16',
    { headers: { 'X-Auth-Token': key }, muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) { Logger.log('❌ HTTP ' + resp.getResponseCode() + ': ' + resp.getContentText().slice(0, 200)); return; }

  var data = JSON.parse(resp.getContentText());
  var finished = (data.matches || []).filter(function (m) { return m.status === 'FINISHED' && m.homeTeam && m.awayTeam; });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var gab = ss.getSheetByName('Gabarito');
  var n = 0;

  for (var g = 0; g < JOGOS.length; g++) {
    var A = JOGOS[g].a, B = JOGOS[g].b;
    var m = acharMatch_(finished, A, B);
    if (!m) continue;
    var homePT = TEAM_EN_PT[m.homeTeam.name] || m.homeTeam.name;
    var ft = m.score.fullTime || {};
    var golsHome = ft.home, golsAway = ft.away;
    var golsA, golsB;
    if (homePT === A) { golsA = golsHome; golsB = golsAway; } else { golsA = golsAway; golsB = golsHome; }
    var win = m.score.winner; // HOME_TEAM / AWAY_TEAM / DRAW
    var quemPT = win === 'HOME_TEAM' ? homePT : (win === 'AWAY_TEAM' ? (TEAM_EN_PT[m.awayTeam.name] || m.awayTeam.name) : '');
    var row = 3 + g;
    if (golsA != null) gab.getRange(row, 2).setValue(golsA);
    if (golsB != null) gab.getRange(row, 3).setValue(golsB);
    if (quemPT) gab.getRange(row, 4).setValue(comBandeira_(quemPT));
    n++;
    Logger.log('✅ J' + (g + 1) + ' ' + A + ' ' + golsA + 'x' + golsB + ' ' + B +
      ' | passou: ' + (quemPT || '⚠️ empate/pênaltis — preencha na mão'));
  }
  Logger.log('📊 ' + n + ' jogo(s) preenchido(s). ⚠️ Período/minuto do 1º gol continuam MANUAIS (colunas E e F).');
  Logger.log('ℹ️ Confira o placar contra a FIFA (o Gabarito é editável e recalcula sozinho).');
  recalcular();
}

function acharMatch_(list, A, B) {
  for (var i = 0; i < list.length; i++) {
    var m = list[i];
    var h = TEAM_EN_PT[m.homeTeam.name] || m.homeTeam.name;
    var a = TEAM_EN_PT[m.awayTeam.name] || m.awayTeam.name;
    if ((h === A && a === B) || (h === B && a === A)) return m;
  }
  return null;
}

// 3) (opcional) Atualiza sozinho a cada 2h.
function criarGatilhoGabarito() {
  var t = ScriptApp.getProjectTriggers();
  for (var i = 0; i < t.length; i++)
    if (t[i].getHandlerFunction() === 'atualizarGabarito') ScriptApp.deleteTrigger(t[i]);
  ScriptApp.newTrigger('atualizarGabarito').timeBased().everyHours(2).create();
  Logger.log('✅ Gatilho criado: atualizarGabarito a cada 2h.');
}
