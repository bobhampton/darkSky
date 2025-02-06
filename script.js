import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js'

const timezones = Intl.supportedValuesOf('timeZone')
const timezoneSelect = document.getElementById('timezoneSelect')

// Get/save the last entered values from local storage
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('EditDateStart').value =
    localStorage.getItem('EditDateStart') || ''
  document.getElementById('EditDateEnd').value =
    localStorage.getItem('EditDateEnd') || ''
  document.getElementById('EditLatitude').value =
    localStorage.getItem('EditLatitude') || ''
  document.getElementById('EditLongitude').value =
    localStorage.getItem('EditLongitude') || ''
  document.getElementById('EditElevation').value =
    localStorage.getItem('EditElevation') || '0'

  document
    .getElementById('observerForm')
    .addEventListener('submit', function () {
      localStorage.setItem(
        'EditDateStart',
        document.getElementById('EditDateStart').value
      )
      localStorage.setItem(
        'EditDateEnd',
        document.getElementById('EditDateEnd').value
      )
      localStorage.setItem(
        'EditLatitude',
        document.getElementById('EditLatitude').value
      )
      localStorage.setItem(
        'EditLongitude',
        document.getElementById('EditLongitude').value
      )
      localStorage.setItem(
        'EditElevation',
        document.getElementById('EditElevation').value
      )
    })

  // Add validation for latitude and longitude
  document
    .getElementById('observerForm')
    .addEventListener('submit', function (event) {
      let latitude = parseFloat(document.getElementById('EditLatitude').value)
      let longitude = parseFloat(
        document.getElementById('EditLongitude').value
      )

      // Ensure latitude and longitude are strings
      latitude = latitude ? latitude.toString() : '';
      longitude = longitude ? longitude.toString() : '';

      // Remove non-numeric characters except for digits, decimal point, and minus sign
      latitude = latitude.replace(/[^0-9.-]/g, '');
      longitude = longitude.replace(/[^0-9.-]/g, '');

      latitude = parseFloat(latitude);
      longitude = parseFloat(longitude);

      console.log('Latitude:', latitude)
      console.log('Longitude:', longitude)

      if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        alert('Latitude must be a number between -90 and 90.')
        event.preventDefault()
      }

      if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        alert('Longitude must be a number between -180 and 180.')
        event.preventDefault()
      }
    })
})

// Add all timezones to dropdown and set up event listener
window.onload = function () {
  populateTimezones()
  document
    .getElementById('observerForm')
    .addEventListener('submit', UpdateScreen)
}

// Populate the timezone dropdown
function populateTimezones () {
  timezones.forEach(tz => {
    const option = document.createElement('option')
    option.value = tz
    option.textContent = tz
    timezoneSelect.appendChild(option)
  })
}

// Function to calculate the moon's altitude
function calculateMoonAltitude (observer, date) {
  const moonPosition = Astronomy.Equator('Moon', date, observer, true, true)
  const moonHorizon = Astronomy.Horizon(
    date,
    observer,
    moonPosition.ra,
    moonPosition.dec,
    'normal'
  )
  return moonHorizon.altitude
}

// Calculate the dark time periods when sun is -18 degrees below the horizon and moon is 0 degrees below the horizon
function getTimes (dtStart, dtEnd, observer) {
  let darkObj = {}

  while (dtStart <= dtEnd) {
    // Calculate the start and end of astronomical twilight
    const twilightStart = Astronomy.SearchAltitude(
      'Sun',
      observer,
      -1,
      dtStart.toJSDate(),
      1,
      -18
    )
    const twilightEnd = Astronomy.SearchAltitude(
      'Sun',
      observer,
      +1,
      dtStart.toJSDate(),
      1,
      -18
    )

    // Calculate the moon rise and set times
    const moonRise = Astronomy.SearchRiseSet(
      'Moon',
      observer,
      +1,
      dtStart.toJSDate(),
      1
    )
    const moonSet = Astronomy.SearchRiseSet(
      'Moon',
      observer,
      -1,
      dtStart.toJSDate(),
      1
    )

    // Get the moon altitude at start/end of day and start/end of astronomical twilight
    const moonAltStartDay = calculateMoonAltitude(observer, dtStart.toJSDate())
    const moonAltEndDay = calculateMoonAltitude(
      observer,
      dtStart.plus({ days: 1 }).toJSDate()
    )
    const moonAltEndTwilight = calculateMoonAltitude(observer, twilightEnd.date)
    const moonAltStartTwilight = calculateMoonAltitude(
      observer,
      twilightStart.date
    )

    // Set current date and initialize dark times array if it doesn't exist
    const currentDate = dtStart.toISODate()
    if (!darkObj[currentDate]) {
      darkObj[currentDate] = []
    }

    // Get dark times during DAWN
    // Check if moon is below the horizon at start of day and end of twilight
    if (moonAltStartDay <= 0 && moonAltEndTwilight <= 0) {
      let dawnDarkTimes = {
        start: dtStart.toJSDate(),
        end: twilightEnd.date,
        type: 'dawn'
      }
      darkObj[currentDate].push(dawnDarkTimes)
    } else if (moonSet && moonAltStartDay >= 0) {
      // Check if moon set time is before end of twilight
      if (moonSet.date.valueOf() < twilightEnd.date.valueOf()) {
        let dawnDarkTimes = {
          start: moonSet.date,
          end: twilightEnd.date,
          type: 'dawn'
        }
        darkObj[currentDate].push(dawnDarkTimes)
      }
    } else if (moonRise && moonAltStartDay <= 0) {
      // Check if moon rise time is before end of twilight
      if (moonRise.date.valueOf() < twilightEnd.date.valueOf()) {
        let dawnDarkTimes = {
          start: dtStart.toJSDate(),
          end: moonRise.date,
          type: 'dawn'
        }
        darkObj[currentDate].push(dawnDarkTimes)
      }
    }

    // Get dark times during DUSK
    // Check if moon is below the horizon at start of twilight and end of day
    if (moonAltStartTwilight <= 0 && moonAltEndDay <= 0) {
      let duskDarkTimes = {
        start: twilightStart.date,
        end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
        type: 'dusk'
      }
      darkObj[currentDate].push(duskDarkTimes)
    } else if (moonSet && moonAltEndDay <= 0) {
      // Check if moon set time is after start of twilight
      if (moonSet.date.valueOf() > twilightStart.date.valueOf()) {
        let duskDarkTimes = {
          start: moonSet.date,
          end: dtStart.plus({ days: 1 }).minus({ milliseconds: 1 }).toJSDate(),
          type: 'dusk'
        }
        darkObj[currentDate].push(duskDarkTimes)
      }
    } else if (moonRise && moonAltEndDay >= 0) {
      // Check if moon rise time is after start of twilight
      if (moonRise.date.valueOf() > twilightStart.date.valueOf()) {
        let duskDarkTimes = {
          start: twilightStart.date,
          end: moonRise.date,
          type: 'dusk'
        }
        darkObj[currentDate].push(duskDarkTimes)
      }
    }
    dtStart = dtStart.plus({ days: 1 })
  } // end while
  return darkObj
}

function IsValidNumber (s) {
  return typeof s === 'string' && /^[\-\+]?\d+(\.\d*)?$/.test(s)
}

function FormatDate (date, zone) {
  return DateTime.fromJSDate(new Date(date)).setZone(zone).toFormat('HH:mm:ss')
}

function DisplayDarkTimes (darkTimes, zone) {
  const tbody = document.getElementById('DarkTimesBody')
  tbody.innerHTML = ''

  const timeZoneDisplay = document.getElementById('TimeZoneDisplay')
  timeZoneDisplay.innerText = `Times are in the selected time zone: ${zone}`

  for (const date in darkTimes) {
    const row = document.createElement('tr')
    const dateCell = document.createElement('td')
    const dawnStartCell = document.createElement('td')
    const dawnEndCell = document.createElement('td')
    const duskStartCell = document.createElement('td')
    const duskEndCell = document.createElement('td')

    dateCell.innerText = date

    const dawnTimes = darkTimes[date].filter(time => time.type === 'dawn')
    const duskTimes = darkTimes[date].filter(time => time.type === 'dusk')

    if (dawnTimes.length > 0) {
      dawnStartCell.innerText = FormatDate(dawnTimes[0].start, zone)
      dawnEndCell.innerText = FormatDate(dawnTimes[0].end, zone)
    }

    if (duskTimes.length > 0) {
      duskStartCell.innerText = FormatDate(duskTimes[0].start, zone)
      duskEndCell.innerText = FormatDate(duskTimes[0].end, zone)
    }

    dateCell.classList.add('center-text')
    dawnStartCell.classList.add('center-text')
    dawnEndCell.classList.add('center-text')
    duskStartCell.classList.add('center-text')
    duskEndCell.classList.add('center-text')

    row.appendChild(dateCell)
    row.appendChild(dawnStartCell)
    row.appendChild(dawnEndCell)
    row.appendChild(duskStartCell)
    row.appendChild(duskEndCell)
    tbody.appendChild(row)
  }
}

function UpdateScreen (event) {
  event.preventDefault()

  const text_latitude = document.getElementById('EditLatitude').value
  const text_longitude = document.getElementById('EditLongitude').value
  const text_elevation = document.getElementById('EditElevation').value
  const text_dateStart = document.getElementById('EditDateStart').value
  const text_dateEnd = document.getElementById('EditDateEnd').value
  let text_timezone = document.getElementById('timezoneSelect').value

  console.log('Selected Time Zone:', text_timezone)

  // Set to UTC if no timezone is selected
  if (!text_timezone) {
    text_timezone = 'UTC'
  }

  if (
    !IsValidNumber(text_latitude) ||
    !IsValidNumber(text_longitude) ||
    !IsValidNumber(text_elevation)
  ) {
    document.getElementById('CalcTable').style.display = 'none'
  } else {
    document.getElementById('CalcTable').style.display = ''

    const latitude = parseFloat(text_latitude)
    const longitude = parseFloat(text_longitude)
    const elevation = parseFloat(text_elevation)
    //const zone = 'America/Denver';
    const zone = text_timezone

    console.log('Zone:', zone)

    const dtStart = DateTime.fromISO(text_dateStart, { zone })
    const dtEnd = DateTime.fromISO(text_dateEnd, { zone })

    console.log('Start Date:', dtStart.toString())
    console.log('End Date:', dtEnd.toString())

    //const observer = new Astronomy.Observer(latitude, longitude, 0);
    const observer = new Astronomy.Observer(latitude, longitude, elevation)
    const darkTimes = getTimes(dtStart, dtEnd, observer)

    DisplayDarkTimes(darkTimes, zone)
  }
}
