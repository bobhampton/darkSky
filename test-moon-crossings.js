const Astronomy = require('astronomy-engine');

const observer = new Astronomy.Observer(76.5, 69.2285, 0);
const start = new Date('2025-04-05T00:00:00Z');
const end = new Date('2025-04-06T00:00:00Z');

console.log('Testing moon crossings on 2025-04-05 with corrected longitude (69.2285):');

let searchStart = start;
let riseCount = 0;
console.log('\nMoon rises:');
while (searchStart < end && riseCount < 5) {
  const daysToSearch = (end.getTime() - searchStart.getTime()) / (1000 * 60 * 60 * 24);
  const event = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, +1, searchStart, daysToSearch);
  if (event && event.date <= end) {
    riseCount++;
    console.log(`  ${riseCount}: ${event.date.toISOString()}`);
    searchStart = new Date(event.date.getTime() + 60000);
  } else {
    break;
  }
}

searchStart = start;
let setCount = 0;
console.log('\nMoon sets:');
while (searchStart < end && setCount < 5) {
  const daysToSearch = (end.getTime() - searchStart.getTime()) / (1000 * 60 * 60 * 24);
  const event = Astronomy.SearchRiseSet(Astronomy.Body.Moon, observer, -1, searchStart, daysToSearch);
  if (event && event.date <= end) {
    setCount++;
    console.log(`  ${setCount}: ${event.date.toISOString()}`);
    searchStart = new Date(event.date.getTime() + 60000);
  } else {
    break;
  }
}

console.log(`\nTotal crossings: ${riseCount + setCount}`);
console.log(`Moon rises: ${riseCount}, Moon sets: ${setCount}`);
