import { DateTime } from 'https://cdn.jsdelivr.net/npm/luxon@2.0.0/build/es6/luxon.js';

    const timezones = Intl.supportedValuesOf('timeZone');
    const timezoneSelect = document.getElementById('timezoneSelect');

    function populateTimezones() {
        timezones.forEach(tz => {
            const option = document.createElement('option');
            option.value = tz;
            option.textContent = tz;
            timezoneSelect.appendChild(option);
        });
    }

    window.onload = function() {
        populateTimezones();
        document.getElementById('observerForm').addEventListener('submit', UpdateScreen);
    };

    function calculateMoonAltitude(observer, date) {
        const moonPosition = Astronomy.Equator('Moon', date, observer, true, true);
        const moonHorizon = Astronomy.Horizon(date, observer, moonPosition.ra, moonPosition.dec, 'normal');
        return moonHorizon.altitude;
    }

    function getTimes(dtStart, dtEnd, observer) {
        let darkObj = {};

        while (dtStart <= dtEnd) {
            const twilightStart = Astronomy.SearchAltitude('Sun', observer, -1, dtStart.toJSDate(), 1, -18);
            const twilightEnd = Astronomy.SearchAltitude('Sun', observer, +1, dtStart.toJSDate(), 1, -18);
            
            const moonRise = Astronomy.SearchRiseSet('Moon', observer, +1, dtStart.toJSDate(), 1);
            const moonSet = Astronomy.SearchRiseSet('Moon', observer, -1, dtStart.toJSDate(), 1);

            let moonAltStartDay = calculateMoonAltitude(observer, dtStart.toJSDate());
            let moonAltEndDay = calculateMoonAltitude(observer, dtStart.plus({days: 1}).toJSDate());
            let moonAltEndTwilight = calculateMoonAltitude(observer, twilightEnd.date);
            let moonAltStartTwilight = calculateMoonAltitude(observer, twilightStart.date);

            const currentDate = dtStart.toISODate();
            if (!darkObj[currentDate]) {
                darkObj[currentDate] = [];
            }

            if (moonAltStartDay <= 0 && moonAltEndTwilight <= 0) {
                let dawnDarkTimes = {
                    start: dtStart.toJSDate(),
                    end: twilightEnd.date,
                    type: 'dawn'
                };
                darkObj[currentDate].push(dawnDarkTimes);
            } else if (moonSet && moonAltStartDay >= 0) {
                if (moonSet.date.valueOf() < twilightEnd.date.valueOf()) {
                    let dawnDarkTimes = {
                        start: moonSet.date,
                        end: twilightEnd.date,
                        type: 'dawn'
                    };
                    darkObj[currentDate].push(dawnDarkTimes);
                }
            } else if (moonRise && moonAltStartDay <= 0) {
                if (moonRise.date.valueOf() < twilightEnd.date.valueOf()) {
                    let dawnDarkTimes = {
                        start: dtStart.toJSDate(),
                        end: moonRise.date,
                        type: 'dawn'
                    };
                    darkObj[currentDate].push(dawnDarkTimes);
                }
            }

            if (moonAltStartTwilight <= 0 && moonAltEndDay <= 0) {
                let duskDarkTimes = {
                    start: twilightStart.date,
                    end: dtStart.plus({days: 1}).minus({milliseconds: 1}).toJSDate(),
                    type: 'dusk'
                };
                darkObj[currentDate].push(duskDarkTimes);
            } else if (moonSet && moonAltEndDay <= 0) {
                if (moonSet.date.valueOf() > twilightStart.date.valueOf()) {
                    let duskDarkTimes = {
                        start: moonSet.date,
                        end: dtStart.plus({days: 1}).minus({milliseconds: 1}).toJSDate(),
                        type: 'dusk'
                    };
                    darkObj[currentDate].push(duskDarkTimes);
                }
            } else if (moonRise && moonAltEndDay >= 0) {
                if (moonRise.date.valueOf() > twilightStart.date.valueOf()) {
                    let duskDarkTimes = {
                        start: twilightStart.date,
                        end: moonRise.date,
                        type: 'dusk'
                    };
                    darkObj[currentDate].push(duskDarkTimes);
                }
            }

            dtStart = dtStart.plus({days: 1});
        }
        return darkObj;
    }

    function IsValidNumber(s) {
        return typeof s === 'string' && /^[\-\+]?\d+(\.\d*)?$/.test(s);
    }

    function FormatDate(date) {
        return DateTime.fromJSDate(date).toISO();
    }

    function DisplayDarkTimes(darkTimes, zone) {
        const tbody = document.getElementById('DarkTimesBody');
        tbody.innerHTML = '';

        const timeZoneDisplay = document.getElementById('TimeZoneDisplay');
        timeZoneDisplay.innerText = `Times are in the selected time zone: ${zone}`;

        for (const date in darkTimes) {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            const dawnStartCell = document.createElement('td');
            const dawnEndCell = document.createElement('td');
            const duskStartCell = document.createElement('td');
            const duskEndCell = document.createElement('td');

            dateCell.innerText = date;

            const dawnTimes = darkTimes[date].filter(time => time.type === 'dawn');
            const duskTimes = darkTimes[date].filter(time => time.type === 'dusk');

            if (dawnTimes.length > 0) {
            dawnStartCell.innerText = DateTime.fromJSDate(new Date(dawnTimes[0].start)).setZone(zone).toFormat('HH:mm:ss');
            dawnEndCell.innerText = DateTime.fromJSDate(new Date(dawnTimes[0].end)).setZone(zone).toFormat('HH:mm:ss');
            }

            if (duskTimes.length > 0) {
                duskStartCell.innerText = DateTime.fromJSDate(new Date(duskTimes[0].start)).setZone(zone).toFormat('HH:mm:ss');
                duskEndCell.innerText = DateTime.fromJSDate(new Date(duskTimes[0].end)).setZone(zone).toFormat('HH:mm:ss');
            }

            dateCell.classList.add('center-text');
        dawnStartCell.classList.add('center-text');
        dawnEndCell.classList.add('center-text');
        duskStartCell.classList.add('center-text');
        duskEndCell.classList.add('center-text');

            row.appendChild(dateCell);
            row.appendChild(dawnStartCell);
            row.appendChild(dawnEndCell);
            row.appendChild(duskStartCell);
            row.appendChild(duskEndCell);
            tbody.appendChild(row);
        }
    }

    function UpdateScreen(event) {
        event.preventDefault();

        const text_latitude = document.getElementById('EditLatitude').value;
        const text_longitude = document.getElementById('EditLongitude').value;
        const text_elevation = document.getElementById('EditElevation').value;
        const text_dateStart = document.getElementById('EditDateStart').value;
        const text_dateEnd = document.getElementById('EditDateEnd').value;
        let text_timezone = document.getElementById('timezoneSelect').value;

        console.log('Selected Time Zone:', text_timezone);

        // Set to UTC if no timezone is selected
        if (!text_timezone) {
            text_timezone = 'UTC';
        }

        if (!IsValidNumber(text_latitude) || !IsValidNumber(text_longitude) || !IsValidNumber(text_elevation)) {
            document.getElementById('CalcTable').style.display = 'none';
        } else {
            document.getElementById('CalcTable').style.display = '';

            const latitude = parseFloat(text_latitude);
            const longitude = parseFloat(text_longitude);
            const elevation = parseFloat(text_elevation);
            //const zone = 'America/Denver';
            const zone = text_timezone;

            console.log('Zone:', zone);

            const dtStart = DateTime.fromISO(text_dateStart, { zone });
            const dtEnd = DateTime.fromISO(text_dateEnd, { zone });

            console.log('Start Date:', dtStart.toString());
            console.log('End Date:', dtEnd.toString());

            const observer = new Astronomy.Observer(latitude, longitude, 0);
            const darkTimes = getTimes(dtStart, dtEnd, observer);

            DisplayDarkTimes(darkTimes, zone);
        }
    }

    document.getElementById('download-csv-button').addEventListener('click', () => {
        const darkTimes = getTimes(dtStart, dtEnd, observer); // Ensure you have the darkTimes data available
        downloadCSV(darkTimes);
    });

    function convertToCSV(darkTimes) {
        const headers = ['Date', 'Dark Time Start (Dawn)', 'Dark Time End (Dawn)', 'Dark Time Start (Dusk)', 'Dark Time End (Dusk)'];
        const rows = darkTimes.map(time => [
            time.date,
            time.darkTimeStartDawn,
            time.darkTimeEndDawn,
            time.darkTimeStartDusk,
            time.darkTimeEndDusk
        ]);
    
        let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
        rows.forEach(row => {
            csvContent += row.join(',') + '\n';
        });
    
        return encodeURI(csvContent);
    }

    function downloadCSV(darkTimes) {
        const csvContent = convertToCSV(darkTimes);
        const link = document.createElement('a');
        link.setAttribute('href', csvContent);
        link.setAttribute('download', 'dark_times.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }