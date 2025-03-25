import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';

const timezones = Intl.supportedValuesOf('timeZone');
let canvas, ctx, stars = [];
let starAnimationId;

document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('starfield');
  if (canvas) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
  }

  const starToggle = document.getElementById('starfieldToggle');

  if (starToggle && canvas) {
    const enabled = localStorage.getItem('EnableStarfield');
    const useDefault = enabled === null ? true : enabled === 'true';
    starToggle.checked = useDefault;
    applyStarfieldToggle(useDefault);

    starToggle.addEventListener('change', () => {
      const isChecked = starToggle.checked;
      localStorage.setItem('EnableStarfield', isChecked);
      applyStarfieldToggle(isChecked);
    });
  }
});

//    Utility Functions
function loadInputValue(id, defaultValue = '') {
  const element = document.getElementById(id);
  if (element) {
    element.value = localStorage.getItem(id) || defaultValue;
  }
}

function saveInputValues(inputIds) {
  inputIds.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      localStorage.setItem(id, element.value);
    }
  });
}

function validateCoordinates(latitudeId, longitudeId) {
  const latitudeInput = document.getElementById(latitudeId);
  const longitudeInput = document.getElementById(longitudeId);

  let latitude = parseFloat(latitudeInput.value);
  let longitude = parseFloat(longitudeInput.value);

  latitude = latitude ? latitude.toString().replace(/[^0-9.-]/g, '') : '';
  longitude = longitude ? longitude.toString().replace(/[^0-9.-]/g, '') : '';

  latitude = parseFloat(latitude);
  longitude = parseFloat(longitude);

  if (isNaN(latitude) || latitude < -90 || latitude > 90) {
    alert('Latitude must be a number between -90 and 90.');
    return false;
  }

  if (isNaN(longitude) || longitude < -180 || longitude > 180) {
    alert('Longitude must be a number between -180 and 180.');
    return false;
  }

  return true;
}

function IsValidNumber(s) {
  return typeof s === 'string' && /^[\-\+]?\d+(\.\d*)?$/.test(s);
}

function FormatDate(date, zone) {
  return DateTime.fromJSDate(new Date(date)).setZone(zone).toFormat('HH:mm:ss');
}

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

//    Event Listeners
document.addEventListener('DOMContentLoaded', function () {
  loadInputValue('EditDateStart');
  loadInputValue('EditDateEnd');
  loadInputValue('EditLatitude');
  loadInputValue('EditLongitude');
  loadInputValue('EditElevation', '0');

  document.getElementById('observerForm').addEventListener('submit', function () {
    const inputIds = ['EditDateStart', 'EditDateEnd', 'EditLatitude', 'EditLongitude', 'EditElevation'];
    saveInputValues(inputIds);
  });

  document.getElementById('observerForm').addEventListener('submit', function (event) {
    const isValid = validateCoordinates('EditLatitude', 'EditLongitude');
    if (!isValid) {
      event.preventDefault();
    }
  });
});

window.onload = function () {
  populateTimezones();
  document.getElementById('observerForm').addEventListener('submit', UpdateScreen);
};

document.addEventListener('DOMContentLoaded', () => {
  populateTimezones();
  const searchBox = document.getElementById('timezoneSearch');
  searchBox.addEventListener('input', filterTimezones);

  const startDateInput = document.getElementById('EditDateStart');
  const endDateInput = document.getElementById('EditDateEnd');

  const autoCloseCalendar = (input) => {
    input.addEventListener('change', () => {
      setTimeout(() => {
        input.blur();
      }, 100);
    });
  };

  const exportBtn = document.getElementById('exportCSVBtn');
  if (!exportBtn) {
    console.warn('ERROR: exportCSVBtn not found in DOM!');
  }

  autoCloseCalendar(startDateInput);
  autoCloseCalendar(endDateInput);
});

document.addEventListener('DOMContentLoaded', () => {
  const clearBtn = document.getElementById('clearFormBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      const inputIds = [
        'EditDateStart',
        'EditDateEnd',
        'EditLatitude',
        'EditLongitude',
        'EditElevation'
      ];

      inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        localStorage.removeItem(id);
      });

      document.getElementById('timezoneSearch').value = '';

      loadInputValue('EditElevation', '0');
      saveInputValues('EditElevation');

      alert('Form cleared and local storage reset!');
    });
  }
});

document.getElementById('exportCSVBtn').addEventListener('click', () => {
  const exportMinimal = document.getElementById('exportMinimalCheckbox')?.checked || false;
  exportTableToCSV('dark_times_export.csv', exportMinimal);
});

//   Time Zone Management
function populateTimezones() {
  const timezoneSelect = document.getElementById('timezoneSelect');
  timezoneSelect.innerHTML = '';

  const defaultZone = localStorage.getItem('DefaultTimeZone');

  timezones.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz;
    option.textContent = tz;

    if (tz === defaultZone) {
      option.selected = true;
    }

    timezoneSelect.appendChild(option);
  });

  const defaultCheckbox = document.getElementById('saveDefaultTimezone');
  if (defaultZone) {
    defaultCheckbox.checked = true;
  }
}

function filterTimezones() {
  const searchInput = document.getElementById('timezoneSearch').value.toLowerCase();
  const timezoneSelect = document.getElementById('timezoneSelect');
  timezoneSelect.innerHTML = '';

  const filteredTimezones = timezones.filter(tz => tz.toLowerCase().includes(searchInput));

  if (filteredTimezones.length > 0) {
    filteredTimezones.forEach((filteredTz, index) => {
      const option = document.createElement('option');
      option.value = filteredTz;
      option.textContent = filteredTz;

      if (index === 0) {
        option.selected = true;
      }

      timezoneSelect.appendChild(option);
    });
  } else {
    const utcOption = document.createElement('option');
    utcOption.value = 'UTC';
    utcOption.textContent = 'UTC';
    utcOption.selected = true;
    timezoneSelect.appendChild(utcOption);
  }
}

//  Astronomy Calculations
function calculateMoonAltitude(observer, date) {
  const moonPosition = Astronomy.Equator('Moon', date, observer, true, true);
  const moonHorizon = Astronomy.Horizon(
    date,
    observer,
    moonPosition.ra,
    moonPosition.dec,
    'normal'
  );
  return moonHorizon.altitude;
}

function getTimes(dtStart, dtEnd, observer) {
  let darkObj = {};

  while (dtStart <= dtEnd) {
    const twilightStart = Astronomy.SearchAltitude(
      'Sun',
      observer,
      -1,
      dtStart.toJSDate(),
      1,
      -18
    );
    const twilightEnd = Astronomy.SearchAltitude(
      'Sun',
      observer,
      +1,
      dtStart.toJSDate(),
      1,
      -18
    );

    const moonRise = Astronomy.SearchRiseSet(
      'Moon',
      observer,
      +1,
      dtStart.toJSDate(),
      1
    );
    const moonSet = Astronomy.SearchRiseSet(
      'Moon',
      observer,
      -1,
      dtStart.toJSDate(),
      1
    );

    const moonAltStartDay = calculateMoonAltitude(observer, dtStart.toJSDate());
    const moonAltEndDay = calculateMoonAltitude(
      observer,
      dtStart.plus({ days: 1 }).toJSDate()
    );
    const moonAltEndTwilight = calculateMoonAltitude(observer, twilightEnd.date);
    const moonAltStartTwilight = calculateMoonAltitude(
      observer,
      twilightStart.date
    );

    const currentDate = dtStart.toISODate();
    if (!darkObj[currentDate]) {
      darkObj[currentDate] = [];
    }

    let hasDawnWindow = false;
    let hasDuskWindow = false;

    // ----- Dawn Window -----
    if (moonAltStartDay <= 0 && moonAltEndTwilight <= 0) {
      darkObj[currentDate].push({
        start: dtStart.toJSDate(),
        end: twilightEnd.date,
        type: 'dawn',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartDay, moonAltEndTwilight }
      });
      hasDawnWindow = true;
    } else if (moonSet && moonAltStartDay >= 0 && moonSet.date < twilightEnd.date) {
      darkObj[currentDate].push({
        start: moonSet.date,
        end: twilightEnd.date,
        type: 'dawn',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartDay, moonAltEndTwilight }
      });
      hasDawnWindow = true;
    } else if (moonRise && moonAltStartDay <= 0 && moonRise.date < twilightEnd.date) {
      darkObj[currentDate].push({
        start: dtStart.toJSDate(),
        end: moonRise.date,
        type: 'dawn',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartDay, moonAltEndTwilight }
      });
      hasDawnWindow = true;
    }

    // Always push meta even if no window
    if (!hasDawnWindow) {
      darkObj[currentDate].push({
        start: null,
        end: null,
        type: 'dawn',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartDay, moonAltEndTwilight }
      });
    }

    // ----- Dusk Window -----
    if (moonAltStartTwilight <= 0 && moonAltEndDay <= 0) {
      darkObj[currentDate].push({
        start: twilightStart.date,
        end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
        type: 'dusk',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartTwilight, moonAltEndDay }
      });
      hasDuskWindow = true;
    } else if (moonSet && moonAltEndDay <= 0 && moonSet.date > twilightStart.date) {
      darkObj[currentDate].push({
        start: moonSet.date,
        end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
        type: 'dusk',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartTwilight, moonAltEndDay }
      });
      hasDuskWindow = true;
    } else if (moonRise && moonAltEndDay >= 0 && moonRise.date > twilightStart.date) {
      darkObj[currentDate].push({
        start: twilightStart.date,
        end: moonRise.date,
        type: 'dusk',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartTwilight, moonAltEndDay }
      });
      hasDuskWindow = true;
    }

    // Always push meta even if no window
    if (!hasDuskWindow) {
      darkObj[currentDate].push({
        start: null,
        end: null,
        type: 'dusk',
        meta: { twilightStart: twilightStart.date, twilightEnd: twilightEnd.date, moonRise: moonRise?.date || null, moonSet: moonSet?.date || null, moonAltStartTwilight, moonAltEndDay }
      });
    }

    dtStart = dtStart.plus({ days: 1 });
  }

  return darkObj;
}

//       UI Updates
function DisplayDarkTimes(darkTimes, zone) {
  const tbody = document.getElementById('DarkTimesBody');
  tbody.innerHTML = '';

  const timeZoneDisplay = document.getElementById('TimeZoneDisplay');
  timeZoneDisplay.innerText = `Times are in the selected time zone: ${zone}`;

  const dates = Object.keys(darkTimes).sort();
  const maxGroups = 4;
  let colorCycle = 1;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    const dawnStartCell = document.createElement('td');
    const dawnEndCell = document.createElement('td');
    const duskStartCell = document.createElement('td');
    const duskEndCell = document.createElement('td');

    dateCell.innerText = date;

    const dawnTimes = darkTimes[date].filter(time => time.type === 'dawn');
    const duskTimes = darkTimes[date].filter(time => time.type === 'dusk');

    let dawnStartTime = null;
    let dawnEndTime = null;
    let duskStartTime = null;
    let duskEndTime = null;

    if (dawnTimes.length > 0 && dawnTimes[0].start && dawnTimes[0].end) {
      dawnStartTime = FormatDate(dawnTimes[0].start, zone);
      dawnEndTime = FormatDate(dawnTimes[0].end, zone);
      dawnStartCell.innerText = dawnStartTime;
      dawnStartCell.classList.add(`window-group-dawn`);
      dawnEndCell.innerText = dawnEndTime;
      dawnEndCell.classList.add(`window-group-dawn`);
    } else {
      dawnStartCell.innerText = '';
      dawnEndCell.innerText = '';
    }

    if (duskTimes.length > 0 && duskTimes[0].start && duskTimes[0].end) {
      duskStartTime = FormatDate(duskTimes[0].start, zone);
      duskEndTime = FormatDate(duskTimes[0].end, zone);
      duskStartCell.innerText = duskStartTime;
      duskStartCell.classList.add(`window-group-dusk`);
      duskEndCell.innerText = duskEndTime;
      duskEndCell.classList.add(`window-group-dusk`);
    } else {
      duskStartCell.innerText = '';
      duskEndCell.innerText = '';
    }

    const nextDate = dates[i + 1];
    if (
      duskEndTime === '23:59:59' &&
      nextDate &&
      darkTimes[nextDate]
    ) {
      const nextDawn = darkTimes[nextDate].find(t => t.type === 'dawn');
      if (nextDawn) {
        const nextDawnStart = FormatDate(nextDawn.start, zone);
        if (nextDawnStart === '00:00:00') {
          const groupClass = `window-group-${colorCycle}`;
          duskStartCell.classList.add(groupClass);
          duskStartCell.title = "Dark time window continues into the next day";

          duskEndCell.classList.add(groupClass);
          duskEndCell.title = "Dark time window continues into the next day";

          setTimeout(() => {
            const nextRow = tbody.rows[i + 1];
            if (nextRow) {
              nextRow.cells[1].classList.add(groupClass);
              nextRow.cells[1].title = "Dark time window continued from previous night";

              nextRow.cells[2].classList.add(groupClass);
              nextRow.cells[2].title = "Dark time window continued from previous night";
            }
          });

          colorCycle++;
          if (colorCycle > maxGroups) colorCycle = 1;
        }
      }
    }

    dateCell.classList.add('center-text');
    dawnStartCell.classList.add('center-text');
    dawnEndCell.classList.add('center-text');
    duskStartCell.classList.add('center-text');
    duskEndCell.classList.add('center-text');

    row.dataset.date = date;
    row.dataset.meta = JSON.stringify({
      dawn: dawnTimes[0]?.meta || {},
      dusk: duskTimes[0]?.meta || {}
    });

    row.appendChild(dateCell);
    row.appendChild(dawnStartCell);
    row.appendChild(dawnEndCell);
    row.appendChild(duskStartCell);
    row.appendChild(duskEndCell);
    tbody.appendChild(row);

    row.addEventListener('click', () => {
      const meta = JSON.parse(row.dataset.meta);

      const nextRow = row.nextSibling;
      if (nextRow && nextRow.classList?.contains('details-row')) {
        nextRow.remove();
        return;
      }
      document.querySelectorAll('.details-row').forEach(r => r.remove());

      const expandedRow = document.createElement('tr');
      expandedRow.classList.add('details-row');

      const expandedCell = document.createElement('td');
      expandedCell.colSpan = 5;
      expandedCell.classList.add('expanded-content');

      const fmt = (val) =>
        val ? DateTime.fromJSDate(new Date(val)).setZone(zone).toFormat('HH:mm:ss') : 'N/A';

      const fmtNum = (num) => num !== undefined ? `${num.toFixed(2)}°` : 'N/A';

      const content = `
        <div class="details-flex-wrapper">
          <div class="details-block">
            <strong>🌅 AM:</strong><br>
            ${meta.dawn ? `
              • Astronomical Twilight Start: ${fmt(meta.dawn.twilightEnd)}<br>
              • Moon Rise: ${fmt(meta.dawn.moonRise)}<br>
              • Moon Set: ${fmt(meta.dawn.moonSet)}<br>
              • Moon Alt @ 00:00:00: ${fmtNum(meta.dawn.moonAltStartDay)}<br>
              • Moon Alt @ Astronomical Twilight Start: ${fmtNum(meta.dawn.moonAltEndTwilight)}<br>
            ` : 'No dawn window calculated.'}
          </div>
    
          <div class="details-block">
            <strong>🌇 PM:</strong><br>
            ${meta.dusk ? `
              • Astronomical Twilight End: ${fmt(meta.dusk.twilightStart)}<br>
              • Moon Rise: ${fmt(meta.dusk.moonRise)}<br>
              • Moon Set: ${fmt(meta.dusk.moonSet)}<br>
              • Moon Alt @ Astronomical Twilight End: ${fmtNum(meta.dusk.moonAltStartTwilight)}<br>
              • Moon Alt @ 23:59:59: ${fmtNum(meta.dusk.moonAltEndDay)}<br>
            ` : 'No dusk window calculated.'}
          </div>
        </div>
      `;

      expandedCell.innerHTML = content;
      expandedRow.appendChild(expandedCell);
      row.parentNode.insertBefore(expandedRow, row.nextSibling);
    });
  }
}

function exportTableToCSV(filename = 'dark_times_export.csv', exportMinimal = false) {
  const table = document.getElementById('CalcTable');
  const rows = Array.from(table.rows);
  let csv = [];

  // Attribution block
  csv.push('# Data generated by the darkSky web app');
  csv.push('# Website: https://bobhampton.github.io/darkSky/');
  csv.push('# GitHub: https://github.com/bobhampton/darkSky');
  csv.push('# DOI: https://doi.org/10.5281/zenodo.14847872');
  csv.push('# If you use this data in published research please cite the project using the DOI above.');
  csv.push(''); // blank line for spacing

  // Capture User Inputs
  const lat = document.getElementById('EditLatitude')?.value || '';
  const lon = document.getElementById('EditLongitude')?.value || '';
  const elevation = document.getElementById('EditElevation')?.value || '';
  const dateStart = document.getElementById('EditDateStart')?.value || '';
  const dateEnd = document.getElementById('EditDateEnd')?.value || '';
  const timeZone = document.getElementById('timezoneSelect')?.value || 'UTC';

  // Prepend User Metadata Rows
  csv.push('User inputs:');
  csv.push(['Observer Latitude:', lat].join(','));
  csv.push(['Observer Longitude:', lon].join(','));
  csv.push(['Elevation (meters):', elevation].join(','));
  csv.push(['Date Range:', `${dateStart} to ${dateEnd}`].join(','));
  csv.push(['Output Time Zone:', timeZone].join(','));
  csv.push(''); // spacer row

  // Define Headers
  const baseHeaders = [
    'Date (YYYY-MM-DD)',
    'Dark Time Start (AM)',
    'Dark Time End (AM)',
    'Dark Time Start (PM)',
    'Dark Time End (PM)'
  ];

  const extraHeaders = [
    'Moon Rise',
    'Moon Set',
    'Moon Altitude @ 00:00:00',
    'Moon Altitude @ Astronomical Twilight Start',
    'Astronomical Twilight Start',
    'Astronomical Twilight End',
    'Moon Altitude @ Astronomical Twilight End',
    'Moon Altitude @ 23:59:59'
  ];

  csv.push([...baseHeaders, ...(exportMinimal ? [] : extraHeaders)].join(','));

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.classList.contains('details-row')) continue;

    const cells = row.querySelectorAll('td');
    const basicData = Array.from(cells).map(cell => {
      let text = cell.textContent.trim().replace(/"/g, '""');
      return text.includes(',') ? `"${text}"` : text;
    });

    const rowData = [...basicData];

    if (!exportMinimal) {
      let meta = {};
      try {
        meta = JSON.parse(row.dataset.meta);
      } catch (err) {
        console.warn("ERROR: Invalid meta format", err);
      }

      const dawn = meta.dawn || {};
      const dusk = meta.dusk || {};

      const fmt = (val) => val ? DateTime.fromJSDate(new Date(val)).toFormat('HH:mm:ss') : '';
      const fmtNum = (num) => typeof num === 'number' ? num.toFixed(2) : '';

      // Add extra data in specified column order
      rowData.push(
        fmt(dawn.moonRise || dusk.moonRise),
        fmt(dawn.moonSet || dusk.moonSet),
        fmtNum(dawn.moonAltStartDay || dusk.moonAltStartDay),
        fmtNum(dawn.moonAltEndTwilight || dusk.moonAltEndTwilight),
        fmt(dawn.twilightEnd || dusk.twilightEnd),
        fmt(dawn.twilightStart || dusk.twilightStart),
        fmtNum(dawn.moonAltStartTwilight || dusk.moonAltStartTwilight),
        fmtNum(dawn.moonAltEndDay || dusk.moonAltEndDay)
      );
    }

    csv.push(rowData.join(','));
  }

  // 💾 Trigger download
  const csvString = csv.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', filename);
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function UpdateScreen(event) {
  event.preventDefault();

  const text_latitude = document.getElementById('EditLatitude').value;
  const text_longitude = document.getElementById('EditLongitude').value;
  const text_elevation = document.getElementById('EditElevation').value;
  const text_dateStart = document.getElementById('EditDateStart').value;
  const text_dateEnd = document.getElementById('EditDateEnd').value;
  let text_timezone = document.getElementById('timezoneSelect').value;

  const saveDefault = document.getElementById('saveDefaultTimezone').checked;
  if (saveDefault) {
    localStorage.setItem('DefaultTimeZone', text_timezone);
  } else {
    localStorage.removeItem('DefaultTimeZone');
  }

  if (!text_timezone) {
    text_timezone = 'UTC';
  }

  if (
    !IsValidNumber(text_latitude) ||
    !IsValidNumber(text_longitude) ||
    !IsValidNumber(text_elevation)
  ) {
    document.getElementById('CalcTable').style.display = 'none';
  } else {
    document.getElementById('CalcTable').style.display = '';

    const latitude = parseFloat(text_latitude);
    const longitude = parseFloat(text_longitude);
    const elevation = parseFloat(text_elevation);
    const zone = text_timezone;
    const dtStart = DateTime.fromISO(text_dateStart, { zone });
    const dtEnd = DateTime.fromISO(text_dateEnd, { zone });
    const observer = new Astronomy.Observer(latitude, longitude, elevation);
    const darkTimes = getTimes(dtStart, dtEnd, observer);

    DisplayDarkTimes(darkTimes, zone);

    const separator = document.getElementById('scroll-target-separator');
    if (separator) {
      separator.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}

//    Canvas Animation
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);

// Create stars
function generateStars() {
  stars = [];
  const numStars = 120;
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
    star.x += star.dx;
    star.y += star.dy;
    if (star.x < 0 || star.x > canvas.width) star.dx *= -1;
    if (star.y < 0 || star.y > canvas.height) star.dy *= -1;
  });

  starAnimationId = requestAnimationFrame(animateStars);
}

function applyStarfieldToggle(checked) {
  if (!canvas || !ctx) return;

  if (checked) {
    canvas.style.display = 'block';
    resizeCanvas();
    generateStars();
    animateStars();
  } else {
    canvas.style.display = 'none';
    cancelAnimationFrame(starAnimationId);
  }
}

// Initialize everything once DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('starfield');
  if (canvas) {
    ctx = canvas.getContext('2d');
    resizeCanvas();
  }

  const starToggle = document.getElementById('starfieldToggle');
  if (starToggle && canvas) {
    let enabled = localStorage.getItem('EnableStarfield');
    if (enabled === null) {
      enabled = 'true'; // default to enabled
      localStorage.setItem('EnableStarfield', enabled);
    }
    const enabledBool = enabled === 'true';
    starToggle.checked = enabledBool;
    applyStarfieldToggle(enabledBool);

    starToggle.addEventListener('change', () => {
      const checked = starToggle.checked;
      localStorage.setItem('EnableStarfield', checked);
      applyStarfieldToggle(checked);
    });
  }
});

