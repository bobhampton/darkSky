export const timezones = Intl.supportedValuesOf('timeZone');

export function populateTimezones() {
  const timezoneSelect = document.getElementById('timezoneSelect');
  timezoneSelect.innerHTML = '';
  const defaultZone = localStorage.getItem('DefaultTimeZone');

  timezones.forEach(tz => {
    const option = document.createElement('option');
    option.value = tz;
    option.textContent = tz;
    if (tz === defaultZone) option.selected = true;
    timezoneSelect.appendChild(option);
  });

  const defaultCheckbox = document.getElementById('saveDefaultTimezone');
  if (defaultZone && defaultCheckbox) {
    defaultCheckbox.checked = true;
  }
}

export function filterTimezones() {
  const search = document.getElementById('timezoneSearch').value.toLowerCase();
  const select = document.getElementById('timezoneSelect');
  select.innerHTML = '';

  const filtered = timezones.filter(tz => tz.toLowerCase().includes(search));

  if (filtered.length > 0) {
    filtered.forEach((tz, idx) => {
      const opt = document.createElement('option');
      opt.value = tz;
      opt.textContent = tz;
      if (idx === 0) opt.selected = true;
      select.appendChild(opt);
    });
  } else {
    const fallback = document.createElement('option');
    fallback.value = 'UTC';
    fallback.textContent = 'UTC';
    fallback.selected = true;
    select.appendChild(fallback);
  }
}

export function initTimezoneControls() {
  populateTimezones();
  const searchBox = document.getElementById('timezoneSearch');
  if (searchBox) {
    searchBox.addEventListener('input', filterTimezones);
  }
}
