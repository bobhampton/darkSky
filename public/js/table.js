import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';
import { FormatDate } from './utils.js';
import { plotSunAltitudeChart, showFullscreenChart } from './chart.js';
import { calculateAltitude } from './astronomy.js';

export function DisplayDarkTimes(darkTimes, zone) {
  const tbody = document.getElementById('DarkTimesBody');
  tbody.innerHTML = '';

  const timeZoneDisplay = document.getElementById('TimeZoneDisplay');
  timeZoneDisplay.innerText = `Times are in the selected time zone: ${zone}`;

  const dates = Object.keys(darkTimes).sort();
  const maxGroups = 4;
  let colorCycle = 1;
  let pendingGroupClass = null;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const row = document.createElement('tr');
    const dateCell = document.createElement('td');
    const dawnStartCell = document.createElement('td');
    const dawnEndCell = document.createElement('td');
    const duskStartCell = document.createElement('td');
    const duskEndCell = document.createElement('td');

    dateCell.innerText = date;
    row.dataset.date = date;

    const dawnTimes = darkTimes[date].filter(time => time.type === 'dawn');
    const duskTimes = darkTimes[date].filter(time => time.type === 'dusk');
    const fullDark = darkTimes[date].find(time => time.type === 'fullDark');

    if (fullDark) {
      dawnStartCell.innerText = 'ALL DAY DARK SKY\n00:00:00';
      dawnEndCell.innerText = '-';
      duskStartCell.innerText = '-';
      duskEndCell.innerText = 'ALL DAY DARK SKY\n23:59:59';

      // Style the cells
      ['window-group-dawn', 'window-group-dusk'].forEach(cls => {
        dawnStartCell.classList.add(cls);
        dawnEndCell.classList.add(cls);
        duskStartCell.classList.add(cls);
        duskEndCell.classList.add(cls);
      });

      row.dataset.meta = JSON.stringify({
        dawn: {
          start: dawnTimes[0]?.start || fullDark?.start || null,
          end: dawnTimes[0]?.end || fullDark?.end || null,
          ...dawnTimes[0]?.meta || fullDark?.meta || {}
        },
        dusk: {
          start: duskTimes[0]?.start || fullDark?.start || null,
          end: duskTimes[0]?.end || fullDark?.end || null,
          ...duskTimes[0]?.meta || fullDark?.meta || {}
        }
      });

      // Skip normal rendering
      row.appendChild(dateCell);
      row.appendChild(dawnStartCell);
      row.appendChild(dawnEndCell);
      row.appendChild(duskStartCell);
      row.appendChild(duskEndCell);
      tbody.appendChild(row);

      // Attach click event for fullDark meta view
      row.addEventListener('click', () => {
        document.querySelectorAll('.details-row').forEach(r => r.remove());

        const expandedRow = document.createElement('tr');
        expandedRow.classList.add('details-row');

        const expandedCell = document.createElement('td');
        expandedCell.colSpan = 5;
        expandedCell.classList.add('expanded-content');

        const meta = fullDark.meta;

        const fmt = (val) =>
          val ? DateTime.fromJSDate(new Date(val)).setZone(zone).toFormat('HH:mm:ss') : 'N/A';

        const fmtNum = (num) => num ? `${num.toFixed(2)}°` : 'N/A';

        const content = `
          <div class="details-flex-wrapper">
            <div class="details-block">
              <strong>All-Day Dark Sky:</strong><br>
              • Moon Alt @ 00:00:00: ${fmtNum(meta.moonAltStartDay)}<br>
              • Moon Alt @ 23:59:59: ${fmtNum(meta.moonAltEndDay)}<br>
            </div>
          </div>
          <div class="sun-moon-altitude-wrapper" style="margin-top:1rem;">
            <h4>Sun & Moon Altitude Chart (click to expand)</h4>
            <canvas class="sun-moon-altitude-chart" width="800" height="400"></canvas>
          </div>
        `;

        expandedCell.innerHTML = content;
        expandedRow.appendChild(expandedCell);
        row.parentNode.insertBefore(expandedRow, row.nextSibling);

        const latitude = parseFloat(document.getElementById('EditLatitude').value);
        const longitude = parseFloat(document.getElementById('EditLongitude').value);
        const elevation = parseFloat(document.getElementById('EditElevation').value);
        const observer = new Astronomy.Observer(latitude, longitude, elevation);
        const chartCanvas = expandedCell.querySelector('.sun-moon-altitude-chart');
        const chartDate = DateTime.fromISO(date, { zone });

        plotSunAltitudeChart(chartCanvas, observer, chartDate, zone);

        chartCanvas.style.cursor = 'pointer';
        chartCanvas.addEventListener('click', () => {
          showFullscreenChart(observer, chartDate, zone);
        });
      });

      // Early return
      continue;
    }

    let dawnStartTime = null;
    let dawnEndTime = null;
    let duskStartTime = null;
    let duskEndTime = null;

    if ((!dawnTimes.length || !dawnTimes[0].start) && fullDark) {
      dawnStartTime = FormatDate(fullDark.start, zone);
      dawnEndTime = FormatDate(fullDark.end, zone);
      dawnStartCell.innerText = dawnStartTime;
      dawnStartCell.classList.add('window-group-dawn');
      dawnEndCell.innerText = dawnEndTime;
      dawnEndCell.classList.add('window-group-dawn');
    }

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

    if ((!duskTimes.length || !duskTimes[0].start) && fullDark) {
      duskStartTime = FormatDate(fullDark.start, zone);
      duskEndTime = FormatDate(fullDark.end, zone);
      duskStartCell.innerText = duskStartTime;
      duskStartCell.classList.add('window-group-dusk');
      duskEndCell.innerText = duskEndTime;
      duskEndCell.classList.add('window-group-dusk');
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

    // Apply color from previous day if needed
    if (pendingGroupClass) {
      dawnStartCell.classList.add(pendingGroupClass);
      dawnStartCell.title = "Dark time window continued from previous night";
      dawnStartCell.innerText = '–';

      dawnEndCell.classList.add(pendingGroupClass);
      dawnEndCell.title = "Dark time window continued from previous night";

      pendingGroupClass = null;
    }

    // Check if dark sky window continues into the next day
    const nextDate = dates[i + 1];
    if (
      duskEndTime === '23:59:59' &&
      nextDate &&
      darkTimes[nextDate]
    ) {
      const nextDawn = darkTimes[nextDate].find(t => t.type === 'dawn');
      const nextDawnStart = nextDawn?.start ? FormatDate(nextDawn.start, zone) : null;

      if (nextDawnStart === '00:00:00') {
        const groupClass = `window-group-${colorCycle}`;

        duskStartCell.classList.add(groupClass);
        duskStartCell.title = "Dark time window continues into the next day";

        duskEndCell.classList.add(groupClass);
        duskEndCell.title = "Dark time window continues into the next day";
        duskEndCell.innerText = '–';

        pendingGroupClass = groupClass;

        colorCycle++;
        if (colorCycle > maxGroups) colorCycle = 1;
      }
    }

    dateCell.classList.add('center-text');
    dawnStartCell.classList.add('center-text');
    dawnEndCell.classList.add('center-text');
    duskStartCell.classList.add('center-text');
    duskEndCell.classList.add('center-text');

    const metaOnly = darkTimes[date].find(t => t.type === 'metaOnly');

    row.dataset.meta = JSON.stringify({
      dawn: {
        start: dawnTimes[0]?.start || null,
        end: dawnTimes[0]?.end || null,
        ...(dawnTimes[0]?.meta || metaOnly?.meta || {})
      },
      dusk: {
        start: duskTimes[0]?.start || null,
        end: duskTimes[0]?.end || null,
        ...(duskTimes[0]?.meta || metaOnly?.meta || {})
      }
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

      const fmtNum = (num) => num ? `${num.toFixed(2)}°` : 'N/A';

      const content = `
        <div class="details-flex-wrapper">
          <div class="details-block">
            <strong>🌅</strong><br>
            ${meta.dawn ? `
              • Astronomical Twilight Start: ${fmt(meta.dawn.twilightEnd)}<br>
              • Moon Rise: ${fmt(meta.dawn.moonRise)}<br>
              • Moon Set: ${fmt(meta.dawn.moonSet)}<br>
              • Moon Alt @ 00:00:00: ${fmtNum(meta.dawn.moonAltStartDay)}<br>
              • Moon Alt @ Astronomical Twilight Start: ${fmtNum(meta.dawn.moonAltEndTwilight)}<br>
            ` : 'No dawn window calculated.'}
          </div>

          <div class="details-block">
            <strong>🌇</strong><br>
            ${meta.dusk ? `
              • Astronomical Twilight End: ${fmt(meta.dusk.twilightStart)}<br>
              • Moon Rise: ${fmt(meta.dusk.moonRise)}<br>
              • Moon Set: ${fmt(meta.dusk.moonSet)}<br>
              • Moon Alt @ Astronomical Twilight End: ${fmtNum(meta.dusk.moonAltStartTwilight)}<br>
              • Moon Alt @ 23:59:59: ${fmtNum(meta.dusk.moonAltEndDay)}<br>
            ` : 'No dusk window calculated.'}
          </div>
        </div>

        <div class="sun-moon-altitude-wrapper" style="margin-top:1rem;">
          <h4>Sun & Moon Altitude Chart</h4>
          <canvas class="sun-moon-altitude-chart" width="800" height="400"></canvas>
        </div>
      `;

      expandedCell.innerHTML = content;
      expandedRow.appendChild(expandedCell);
      row.parentNode.insertBefore(expandedRow, row.nextSibling);

      // Extract params for sun chart
      const latitude = parseFloat(document.getElementById('EditLatitude').value);
      const longitude = parseFloat(document.getElementById('EditLongitude').value);
      const elevation = parseFloat(document.getElementById('EditElevation').value);
      const observer = new Astronomy.Observer(latitude, longitude, elevation);
      const chartCanvas = expandedCell.querySelector('.sun-moon-altitude-chart');
      const chartDate = DateTime.fromISO(date, { zone });

      // Fire the chart
      plotSunAltitudeChart(chartCanvas, observer, chartDate, zone);

      chartCanvas.style.cursor = 'pointer';
      chartCanvas.addEventListener('click', () => {
        showFullscreenChart(observer, chartDate, zone);
      });
    });
  }
}
