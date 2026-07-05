// 🌐 BOLÃO COPA 2026 — OITAVAS · SMART FIT · PÚBLICA (espelho read-only)
// ============================================================
// Rode na planilha PÚBLICA (nova, compartilhada "qualquer pessoa com link: leitor").
// Ela NÃO recebe respostas: puxa da MASTER por IMPORTRANGE, expondo só
// nome + palpites + pontos (sem e-mail, sem celular). O index.html lê daqui.
//
// COMO USAR:
// 1) Crie uma planilha nova e compartilhe como "Qualquer pessoa com o link: Leitor".
// 2) Extensões > Apps Script > cole este arquivo.
// 3) Preencha e rode  SETUP_PUBLICA()  (ID da master + nome da aba de respostas).
// 4) Rode  configurarPublica().
// 5) Abra CADA aba e clique em "Permitir acesso" no aviso do IMPORTRANGE.
// 6) No index.html, use o ID desta planilha pública em SPREADSHEET_ID.
// ============================================================

function SETUP_PUBLICA() {
  var MASTER = '';                       // ← ID da planilha MASTER (privada), do link .../d/<ISSO>/edit
  var RESP   = 'Form Responses 1';       // ← NOME EXATO da aba de respostas na master (confira lá!)
  var p = PropertiesService.getScriptProperties();
  if (MASTER) p.setProperty('MASTER_ID', MASTER);
  if (RESP)   p.setProperty('RESP_SHEET', RESP);
  Logger.log('MASTER_ID=' + p.getProperty('MASTER_ID'));
  Logger.log('RESP_SHEET=' + p.getProperty('RESP_SHEET'));
  Logger.log('👉 Agora rode configurarPublica().');
}

function configurarPublica() {
  var p = PropertiesService.getScriptProperties();
  var id = p.getProperty('MASTER_ID');
  var resp = p.getProperty('RESP_SHEET') || 'Form Responses 1';
  if (!id) { Logger.log('❌ Rode SETUP_PUBLICA() primeiro (defina MASTER_ID).'); return; }
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // SEM IFERROR de propósito: o IMPORTRANGE precisa mostrar o #REF! com o botão
  // "Permitir acesso" na 1ª vez. IFERROR esconderia esse aviso e ficaria vazio.

  // ---- Abas sem dados sensíveis: espelho direto (mostram o botão de permissão) ----
  aba_(ss, 'Gabarito').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Gabarito!A1:F20")');
  aba_(ss, 'Pontuação').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Pontuação!A1:AL400")');
  aba_(ss, 'Ranking').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Ranking!A1:G400")');

  // ---- Palpites (SEM e-mail/celular): Nome(Col3), Unidade(Col5), palpites Col7..Col46 ----
  var cols = ['Col3', 'Col5'];
  for (var i = 7; i <= 46; i++) cols.push('Col' + i);
  var q = 'select ' + cols.join(',');
  aba_(ss, 'Palpites').getRange('A1').setFormula(
    '=QUERY(IMPORTRANGE("' + id + '","\'' + resp + '\'!A1:AT400"),"' + q + '",1)'
  );

  Logger.log('✅ Fórmulas criadas (Palpites, Gabarito, Pontuação, Ranking).');
  Logger.log('👉 Abra a aba Gabarito: vai aparecer #REF! com "Permitir acesso" — CLIQUE.');
  Logger.log('   (Autoriza 1x e vale para todas as abas, pois vêm da mesma master.)');
  Logger.log('👉 Depois rode diagnosticarPublica() para conferir as linhas.');
}

function aba_(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  s.clearContents();
  return s;
}

// Diagnóstico rápido
function diagnosticarPublica() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Palpites', 'Gabarito', 'Pontuação', 'Ranking'].forEach(function (n) {
    var s = ss.getSheetByName(n);
    Logger.log(n + ': ' + (s ? s.getLastRow() + ' linhas' : 'NÃO existe'));
  });
}// 🌐 BOLÃO COPA 2026 — OITAVAS · SMART FIT · PÚBLICA (espelho read-only)
// ============================================================
// Rode na planilha PÚBLICA (nova, compartilhada "qualquer pessoa com link: leitor").
// Ela NÃO recebe respostas: puxa da MASTER por IMPORTRANGE, expondo só
// nome + palpites + pontos (sem e-mail, sem celular). O index.html lê daqui.
//
// COMO USAR:
// 1) Crie uma planilha nova e compartilhe como "Qualquer pessoa com o link: Leitor".
// 2) Extensões > Apps Script > cole este arquivo.
// 3) Preencha e rode  SETUP_PUBLICA()  (ID da master + nome da aba de respostas).
// 4) Rode  configurarPublica().
// 5) Abra CADA aba e clique em "Permitir acesso" no aviso do IMPORTRANGE.
// 6) No index.html, use o ID desta planilha pública em SPREADSHEET_ID.
// ============================================================

function SETUP_PUBLICA() {
  var MASTER = '';                       // ← ID da planilha MASTER (privada), do link .../d/<ISSO>/edit
  var RESP   = '';       // ← NOME EXATO da aba de respostas na master (confira lá!)
  var p = PropertiesService.getScriptProperties();
  if (MASTER) p.setProperty('MASTER_ID', MASTER);
  if (RESP)   p.setProperty('RESP_SHEET', RESP);
  Logger.log('MASTER_ID=' + p.getProperty('MASTER_ID'));
  Logger.log('RESP_SHEET=' + p.getProperty('RESP_SHEET'));
  Logger.log('👉 Agora rode configurarPublica().');
}

function configurarPublica() {
  var p = PropertiesService.getScriptProperties();
  var id = p.getProperty('MASTER_ID');
  var resp = p.getProperty('RESP_SHEET') || 'Form Responses 1';
  if (!id) { Logger.log('❌ Rode SETUP_PUBLICA() primeiro (defina MASTER_ID).'); return; }
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // SEM IFERROR de propósito: o IMPORTRANGE precisa mostrar o #REF! com o botão
  // "Permitir acesso" na 1ª vez. IFERROR esconderia esse aviso e ficaria vazio.

  // ---- Abas sem dados sensíveis: espelho direto (mostram o botão de permissão) ----
  aba_(ss, 'Gabarito').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Gabarito!A1:F20")');
  aba_(ss, 'Pontuação').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Pontuação!A1:AL400")');
  aba_(ss, 'Ranking').getRange('A1').setFormula('=IMPORTRANGE("' + id + '","Ranking!A1:G400")');

  // ---- Palpites (SEM e-mail/celular): Nome(Col3), Unidade(Col5), palpites Col7..Col46 ----
  var cols = ['Col3', 'Col5'];
  for (var i = 7; i <= 46; i++) cols.push('Col' + i);
  var q = 'select ' + cols.join(',');
  aba_(ss, 'Palpites').getRange('A1').setFormula(
    '=QUERY(IMPORTRANGE("' + id + '","\'' + resp + '\'!A1:AT400"),"' + q + '",1)'
  );

  Logger.log('✅ Fórmulas criadas (Palpites, Gabarito, Pontuação, Ranking).');
  Logger.log('👉 Abra a aba Gabarito: vai aparecer #REF! com "Permitir acesso" — CLIQUE.');
  Logger.log('   (Autoriza 1x e vale para todas as abas, pois vêm da mesma master.)');
  Logger.log('👉 Depois rode diagnosticarPublica() para conferir as linhas.');
}

function aba_(ss, name) {
  var s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  s.clearContents();
  return s;
}

// Diagnóstico rápido
function diagnosticarPublica() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ['Palpites', 'Gabarito', 'Pontuação', 'Ranking'].forEach(function (n) {
    var s = ss.getSheetByName(n);
    Logger.log(n + ': ' + (s ? s.getLastRow() + ' linhas' : 'NÃO existe'));
  });
}