// Line-by-line visual differences viewer for prompt versions comparison

import { escapeHtml } from '../core/utils.js';

export function renderDiff(textA = '', textB = '') {
  const linesA = textA.split('\n');
  const linesB = textB.split('\n');
  
  const maxLength = Math.max(linesA.length, linesB.length);
  
  let htmlA = '';
  let htmlB = '';

  for (let i = 0; i < maxLength; i++) {
    const lineA = i < linesA.length ? linesA[i] : '';
    const lineB = i < linesB.length ? linesB[i] : '';
    const lineNum = i + 1;

    if (lineA === lineB) {
      // Unchanged line
      htmlA += `<div class="diff-line diff-unchanged"><span class="line-num">${lineNum}</span><span class="line-text">${escapeHtml(lineA)}</span></div>`;
      htmlB += `<div class="diff-line diff-unchanged"><span class="line-num">${lineNum}</span><span class="line-text">${escapeHtml(lineB)}</span></div>`;
    } else {
      // Changed line
      if (lineA && !lineB) {
        // Deleted only
        htmlA += `<div class="diff-line diff-removed"><span class="line-num">${lineNum}</span><span class="line-text">- ${escapeHtml(lineA)}</span></div>`;
        htmlB += `<div class="diff-line diff-empty"><span class="line-num">&nbsp;</span><span class="line-text"></span></div>`;
      } else if (!lineA && lineB) {
        // Added only
        htmlA += `<div class="diff-line diff-empty"><span class="line-num">&nbsp;</span><span class="line-text"></span></div>`;
        htmlB += `<div class="diff-line diff-added"><span class="line-num">${lineNum}</span><span class="line-text">+ ${escapeHtml(lineB)}</span></div>`;
      } else {
        // Modification (show both modified side-by-side)
        htmlA += `<div class="diff-line diff-removed"><span class="line-num">${lineNum}</span><span class="line-text">- ${escapeHtml(lineA)}</span></div>`;
        htmlB += `<div class="diff-line diff-added"><span class="line-num">${lineNum}</span><span class="line-text">+ ${escapeHtml(lineB)}</span></div>`;
      }
    }
  }

  return `
    <div class="diff-container flex w-full">
      <div class="diff-pane diff-left w-full">
        <div class="diff-pane-header">Original Version</div>
        <pre class="diff-code-wrapper">${htmlA}</pre>
      </div>
      <div class="diff-pane diff-right w-full">
        <div class="diff-pane-header">Selected Version</div>
        <pre class="diff-code-wrapper">${htmlB}</pre>
      </div>
    </div>
  `;
}
