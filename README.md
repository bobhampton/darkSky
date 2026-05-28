# darkSky

The darkSky repository allows users to easily determine the times when the sky is the darkest for a desired location and date range (i.e. the times when the Sun is -18 degrees below the horizon and there is no moon present in the sky).

## Quick Start

1. **Visit the application**: [https://bobhampton.github.io/darkSky/](https://bobhampton.github.io/darkSky/)
2. **Enter your location**: Input latitude, longitude, and elevation for your observation site
3. **Select timezone**: Choose your local timezone for accurate results
4. **Set date range**: Pick start and end dates for your observation period
5. **Calculate**: Click "Calculate Dark Times" to generate results
6. **Review & Export**: View the interactive table and export data as CSV

For detailed instructions, see the **Getting Started** guide in the application.

## Description

Hosted on GitHub Pages, the darkSky project allows users to effortlessly determine the optimal moments of darkness during the night sky. By inputting a desired date range, latitude/longitude coordinates and timezone, this project calculates the times when there is no observable moon in the sky and the center of the sun is 18 degrees or more below the horizon. The primary objective of darkSky is to support a community science initiative for long-term light pollution monitoring by facilitating the identification of ideal periods when the absence of astronomical twilight and the moon's presence converge.

darkSky simplifies the process of identifying these critical time windows, empowering researchers, citizen scientists, and environmental advocates to contribute to global efforts in understanding and mitigating the effects of artificial light on our night skies.

### Observer Configuration

![Observer Configuration Form](./public/screenshots/observerConfiguration.png)
*Enter your location details, timezone, and date range to begin calculations*

### Dark Times Results

![Dark Times Results Table](./public/screenshots/darkTimesResults.png)
*Interactive table showing all dark time windows with expandable astronomical event details for each date*

### Altitude Chart Visualization

![Altitude Chart](./public/screenshots/altitudeChart.png)
*Interactive charts display Sun and Moon altitude throughout the day, helping visualize astronomical events*

### CSV Export Options

![Simple CSV Export](./public/screenshots/simpleCSV.png)
*Export simplified data with just dark time windows and durations*

![Detailed CSV Export](./public/screenshots/detailedCSV.png)
*Export comprehensive data including all astronomical event metadata*

## Features

- **Precise Astronomical Calculations**: Determines when the Sun is -18° below the horizon (astronomical twilight) and the Moon is not visible
- **Interactive Results Table**: View all dark time windows with expandable details for each date
- **Astronomical Event Details**: See astronomical night start/end times, moonrise/moonset times for any date
- **Chart Visualization**: Interactive altitude charts showing Sun and Moon positions throughout the day
- **CSV Export Options**: 
  - **Simple CSV**: Just the dark time windows and durations
  - **Detailed CSV**: Includes all astronomical event metadata
- **Window Type Classification**: Identifies full dark periods, dusk windows, and dawn windows
- **Timezone Support**: Accurate calculations for any timezone worldwide
- **Date Range Flexibility**: Calculate dark times for any date range
- **Modern UI**: Built with React 19 and Tailwind CSS for a responsive, accessible experience
- **Lazy Loading**: Optimized performance with code splitting and on-demand chart loading
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

## Technology Stack

This project is built with modern web technologies:

### Core Framework
- **React 19** with TypeScript for type-safe, maintainable component architecture
- **Vite 7** for lightning-fast development and optimized production builds
- **React Router** for client-side routing with code splitting

### Styling & UI
- **Tailwind CSS** for responsive, dark-themed styling
- **Chart.js** for interactive altitude visualizations
- **Lazy loading** for optimal performance (charts load on-demand)

### Astronomical Calculations
- **Astronomy Engine** for precise astronomical calculations
- **Luxon** for timezone-aware date/time handling

### Testing & Quality
- **Vitest** with React Testing Library (279 passing tests)
- **TypeScript strict mode** for compile-time safety
- **ESLint** for code quality

## Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

```bash
# Clone the repository
git clone https://github.com/bobhampton/darkSky.git
cd darkSky

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The development server will start at `http://localhost:5173`

## Cite This Work

If you use darkSky in your research, please cite it using the DOI provided by Zenodo.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.14847872.svg)](https://doi.org/10.5281/zenodo.14847872)

## Acknowledgements

This project would not have been possible without:
- This project uses [Astronomy Engine](https://github.com/cosinekitty/astronomy), a suite of open source libraries for calculating positions of the Sun, Moon, and planets, and for predicting interesting events like oppositions, conjunctions, rise and set times, lunar phases, eclipses, transits, and more.
