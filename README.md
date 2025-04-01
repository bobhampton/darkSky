# darkSky

The darkSky repository allows users to easily determine the times when the sky is the darkest for a desired location and date range (i.e. the times when the Sun is -18 degrees below the horizon and there is no moon present in the sky).

## Description

Hosted on GitHub Pages [here](https://bobhampton.github.io/darkSky/), the darkSky project allows users to effortlessly determine the optimal moments of darkness during the night sky. By inputting a desired date range, latitude/longitude coordinates and timezone, this project calculates the times when there is no observable moon in the sky and the center of the sun is 18 degrees or more below the horizon. The primary objective of darkSky is to support a community science initiative for long-term light pollution monitoring by facilitating the identification of ideal periods when the absence of astronomical twilight and the moon's presence converge.

darkSky simplifies the process of identifying these critical time windows, empowering researchers, citizen scientists, and environmental advocates to contribute to global efforts in understanding and mitigating the effects of artificial light on our night skies.

![GeneratedTable](https://github.com/user-attachments/assets/1be9e43f-5f54-4b87-bea2-5394d878ff53)

### Features
- **CSV Export**: Users can download a `.csv` file containing the calculated dark sky times, including optional metadata such as astronomical twilight start/end, moonrise/set times, and moon altitude at key moments.
- **Detailed Data Display**: All data used to calculate dark sky times can be displayed by clicking on any row in the generated table.

Output table showing all data used to calculate the dark sky times for that day
![ExtraInfoDisplay1](https://github.com/user-attachments/assets/86d87656-33a0-426e-b727-b4c2e04ceeb4)

Even if that day does not have any dark sky times, you can still display all data for that day
![ExtraInfoDisplay2](https://github.com/user-attachments/assets/0796d117-8c2c-4e0e-b3f3-46e726ab4e3b)

## Cite This Work:
If you use darkSky in your research, please cite it using the DOI provided by Zenodo.
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.14847872.svg)](https://doi.org/10.5281/zenodo.14847872)

## Acknowledgements
This project would not have been possible without:
- This project uses [Astronomy Engine](https://github.com/cosinekitty/astronomy), a suite of open source libraries for calculating positions of the Sun, Moon, and planets, and for predicting interesting events like oppositions, conjunctions, rise and set times, lunar phases, eclipses, transits, and more..
