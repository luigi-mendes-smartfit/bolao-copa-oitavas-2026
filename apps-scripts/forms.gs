// 🏆 BOLÃO COPA 2026 — OITAVAS DE FINAL · SMART FIT (v2.0)
// ============================================================
// SETUP ALL-IN-ONE — cria TUDO com uma função só.
//
// O QUE ESTA FUNÇÃO FAZ (setupCompleto):
//   1) Cria o Google Forms com as 9 seções (dados + 8 jogos).
//   2) Cria uma planilha nova e VINCULA as respostas nela (automático).
//   3) Cria a aba "Gabarito" (onde entram os resultados reais).
//   4) Agenda o FECHAMENTO automático do formulário às 14h (deadline).
//   5) Mostra no Log os links do formulário e da planilha.
//
// ⏱️ ROTEIRO DE AMANHÃ (já existe um form montado e com tema — NÃO recriar!):
//   A) Rode  sugerirConfrontosOitavas()  → lista os 8 jogos pela API.
//   B) Cole os 3 confrontos que faltam na lista JOGOS (linhas TIME 6/7/8).
//   C) Rode  atualizarConfrontos()  → atualiza SÓ os jogos no form existente,
//      mantendo tema, imagem, e-mail verified e a planilha vinculada.
//   D) Limpe as respostas de teste (Respostas > ⋮ > Excluir todas) e divulgue. 💛
//
// ⚠️ setupCompleto() cria um form NOVO do zero e PERDE o tema/imagem que você
//    montou na mão. Só use setupCompleto() se quiser começar tudo de novo.
// ============================================================

// 12:59:27 PM	Notice	Execution started
// 1:00:11 PM	Info	⏰ Fechamento agendado para Sat Jul 04 2026 14:00:00 GMT-0300 (Brasilia Standard Time)
// 1:00:11 PM	Info	==================================================
// 1:00:11 PM	Info	✅ TUDO PRONTO
// 1:00:11 PM	Info	🔗 FORMULÁRIO (divulgar): https://docs.google.com/forms/d/e/1FAIpQLSchThLlHToTx5z11Qe4AAY0ogtm_O6UyFq97nrcO58jWtwC5A/viewform
// 1:00:11 PM	Info	✏️  Editar formulário: https://docs.google.com/forms/d/1ToVt9b0X_QKttMrwk_GZpzhNf_c5m0XqRFgnTiXNqdU/edit
// 1:00:11 PM	Info	📊 PLANILHA (respostas + Gabarito): https://docs.google.com/spreadsheets/d/1c9WTHjHKjD1uRi9fTilKKsrHp5nOkqFWSR1eWaz9T9I/edit
// 1:00:11 PM	Info	⏰ Fechamento automático agendado para: 2026-07-04T14:00:00
// 1:00:11 PM	Info	==================================================
// 1:00:11 PM	Info	👉 Confira os 8 confrontos no formulário e divulgue o link.
// 1:00:11 PM	Notice	Execution completed

// ===== 1) CONFIGURAÇÕES =====
var CONFIG = {
  TITULO: 'Bolão Copa 2026 — Oitavas de Final | Smart Fit',
  LINK_WHATSAPP: 'https://chat.whatsapp.com/EmQ20xgAoILCNTPLWxBywC',
  CHAVE_PIX: '11996596581',
  NOME_PIX: 'Valter Rogério Sobral',
  VALOR_INSCRICAO: 'R$ 20,00',
  PRAZO_PAGAMENTO: '06/07/2026',
  PRAZO_TEXTO: 'Sábado, 04/07, das 08h00 às 13h59 — fecha às 14h no apito de Canadá x Marrocos.',
  DATA_ABERTURA:   '2026-07-04T08:00:00',   // abertura automática
  DATA_FECHAMENTO: '2026-07-04T14:00:00',   // fechamento automático
  MSG_PRE_ABERTURA: '🏆 O Bolão das Oitavas — Smart Fit abre SÁBADO 04/07 às 08h00. ' +
    'Salve este link e volte para palpitar! Fecha às 14h (apito de Canadá x Marrocos). Boa sorte! 💛',
  MSG_ENCERRADO: '⛔ Palpites encerrados! O primeiro jogo já começou. ' +
    'Acompanhe o ranking no grupo do WhatsApp. Boa sorte! 💛',
  GOLS_MAX: 10,
  TESTE: false   // true = cria form/planilha de teste (nome com [TESTE]); false = pra valer
};

// ===== 2) OS 8 JOGOS DAS OITAVAS (na ordem dos jogos) =====
// Preencha amanhã com os confrontos reais. Os nomes devem bater com FLAGS.
var JOGOS = [
  { a: 'Canadá',         b: 'Marrocos',    quando: 'Sáb 04/07, 14h' },
  { a: 'Paraguai',       b: 'França',      quando: 'Sáb 04/07, 18h' },
  { a: 'Brasil',         b: 'Noruega',     quando: 'Dom 05/07, 17h' },
  { a: 'México',         b: 'Inglaterra',  quando: 'Dom 05/07, 21h' },
  { a: 'Portugal',       b: 'Espanha',     quando: 'Seg 06/07, 16h' },
  { a: 'Estados Unidos', b: 'Bélgica',     quando: 'Seg 06/07, 21h' },
  { a: 'Argentina',      b: 'Egito', quando: 'Ter 07/07, 13h' },
  { a: 'Suíça',          b: 'Colômbia', quando: 'Ter 07/07, 17h' }
];

// ===== 3) BANDEIRAS (48 seleções) =====
var FLAGS = {
  'África do Sul':'🇿🇦','Coreia do Sul':'🇰🇷','México':'🇲🇽','Tchéquia':'🇨🇿',
  'Bósnia e Herz.':'🇧🇦','Canadá':'🇨🇦','Catar':'🇶🇦','Suíça':'🇨🇭',
  'Brasil':'🇧🇷','Escócia':'🏴󠁧󠁢󠁳󠁣󠁴󠁿','Haiti':'🇭🇹','Marrocos':'🇲🇦',
  'Austrália':'🇦🇺','Estados Unidos':'🇺🇸','Paraguai':'🇵🇾','Turquia':'🇹🇷',
  'Alemanha':'🇩🇪','Costa do Marfim':'🇨🇮','Curaçao':'🇨🇼','Equador':'🇪🇨',
  'Holanda':'🇳🇱','Japão':'🇯🇵','Suécia':'🇸🇪','Tunísia':'🇹🇳',
  'Bélgica':'🇧🇪','Egito':'🇪🇬','Irã':'🇮🇷','Nova Zelândia':'🇳🇿',
  'Arábia Saudita':'🇸🇦','Cabo Verde':'🇨🇻','Espanha':'🇪🇸','Uruguai':'🇺🇾',
  'França':'🇫🇷','Iraque':'🇮🇶','Noruega':'🇳🇴','Senegal':'🇸🇳',
  'Argélia':'🇩🇿','Argentina':'🇦🇷','Áustria':'🇦🇹','Jordânia':'🇯🇴',
  'Colômbia':'🇨🇴','Portugal':'🇵🇹','Rep. Dem. Congo':'🇨🇩','Uzbequistão':'🇺🇿',
  'Croácia':'🇭🇷','Gana':'🇬🇭','Inglaterra':'🏴󠁧󠁢󠁥󠁮󠁧󠁿','Panamá':'🇵🇦'
};

// EN (API football-data) -> PT com bandeira
var TEAM_EN_PT = {
  'South Africa':'África do Sul','South Korea':'Coreia do Sul','Korea Republic':'Coreia do Sul',
  'Mexico':'México','Czech Republic':'Tchéquia','Czechia':'Tchéquia',
  'Bosnia-Herzegovina':'Bósnia e Herz.','Bosnia and Herzegovina':'Bósnia e Herz.',
  'Canada':'Canadá','Qatar':'Catar','Switzerland':'Suíça','Brazil':'Brasil',
  'Scotland':'Escócia','Haiti':'Haiti','Morocco':'Marrocos','Australia':'Austrália',
  'United States':'Estados Unidos','USA':'Estados Unidos','Türkiye':'Turquia','Turkey':'Turquia',
  'Paraguay':'Paraguai','Germany':'Alemanha',"Côte d'Ivoire":'Costa do Marfim','Ivory Coast':'Costa do Marfim',
  'Curaçao':'Curaçao','Ecuador':'Equador','Netherlands':'Holanda','Japan':'Japão','Sweden':'Suécia',
  'Tunisia':'Tunísia','Belgium':'Bélgica','Egypt':'Egito','Iran':'Irã','New Zealand':'Nova Zelândia',
  'Saudi Arabia':'Arábia Saudita','Cape Verde Islands':'Cabo Verde','Cape Verde':'Cabo Verde',
  'Spain':'Espanha','Uruguay':'Uruguai','France':'França','Iraq':'Iraque','Norway':'Noruega',
  'Senegal':'Senegal','Algeria':'Argélia','Argentina':'Argentina','Austria':'Áustria','Jordan':'Jordânia',
  'Colombia':'Colômbia','Portugal':'Portugal','DR Congo':'Rep. Dem. Congo','Congo DR':'Rep. Dem. Congo',
  'Uzbekistan':'Uzbequistão','Croatia':'Croácia','Ghana':'Gana','England':'Inglaterra','Panama':'Panamá'
};

function bandeira_(nome) { return FLAGS[nome] || '⚽'; }
function comBandeira_(nome) { return bandeira_(nome) + ' ' + nome; }
var API_BASE = 'https://api.football-data.org/v4';

// Opções do 1º gol — mesma string no palpite e no Gabarito (facilita a pontuação)
var PERIODOS_GOL = ['1º Tempo (1ºT)', '2º Tempo (2ºT)', '1º Tempo da Prorrogação (1ºTP)', '2º Tempo da Prorrogação (2ºTP)'];
var OPCAO_SEM_GOL = 'Sem gol no tempo normal/prorrogação (0x0)';
var OPCAO_MIN_NA  = 'Não se aplica (jogo 0x0)';
function periodosPalpite_() { return PERIODOS_GOL.concat([OPCAO_SEM_GOL]); }

// ============================================================
// FUNÇÃO PRINCIPAL — rode esta amanhã
// ============================================================
function setupCompleto() {
  var sufixo = CONFIG.TESTE ? '  [TESTE]' : '';
  var props = PropertiesService.getScriptProperties();

  // 1) Criar formulário
  var form = FormApp.create(CONFIG.TITULO + sufixo);
  montarFormulario_(form);

  // 2) Criar planilha e vincular respostas
  var ss = SpreadsheetApp.create('Bolão Oitavas 2026 — Respostas' + sufixo);
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();

  // 3) Gabarito (resultados reais)
  criarGabarito_(ss);

  // 4) Guardar IDs e agendar fechamento automático
  // Em TESTE, grava em chaves separadas para NÃO mexer no form real (com tema).
  if (CONFIG.TESTE) {
    props.setProperty('FORM_ID_TESTE', form.getId());
    props.setProperty('SHEET_ID_TESTE', ss.getId());
    Logger.log('🧪 Modo TESTE: IDs salvos separados. O form real (FORM_ID) não foi tocado.');
  } else {
    props.setProperty('FORM_ID', form.getId());
    props.setProperty('SHEET_ID', ss.getId());
    agendarFechamento_();
  }

  // 5) Logs
  Logger.log('==================================================');
  Logger.log('✅ TUDO PRONTO' + sufixo);
  Logger.log('🔗 FORMULÁRIO (divulgar): ' + form.getPublishedUrl());
  Logger.log('✏️  Editar formulário: ' + form.getEditUrl());
  Logger.log('📊 PLANILHA (respostas + Gabarito): ' + ss.getUrl());
  Logger.log('⏰ Fechamento automático agendado para: ' + CONFIG.DATA_FECHAMENTO);
  Logger.log('==================================================');
  Logger.log('👉 Confira os 8 confrontos no formulário e divulgue o link.');
}

// ============================================================
// MONTAGEM DO FORMULÁRIO
// ============================================================
function montarFormulario_(form) {
  form.setDescription(
    '⚽ Bolão das Oitavas de Final da Copa 2026 — Smart Fit.\n' +
    '16 seleções, 8 jogos. Palpite quem passa, o placar e o minuto do 1º gol de cada jogo.\n' +
    '🎉 Aberto também para quem é de fora da empresa — chame amigos e família!\n' +
    '⏰ Prazo: ' + CONFIG.PRAZO_TEXTO
  );
  form.setCollectEmail(true);              // Verified: pessoa loga no Google, e-mail capturado + cópia por e-mail
  form.setLimitOneResponsePerUser(true);   // evita palpite duplicado (recomendado)
  form.setProgressBar(true);
  form.setShowLinkToRespondAgain(false);
  form.setAcceptingResponses(true);
  form.setConfirmationMessage('Seu bolão foi confirmado, boa sorte! 🤞');

  // Seção 1 — dados e inscrição
  form.addSectionHeaderItem()
    .setTitle('1) Seus dados e inscrição')
    .setHelpText(
      '📲 ENTRE NO GRUPO DO WHATSAPP (acompanhar, pagar e enviar comprovante):\n' +
      CONFIG.LINK_WHATSAPP + '\n\n' +
      '💰 Inscrição: ' + CONFIG.VALOR_INSCRICAO + ' via PIX\n' +
      '🔑 Chave PIX (celular): ' + CONFIG.CHAVE_PIX + '  (' + CONFIG.NOME_PIX + ')\n' +
      '📅 Pague até ' + CONFIG.PRAZO_PAGAMENTO + ' e mande o comprovante no grupo.\n' +
      '⚠️ Quem não pagar dentro do prazo está automaticamente desclassificado.\n\n' +
      '⏰ Prazo para responder: ' + CONFIG.PRAZO_TEXTO
    );

  form.addTextItem().setTitle('Nome completo').setRequired(true);

  form.addTextItem().setTitle('E-mail')
    .setHelpText('Usado para identificar seu palpite.')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .setHelpText('Digite um e-mail válido.').requireTextIsEmail().build());

  form.addTextItem().setTitle('Celular (WhatsApp) — com DDD')
    .setHelpText('Ex.: (11) 91234-5678').setRequired(true);

  form.addTextItem().setTitle('Unidade Smart Fit (colaborador) ou cidade (se for de fora)')
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('Confirmo que li as regras e que vou pagar a inscrição de ' + CONFIG.VALOR_INSCRICAO +
      ' via PIX (' + CONFIG.CHAVE_PIX + ') até ' + CONFIG.PRAZO_PAGAMENTO + '.')
    .setChoiceValues(['Confirmo']).setRequired(true);

  // Seções 2 a 9 — os 8 jogos
  for (var i = 0; i < JOGOS.length; i++) adicionarJogo_(form, i + 1, JOGOS[i]);
}

function adicionarJogo_(form, num, jogo) {
  var A = comBandeira_(jogo.a);
  var B = comBandeira_(jogo.b);

  form.addPageBreakItem()
    .setTitle((num + 1) + ') ' + A + '  x  ' + B)
    .setHelpText('Jogo ' + num + ' de ' + JOGOS.length + ' — ' + (jogo.quando || ''));

  form.addMultipleChoiceItem()
    .setTitle('Quem passa para as quartas de final?')
    .setHelpText('Vale quem avança — seja no tempo normal, na prorrogação ou nos pênaltis.')
    .setChoiceValues([A, B]).setRequired(true);

  form.addListItem()
    .setTitle('Quantos gols o ' + A + ' vai marcar?')
    .setHelpText('Placar ao fim do tempo jogado (90 min, ou 120 se houver prorrogação). Gols de pênaltis não contam.')
    .setChoiceValues(gols_(CONFIG.GOLS_MAX)).setRequired(true);

  form.addListItem()
    .setTitle('Quantos gols o ' + B + ' vai marcar?')
    .setHelpText('Placar ao fim do tempo jogado (90 min, ou 120 se houver prorrogação). Gols de pênaltis não contam.')
    .setChoiceValues(gols_(CONFIG.GOLS_MAX)).setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Em que PERÍODO sai o 1º gol do jogo?')
    .setHelpText('Vale o primeiro gol da partida, de qualquer uma das seleções.\n' +
      'Acha que vai 0x0 (decidido nos pênaltis)? Escolha "' + OPCAO_SEM_GOL + '".')
    .setChoiceValues(periodosPalpite_())
    .setRequired(true);

  form.addListItem()
    .setTitle('Em que MINUTO sai o 1º gol do jogo?')
    .setHelpText('Escolha o minuto (ou "Acréscimos").\n' +
      '⚠️ Se você marcou um tempo de PRORROGAÇÃO, lembre: cada tempo tem só 15 min + acréscimos. ' +
      'Qualquer valor acima de 15 conta como "Acréscimos".\n' +
      'Se marcou "' + OPCAO_SEM_GOL + '" no período, escolha "' + OPCAO_MIN_NA + '" aqui.')
    .setChoiceValues(minutos_()).setRequired(true);
}

// ============================================================
// ABA GABARITO (resultados reais das 8 partidas)
// ============================================================
function criarGabarito_(ss) {
  var existing = ss.getSheetByName('Gabarito');
  if (existing) ss.deleteSheet(existing);
  var gab = ss.insertSheet('Gabarito');

  gab.getRange('A1:F1').merge().setValue('📝 GABARITO — Preencha com os resultados reais (após cada jogo)')
    .setBackground('#000000').setFontColor('#FFD100').setFontWeight('bold').setFontSize(13).setHorizontalAlignment('center');

  gab.getRange('A2:F2').setValues([['Jogo', 'Gols Time 1', 'Gols Time 2', 'Quem passou', 'Período 1º gol', 'Minuto 1º gol']])
    .setBackground('#006400').setFontColor('#FFFFFF').setFontWeight('bold').setHorizontalAlignment('center');

  var rule0a10 = SpreadsheetApp.newDataValidation().requireNumberBetween(0, 10).setAllowInvalid(false).build();
  var periodos = periodosPalpite_(); // 4 períodos + "Sem gol (0x0)" (mesma string do palpite)
  var rulePeriodo = SpreadsheetApp.newDataValidation().requireValueInList(periodos, true).setAllowInvalid(false).build();

  for (var i = 0; i < JOGOS.length; i++) {
    var row = 3 + i;
    var A = comBandeira_(JOGOS[i].a), B = comBandeira_(JOGOS[i].b);
    gab.getRange(row, 1).setValue(A + ' x ' + B);
    gab.getRange(row, 2, 1, 5).setBackground('#E8FFE8').setHorizontalAlignment('center');
    gab.getRange(row, 2).setDataValidation(rule0a10);
    gab.getRange(row, 3).setDataValidation(rule0a10);
    gab.getRange(row, 4).setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList([A, B], true).setAllowInvalid(false).build());
    gab.getRange(row, 5).setDataValidation(rulePeriodo);
  }

  gab.getRange('A' + (3 + JOGOS.length) + ':F' + (3 + JOGOS.length)).merge()
    .setValue('Minuto: 1–45 ou "Acréscimos". Na prorrogação, acima de 15 conta como acréscimos. Gols de pênaltis não entram no placar.')
    .setFontStyle('italic').setFontColor('#666666').setFontSize(9);

  gab.setColumnWidth(1, 230);
  for (var c = 2; c <= 6; c++) gab.setColumnWidth(c, 130);
  gab.setFrozenRows(2);
}

// ============================================================
// ABERTURA / FECHAMENTO AUTOMÁTICO
// ============================================================
// Interpreta 'YYYY-MM-DDTHH:MM:SS' como horário LOCAL do projeto (evita ambiguidade de fuso).
// ⚠️ Confira em Configurações do projeto se o fuso é America/Sao_Paulo.
function dataLocal_(iso) {
  var m = String(iso).match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], 0) : new Date(iso);
}

// Agenda a ABERTURA (08h) e o FECHAMENTO (14h). Remove gatilhos antigos antes.
function agendarAberturaEFechamento() {
  removerGatilho_('abrirFormulario');
  removerGatilho_('fecharFormulario');
  var agora = new Date();
  var ab = dataLocal_(CONFIG.DATA_ABERTURA);
  var fe = dataLocal_(CONFIG.DATA_FECHAMENTO);
  if (ab > agora) { ScriptApp.newTrigger('abrirFormulario').timeBased().at(ab).create(); Logger.log('⏰ Abertura agendada: ' + ab); }
  else Logger.log('⚠️ DATA_ABERTURA já passou — abertura NÃO agendada.');
  if (fe > agora) { ScriptApp.newTrigger('fecharFormulario').timeBased().at(fe).create(); Logger.log('⏰ Fechamento agendado: ' + fe); }
  else Logger.log('⚠️ DATA_FECHAMENTO já passou — fechamento NÃO agendado.');
}
// Aliases (mantêm compatibilidade com chamadas existentes)
function agendarFechamento_() { agendarAberturaEFechamento(); }
function agendarFechamento() { agendarAberturaEFechamento(); }

// Define a mensagem de "formulário fechado" — best-effort (o novo modelo de
// Forms às vezes recusa via script; nesse caso configure 1x na mão).
function definirMensagemFechado_(form, msg) {
  try { form.setCustomClosedFormMessage(msg); }
  catch (e) {
    Logger.log('⚠️ Não consegui definir a mensagem de "fechado" por script (novo modelo de Forms).');
    Logger.log('   Configure 1 vez na mão: abrir o form > ⚙️ Configurações > "Mensagem de formulário fechado".');
  }
}

// Deixa o form FECHADO agora, com a mensagem "abre 08h" — pronto para divulgar o link.
function prepararPreAbertura() {
  var form = getForm_();
  if (!form) return;
  definirMensagemFechado_(form, CONFIG.MSG_PRE_ABERTURA);
  try { form.setAcceptingResponses(false); } catch (e) { Logger.log('⚠️ setAcceptingResponses: ' + e.message); }
  Logger.log('🔒 Pré-abertura pronta. Link: ' + form.getPublishedUrl());
}

function abrirFormulario() {
  var form = getForm_();
  if (!form) return;
  try { form.setAcceptingResponses(true); Logger.log('✅ Formulário ABERTO para respostas.'); }
  catch (e) { Logger.log('⚠️ Não consegui abrir por script: ' + e.message); }
}

function fecharFormulario() {
  var form = getForm_();
  if (!form) return;
  definirMensagemFechado_(form, CONFIG.MSG_ENCERRADO);
  try { form.setAcceptingResponses(false); } catch (e) { Logger.log('⚠️ setAcceptingResponses: ' + e.message); }
  Logger.log('🔒 Formulário fechado (encerrado).');
}

// ►► RODE ESTA para deixar tudo pronto pra DIVULGAR HOJE:
// fecha agora com aviso "abre 08h", agenda abertura 08h e fechamento 14h.
function deixarProntoParaDivulgar() {
  prepararPreAbertura();
  agendarAberturaEFechamento();
  var form = getForm_();
  Logger.log('==================================================');
  Logger.log('✅ PRONTO PARA DIVULGAR');
  Logger.log('🔗 Link (pode mandar pra geral): ' + (form ? form.getPublishedUrl() : '—'));
  Logger.log('🔒 Estado atual: FECHADO (mostra "abre 08h").');
  Logger.log('⏰ Abre sozinho:  ' + CONFIG.DATA_ABERTURA);
  Logger.log('⏰ Fecha sozinho: ' + CONFIG.DATA_FECHAMENTO);
  Logger.log('==================================================');
  Logger.log('👉 Amanhã, ANTES das 08h, finalize os 3 confrontos e rode atualizarConfrontos().');
}

// ============================================================
// RECONECTAR AO FORM REAL (quando o script perdeu o FORM_ID)
// Acha o form pelo título (CONFIG.TITULO, sem [TESTE]), pega a planilha
// vinculada, regrava FORM_ID/SHEET_ID, remove as chaves de TESTE e
// re-agenda o fechamento das 14h. Precisa autorizar o acesso ao Drive.
// ============================================================
function reconectarFormReal() {
  var props = PropertiesService.getScriptProperties();
  var alvo = CONFIG.TITULO; // exatamente o título do form real (sem [TESTE])
  var it = DriveApp.getFilesByName(alvo);
  var achados = [];
  while (it.hasNext()) {
    var f = it.next();
    if (f.getName() === alvo && f.getMimeType() === 'application/vnd.google-apps.form') achados.push(f);
  }

  if (achados.length === 0) {
    Logger.log('❌ Não achei nenhum formulário chamado "' + alvo + '".');
    Logger.log('👉 Use definirIdsManualmente() colando os IDs na mão.');
    return;
  }
  if (achados.length > 1) {
    Logger.log('⚠️ Achei ' + achados.length + ' formulários com esse nome. Escolha pelo link e use definirIdsManualmente():');
    achados.forEach(function(f) {
      var fm = FormApp.openById(f.getId());
      Logger.log('   • ' + f.getId() + '  → ' + fm.getEditUrl());
    });
    return;
  }

  var form = FormApp.openById(achados[0].getId());
  var destId = form.getDestinationId(); // planilha vinculada às respostas
  props.setProperty('FORM_ID', form.getId());
  if (destId) props.setProperty('SHEET_ID', destId);
  props.deleteProperty('FORM_ID_TESTE');
  props.deleteProperty('SHEET_ID_TESTE');
  agendarFechamento_(); // re-arma o fechamento automático das 14h

  Logger.log('✅ Reconectado ao form real: "' + form.getTitle() + '"');
  Logger.log('✏️  Editar: ' + form.getEditUrl());
  Logger.log('📊 Planilha vinculada: ' + (destId ? SpreadsheetApp.openById(destId).getName() : '— (nenhuma?)'));
  Logger.log('🧹 Chaves de TESTE removidas e fechamento das 14h reagendado.');
  Logger.log('👉 Agora dá pra usar atualizarConfrontos() e limparRespostasDeTeste().');
}

// ►► RECUPERAR O FORM ANTIGO (com tema): cole só o ID do form e rode.
// Ela pega a planilha vinculada sozinha (getDestinationId) e regrava tudo.
function apontarParaFormAntigo() {
  var FORM_ID_ANTIGO = '1ToVt9b0X_QKttMrwk_GZpzhNf_c5m0XqRFgnTiXNqdU';  // ← cole o ID do form COM TEMA (do link .../forms/d/<ESTE>/edit)
  if (!FORM_ID_ANTIGO) { Logger.log('❌ Cole o ID do form antigo em FORM_ID_ANTIGO.'); return; }
  var props = PropertiesService.getScriptProperties();
  var form = FormApp.openById(FORM_ID_ANTIGO);
  props.setProperty('FORM_ID', FORM_ID_ANTIGO);
  var destId = form.getDestinationId();
  if (destId) props.setProperty('SHEET_ID', destId);
  props.deleteProperty('FORM_ID_TESTE');
  props.deleteProperty('SHEET_ID_TESTE');
  Logger.log('✅ Apontado para: "' + form.getTitle() + '"');
  Logger.log('✏️  Editar: ' + form.getEditUrl());
  Logger.log('📊 Planilha vinculada: ' + (destId ? SpreadsheetApp.openById(destId).getName() : 'NENHUMA'));
  Logger.log('👉 Próximo: atualizarConfrontos() → recriarPlanilhaLimpa() → deixarProntoParaDivulgar()');
}

// Fallback manual: cole os dois IDs e rode.
function definirIdsManualmente() {
  var FORM_ID_REAL  = '';  // ← do link do form:  .../forms/d/<ESTE>/edit
  var SHEET_ID_REAL = '';  // ← do link da planilha real:  .../spreadsheets/d/<ESTE>/edit
  if (!FORM_ID_REAL || !SHEET_ID_REAL) { Logger.log('❌ Preencha os dois IDs antes de rodar.'); return; }
  var props = PropertiesService.getScriptProperties();
  props.setProperty('FORM_ID', FORM_ID_REAL);
  props.setProperty('SHEET_ID', SHEET_ID_REAL);
  props.deleteProperty('FORM_ID_TESTE');
  props.deleteProperty('SHEET_ID_TESTE');
  agendarFechamento_();
  Logger.log('✅ IDs gravados. Form: "' + FormApp.openById(FORM_ID_REAL).getTitle() +
    '" | Planilha: "' + SpreadsheetApp.openById(SHEET_ID_REAL).getName() + '"');
}

function getForm_() {
  var id = PropertiesService.getScriptProperties().getProperty('FORM_ID');
  if (!id) { Logger.log('❌ FORM_ID não encontrado. Rode setupCompleto() primeiro.'); return null; }
  return FormApp.openById(id);
}

function removerGatilho_(fn) {
  var t = ScriptApp.getProjectTriggers();
  for (var i = 0; i < t.length; i++) if (t[i].getHandlerFunction() === fn) ScriptApp.deleteTrigger(t[i]);
}

// ============================================================
// HELPER — sugere os 8 confrontos das oitavas pela API football-data
// (a API já está configurada no bolão anterior; aqui basta colar a mesma key)
// ============================================================
function SETUP_API_KEY() {
  var MINHA_KEY = '';  // ← cole a mesma key do bolão anterior aqui e rode uma vez
  if (!MINHA_KEY) { Logger.log('❌ Cole sua API key na variável MINHA_KEY.'); return; }
  PropertiesService.getScriptProperties().setProperty('FOOTBALL_DATA_KEY', MINHA_KEY);
  Logger.log('✅ API Key salva neste projeto.');
}

function sugerirConfrontosOitavas() {
  var apiKey = PropertiesService.getScriptProperties().getProperty('FOOTBALL_DATA_KEY');
  if (!apiKey) { Logger.log('❌ Rode SETUP_API_KEY() primeiro (cole a key do bolão anterior).'); return; }

  var resp = UrlFetchApp.fetch(API_BASE + '/competitions/WC/matches',
    { headers: { 'X-Auth-Token': apiKey }, muteHttpExceptions: true });
  if (resp.getResponseCode() !== 200) {
    Logger.log('❌ API HTTP ' + resp.getResponseCode() + ': ' + resp.getContentText().slice(0, 300));
    return;
  }
  var data = JSON.parse(resp.getContentText());
  var jogos = (data.matches || []).filter(function(m) {
    return m.stage && m.stage.indexOf('GROUP') === -1 &&
           m.homeTeam && m.homeTeam.name && m.awayTeam && m.awayTeam.name;
  });
  jogos.sort(function(a, b) { return new Date(a.utcDate) - new Date(b.utcDate); });

  if (!jogos.length) { Logger.log('ℹ️ Nenhum confronto de mata-mata definido ainda pela API.'); return; }

  Logger.log('📋 Confrontos de mata-mata definidos pela API (copie os 8 das oitavas p/ a lista JOGOS):');
  Logger.log('--------------------------------------------------');
  jogos.forEach(function(m) {
    var a = TEAM_EN_PT[m.homeTeam.name] || m.homeTeam.name;
    var b = TEAM_EN_PT[m.awayTeam.name] || m.awayTeam.name;
    var dt = Utilities.formatDate(new Date(m.utcDate), 'America/Sao_Paulo', 'dd/MM HH:mm');
    Logger.log("  { a: '" + a + "', b: '" + b + "', quando: '" + dt + "' },   // " + m.stage);
  });
  Logger.log('--------------------------------------------------');
  Logger.log('⚠️ Confira nomes e acentos: precisam bater com a tabela FLAGS.');
}

// ============================================================
// ATUALIZAR SÓ OS CONFRONTOS NO FORMULÁRIO QUE JÁ EXISTE
// ✅ Use ESTA amanhã (NÃO o setupCompleto), para não perder o tema/imagem.
// Ela apaga só as seções dos jogos e recria com a lista JOGOS atual.
// Mantém: tema, imagem de capa, e-mail verified, mensagem de confirmação,
// publicação e a planilha vinculada.
// ============================================================
function atualizarConfrontos() {
  var form = getForm_();
  if (!form) return;
  var items = form.getItems();

  // Índices dos PAGE_BREAK = início de cada jogo (5 itens por jogo, na ordem fixa)
  var breaks = [];
  for (var i = 0; i < items.length; i++)
    if (items[i].getType() === FormApp.ItemType.PAGE_BREAK) breaks.push(i);

  if (breaks.length !== JOGOS.length) {
    Logger.log('⚠️ O form tem ' + breaks.length + ' jogos, mas a lista JOGOS tem ' + JOGOS.length + '.');
    Logger.log('👉 Para não bagunçar a planilha, os dois precisam bater. Se você mudou a QUANTIDADE de jogos,');
    Logger.log('   rode recriarPlanilhaLimpa() (ou recrie o form). Se é a mesma quantidade, confira a lista.');
    return;
  }

  // Edita EM CIMA dos itens existentes → mesma coluna na planilha, sem órfãs
  for (var g = 0; g < JOGOS.length; g++) {
    var A = comBandeira_(JOGOS[g].a), B = comBandeira_(JOGOS[g].b);
    var s = breaks[g]; // s: PAGE_BREAK | s+1: quem passa | s+2: gols A | s+3: gols B | s+4: período | s+5: minuto
    items[s].asPageBreakItem()
      .setTitle((g + 2) + ') ' + A + '  x  ' + B)
      .setHelpText('Jogo ' + (g + 1) + ' de ' + JOGOS.length + ' — ' + (JOGOS[g].quando || ''));
    items[s + 1].asMultipleChoiceItem().setChoiceValues([A, B]);
    items[s + 2].asListItem().setTitle('Quantos gols o ' + A + ' vai marcar?');
    items[s + 3].asListItem().setTitle('Quantos gols o ' + B + ' vai marcar?');
    // reaplica as opções de período/minuto (inclui a nova opção "Sem gol / 0x0")
    items[s + 4].asMultipleChoiceItem().setChoiceValues(periodosPalpite_());
    items[s + 5].asListItem().setChoiceValues(minutos_());
  }

  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (sheetId) criarGabarito_(SpreadsheetApp.openById(sheetId));

  Logger.log('✅ Confrontos atualizados EM CIMA dos itens existentes — sem colunas novas na planilha.');
  Logger.log('🔗 Link: ' + form.getPublishedUrl());
}

// ============================================================
// GERAR UMA PLANILHA LIMPA (quando a atual ficou com colunas órfãs)
// Cria uma planilha nova, vincula ao form (as colunas passam a bater
// exatamente com as perguntas atuais) e recria o Gabarito. Use uma vez
// para consertar; depois o atualizarConfrontos() mantém tudo limpo.
// ============================================================
function recriarPlanilhaLimpa() {
  var form = getForm_();
  if (!form) return;
  var ss = SpreadsheetApp.create('Bolão Oitavas 2026 — Respostas');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  SpreadsheetApp.flush();
  PropertiesService.getScriptProperties().setProperty('SHEET_ID', ss.getId());
  criarGabarito_(ss);
  Logger.log('✅ Planilha nova e limpa vinculada: ' + ss.getUrl());
  Logger.log('🧹 A planilha antiga (bugada) foi DESVINCULADA — pode apagá-la no Drive.');
}

// ============================================================
// UTILITÁRIOS
// ============================================================
function gols_(max) { var a = []; for (var n = 0; n <= max; n++) a.push(String(n)); return a; }
function minutos_() { var a = []; for (var m = 1; m <= 45; m++) a.push(String(m)); a.push('Acréscimos'); a.push(OPCAO_MIN_NA); return a; }

// Apaga as respostas de TESTE da planilha vinculada (mantém o cabeçalho).
// Rode isto para zerar a planilha antes do lançamento real.
function limparRespostasDeTeste() {
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) { Logger.log('❌ SHEET_ID não encontrado.'); return; }
  var ss = SpreadsheetApp.openById(sheetId);
  var sh = null, sheets = ss.getSheets();
  for (var i = 0; i < sheets.length; i++) {
    var n = sheets[i].getName();
    if (n.indexOf('Form') > -1 || n.indexOf('Response') > -1 ||
        (n.indexOf('Respostas') > -1 && n.indexOf('Gabarito') === -1)) { sh = sheets[i]; break; }
  }
  if (!sh) { Logger.log('❌ Aba de respostas não encontrada.'); return; }
  var last = sh.getLastRow();
  if (last > 1) { sh.deleteRows(2, last - 1); Logger.log('🧹 ' + (last - 1) + ' resposta(s) de teste apagada(s). Cabeçalho mantido.'); }
  else { Logger.log('✅ Já estava zerada (só o cabeçalho).'); }
}

// Limpa só os IDs de TESTE guardados (após apagar o form/planilha [TESTE] no Drive).
function limparTeste() {
  var props = PropertiesService.getScriptProperties();
  props.deleteProperty('FORM_ID_TESTE');
  props.deleteProperty('SHEET_ID_TESTE');
  Logger.log('🧹 IDs de TESTE limpos. (Apague manualmente o form/planilha [TESTE] no Drive.) O form real segue intacto.');
}
