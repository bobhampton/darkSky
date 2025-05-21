import { getTimes, calculateAltitude } from './astronomy.js';
import { FormatDate, IsValidNumber } from './utils.js';
import { saveInputValues } from './storage.js';
import { DisplayDarkTimes } from './table.js';
import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';

export function validateCoordinates(latId, lonId) {
  const latInput = document.getElementById(latId);
  const lonInput = document.getElementById(lonId);
  const lat = parseFloat(latInput.value.replace(/[^0-9.-]/g, ''));
  const lon = parseFloat(lonInput.value.replace(/[^0-9.-]/g, ''));

  if (isNaN(lat) || lat < -90 || lat > 90) {
    alert('Latitude must be a number between -90 and 90.');
    return false;
  }

  if (isNaN(lon) || lon < -180 || lon > 180) {
    alert('Longitude must be a number between -180 and 180.');
    return false;
  }

  return true;
}

export function initForm() {
  const inputIds = ['EditDateStart', 'EditDateEnd', 'EditLatitude', 'EditLongitude', 'EditElevation'];
  inputIds.forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem(id) || (id === 'EditElevation' ? '0' : '');
  });

  const form = document.getElementById('observerForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('🛰️ Submit triggered');

    if (!validateCoordinates('EditLatitude', 'EditLongitude')) return;

    saveInputValues(inputIds);
    UpdateScreen(e);
  });

  const clearBtn = document.getElementById('clearFormBtn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      inputIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
        localStorage.removeItem(id);
      });

      document.getElementById('timezoneSearch').value = '';
      localStorage.setItem('EditElevation', '0');
      alert('Form cleared and local storage reset!');
    });
  }
}

export function UpdateScreen(event) {
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
    console.log('Invalid input values');
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

    // Automatically open the extra details for the first row
    const tbody = document.getElementById('DarkTimesBody');
    const firstRow = tbody.querySelector('tr')
    if (firstRow) {
      firstRow.click();
    }

    // Scroll down past the input fields
    const separator = document.getElementById('scroll-target-separator');
    if (separator) {
      separator.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
