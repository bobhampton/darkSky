import { initForm } from './form.js';
import { initStarfield } from './starfield.js';
import { initTimezoneControls } from './timezone.js';
import { exportTableToCSV } from './csv.js';

console.log('main.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready in main.js');
  // Initialize all modules
  initForm();
  initStarfield();
  initTimezoneControls();

  // CSV export button handler
  const exportBtn = document.getElementById('exportCSVBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const minimal = document.getElementById('exportMinimalCheckbox')?.checked || false;
      exportTableToCSV('dark_times_export.csv', minimal);
    });
  }

  // Chart modal close handler
  const modalClose = document.getElementById('chartModalClose');
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      document.getElementById('chartModal').style.display = 'none';
    });
  }

  // Modal close on outside click
  const modal = document.getElementById('chartModal');
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.id === 'chartModal') {
        modal.style.display = 'none';
      }
    });
  }
});
