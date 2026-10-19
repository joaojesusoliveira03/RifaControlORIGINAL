import { getRifaModalHTML } from './rifa.view.js';
import { getSaleModalHTML } from './sale.view.js';
import { getWinnerModalHTML } from './winner.view.js';
import { getSortModalHTML } from './sort.view.js';
import { getConfirmModalHTML } from './confirm.view.js';
import { getListModalHTML } from './list.view.js';
import { getNumInfoModalHTML } from './num-info.view.js';
import { getEditImageModalHTML } from './edit-image.view.js';
import { getShareModalHTML } from './share.view.js';
import { getRandomModalHTML } from './random.view.js';

export function getModalsHTML() {
  return `
    ${getRifaModalHTML()}
    ${getSaleModalHTML()}
    ${getWinnerModalHTML()}
    ${getSortModalHTML()}
    ${getConfirmModalHTML()}
    ${getListModalHTML()}
    ${getNumInfoModalHTML()}
    ${getEditImageModalHTML()}
    ${getShareModalHTML()}
    ${getRandomModalHTML()}
  `;
}