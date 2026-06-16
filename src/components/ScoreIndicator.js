// SVG-based Dial Progress Indicators for Quality Scores

export function renderScoreIndicator(score, size = 80, label = '', showLabel = true) {
  const rounded = Math.round(score || 0);
  const strokeWidth = 3;
  const radius = 15.9155;
  const circumference = 2 * Math.PI * radius; // ~100
  
  // Determine color based on threshold
  let strokeColor = 'var(--error)';
  let glowColor = 'rgba(239, 68, 68, 0.2)';
  
  if (rounded >= 80) {
    strokeColor = 'var(--success)';
    glowColor = 'var(--success-glow)';
  } else if (rounded >= 55) {
    strokeColor = 'var(--warning)';
    glowColor = 'rgba(245, 158, 11, 0.2)';
  }

  return `
    <div class="score-indicator-wrapper flex flex-col align-center gap-2" style="width: ${size}px;">
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        <svg
          style="width: 100%; height: 100%; transform: rotate(-90deg);"
          viewBox="0 0 36 36"
        >
          <!-- Background track -->
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--border-color)"
            stroke-width="${strokeWidth}"
          />
          <!-- Progress track -->
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="${strokeColor}"
            stroke-width="${strokeWidth}"
            stroke-dasharray="${rounded}, 100"
            stroke-linecap="round"
            style="filter: drop-shadow(0 0 2px ${glowColor}); transition: stroke-dasharray var(--transition-normal);"
          />
        </svg>
        <!-- Center value — absolutely positioned over the SVG -->
        <div style="
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          text-align: center;
        ">
          <span style="font-size: ${size * 0.22}px; font-weight: 700; color: #ffffff;">${rounded}%</span>
        </div>
      </div>
      ${showLabel && label ? `<span class="score-label">${label}</span>` : ''}
    </div>
  `;
}

export function renderScoreCard(breakdown) {
  const items = [
    { key: 'clarity', label: 'Clarity' },
    { key: 'specificity', label: 'Specificity' },
    { key: 'completeness', label: 'Structure' },
    { key: 'ambiguityRisk', label: 'Ambiguity' },
    { key: 'constraints', label: 'Constraints' },
    { key: 'outputControl', label: 'Output Bound' },
    { key: 'tokenEfficiency', label: 'Efficiency' }
  ];

  return `
    <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(75px, 1fr)); gap: 1rem; width: 100%;">
      ${items.map(item => renderScoreIndicator(breakdown[item.key] || 0, 70, item.label)).join('')}
    </div>
  `;
}
