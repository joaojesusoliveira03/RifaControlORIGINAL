/* ============================================================
   Reports View — HTML da tela de Relatórios
   ============================================================ */

export function getReportsViewHTML() {
  return `
    <!-- RELATÓRIOS -->
    <div class="screen" id="screen-reports">
      <div class="header">
        <div class="header-content">
          <button class="back-btn" onclick="showScreen('home')">
            <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2Z"/></svg>
          </button>
          <h1>📊 Relatórios</h1>
          <div class="sub">Análise completa</div>
        </div>
      </div>
      <div class="content">
        <div class="report-tabs">
          <button class="rtab active" onclick="switchReportTab('geral', this)">📊 Geral</button>
          <button class="rtab" onclick="switchReportTab('compradores', this)">🏆 Compradores</button>
          <button class="rtab" onclick="switchReportTab('vendedores', this)">👤 Vendedores</button>
        </div>
        <div id="report-content"></div>
      </div>
    </div>
  `;
}