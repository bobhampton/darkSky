export function loadInputValue(id, defaultValue = '') {
  const el = document.getElementById(id);
  if (el) {
    el.value = localStorage.getItem(id) || defaultValue;
  }
}

export function saveInputValues(ids) {
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      localStorage.setItem(id, el.value);
    }
  });
}
