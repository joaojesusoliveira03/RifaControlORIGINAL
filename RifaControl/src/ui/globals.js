/* ============================================================
   Globals — ponte entre módulos e o HTML (onclick="...")
   ============================================================ */

// Utils
import {
  escapeHtml, shade, getAvatarColor, getAvatarInitial,
  maskPhone, formatDateBR, formatDateTimeBR, formatBRL, onlyDigits
} from '../utils/format.js';
import { haptic } from '../utils/haptic.js';
import { copyToClipboard } from '../utils/clipboard.js';

// Components
import { toast, toastWithAction } from './components/toast.js';
import { showConfirm, closeConfirm, confirmOk } from './components/confirm.js';
import { launchConfetti } from './components/confetti.js';
import { openModal, closeModal, closeAllModals } from './components/modal.js';

// Theme
import {
  applyTheme, toggleDark, toggleHaptic, toggleConfetti, setAccent
} from '../core/theme.js';

// Router
import { showScreen, switchTab, switchReportTab } from '../core/router.js';

// Auth
import {
  handleAuth, switchAuthTab, showForgotPassword, backToLogin,
  sendForgotPassword, updatePassword, signOut, setSyncStatus
} from '../core/auth.js';

// Services
import {
  calcSaleCost, calcArrecadado, calcPendente
} from '../services/sales.service.js';

/* ------------------------------------------------------------
   Screens
   ------------------------------------------------------------ */
import * as HomeScreen from './screens/home.screen.js';
import * as RifaScreen from './screens/rifa.screen.js';
import * as SortScreen from './screens/sort.screen.js';
import * as ReportsScreen from './screens/reports.screen.js';
import * as SettingsScreen from './screens/settings.screen.js';
import * as BuyerScreen from './screens/buyer.screen.js';
import * as NumInfo from './screens/num-info.screen.js';

/* ------------------------------------------------------------
   Modals
   ------------------------------------------------------------ */
import * as RifaModal from './modals/rifa.modal.js';
import * as SaleModal from './modals/sale.modal.js';
import * as WinnerModal from './modals/winner.modal.js';
import * as ListModal from './modals/list.modal.js';
import * as ShareModal from './modals/share.modal.js';
import * as Marketing from './modals/marketing.modal.js';

/* ------------------------------------------------------------
   Exposição global
   ------------------------------------------------------------ */
Object.assign(window, {

  // ---------- Utils ----------
  escapeHtml,
  shade,
  getAvatarColor,
  getAvatarInitial,
  maskPhone,
  formatDateBR,
  formatDateTimeBR,
  formatBRL,
  onlyDigits,
  haptic,
  copyToClipboard,

  // ---------- Components ----------
  toast,
  toastWithAction,
  showConfirm,
  closeConfirm,
  confirmOk,
  launchConfetti,
  openModal,
  closeModal,
  closeAllModals,

  // ---------- Theme ----------
  applyTheme,
  toggleDark,
  toggleHaptic,
  toggleConfetti,
  setAccent,

  // ---------- Router ----------
  showScreen,
  switchTab,
  switchReportTab,

  // ---------- Auth ----------
  handleAuth,
  switchAuthTab,
  showForgotPassword,
  backToLogin,
  sendForgotPassword,
  updatePassword,
  signOut,
  setSyncStatus,

  // ---------- Services ----------
  calcSaleCost,
  calcArrecadado,
  calcPendente,

  // ---------- Screens ----------
  // Home
  renderHome:          HomeScreen.renderHome,
  clearSearch:         HomeScreen.clearSearch,
  initSearchInput:     HomeScreen.initSearchInput,

  // Rifa
  openRifa:            RifaScreen.openRifa,
  renderRifa:          RifaScreen.renderRifa,
  switchTabRifa:       RifaScreen.switchTabRifa,
  deleteRifa:          RifaScreen.deleteRifa,
  showNumInfo:         RifaScreen.showNumInfo,

  // Sorteio
  renderSorteioList:   SortScreen.renderSorteioList,
  startSort:           SortScreen.startSort,
  rollAgain:           SortScreen.rollAgain,
  saveSortWinner:      SortScreen.saveSortWinner,
  closeSortModal:      SortScreen.closeSortModal,

  // Reports
  renderReports:       ReportsScreen.renderReports,

  // Settings
  renderSettings:      SettingsScreen.renderSettings,
  manualSync:          SettingsScreen.manualSync,
  exportData:          SettingsScreen.exportData,

  // Buyer
  openBuyer:           BuyerScreen.openBuyer,
  closeBuyer:          BuyerScreen.closeBuyer,

  // Num Info
  goToBuyerFromNum:    NumInfo.goToBuyerFromNum,

  // ---------- Rifa Modal ----------
  openRifaModal:       RifaModal.openRifaModal,
  saveRifa:            RifaModal.saveRifa,
  togglePromo:         RifaModal.togglePromo,
  updatePromoSummary:  RifaModal.updatePromoSummary,
  triggerImageUpload:  RifaModal.triggerImageUpload,
  handleImageUpload:   RifaModal.handleImageUpload,
  promptImageUrl:      RifaModal.promptImageUrl,
  removeRifaImage:     RifaModal.removeRifaImage,

  // Edição de imagem (rifa atual)
  openEditImageModal:     RifaModal.openEditImageModal,
  removeEditImage:        RifaModal.removeEditImage,
  handleEditImageUpload:  RifaModal.handleEditImageUpload,
  promptEditImageUrl:     RifaModal.promptEditImageUrl,

  // Edição de promoção (rifa atual)
  openEditPromoModal:     RifaModal.openEditPromoModal,
  toggleEditPromo:        RifaModal.toggleEditPromo,
  updateEditPromoSummary: RifaModal.updateEditPromoSummary,
  saveEditPromo:          RifaModal.saveEditPromo,

  // ---------- Sale Modal ----------
  openSaleModal:            SaleModal.openSaleModal,
  saveSale:                 SaleModal.saveSale,
  selectPay:                SaleModal.selectPay,
  updateSaleCalc:           SaleModal.updateSaleCalc,
  updateRandomHint:         SaleModal.updateRandomHint,
  openRandomNumbersModal:   SaleModal.openRandomNumbersModal,
  confirmRandomNumbers:     SaleModal.confirmRandomNumbers,
  addNumbersToBuyer:        SaleModal.addNumbersToBuyer,
  markAllPaid:              SaleModal.markAllPaid,
  togglePaid:               SaleModal.togglePaid,

  // ---------- Winner Modal ----------
  openWinnerModal:     WinnerModal.openWinnerModal,
  confirmWinner:       WinnerModal.confirmWinner,
  removeWinner:        WinnerModal.removeWinner,
  showNumInfoModal:    WinnerModal.showNumInfo,

  // ---------- List Modal ----------
  openListModal:       ListModal.openListModal,
  copyList:            ListModal.copyList,

  // ---------- Share Modal ----------
  openShareModal:      ShareModal.openShareModal,
  shareRifa:           ShareModal.shareRifa,
  removeShare:         ShareModal.removeShare,

  // ---------- Marketing ----------
  shareMarketingText:  Marketing.shareMarketingText
});