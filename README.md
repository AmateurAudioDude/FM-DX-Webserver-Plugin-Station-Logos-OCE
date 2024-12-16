# Station Logos OCE plugin for FM-DX Webserver

This plugin displays station logos for stations with and without RDS data, targeted at Australian FM-DX Webserver owners.

* [Download the latest zip file](https://github.com/AmateurAudioDude/FX-DX-Webserver-Station-Logos-OCE/archive/refs/heads/main.zip)
* Transfer `StationLogosOCE` folder, and `StationLogosOCE.js` to FM-DX-Webserver `plugins` folder
* Extract `logos` folder from file `logos.zip` and transfer to FM-DX-Webserver `web` folder
* Restart FM-DX-Webserver if required
* Login to Adminstrator Panel and enable plugin

> [!NOTE]
> ### Options
>
> - `includeLocalStationInfo`: Set to true to enable logos for stations without [RDS](https://en.wikipedia.org/wiki/Radio_Data_System). Files are to be stored in FM-DX Webserver `/web/logos/local` folder.   
> - `prioritiseSvg`: Set to true to display 'svg' file if both 'svg' and 'png' files exist for tuned station.   

## For stations without RDS data
* Entries can be added in `localstationdata.json` (stored in `/web/logos/json`). Once edited, confirm each line except the last ends with a comma.

* Images can be named with an underscore, followed by station frequency (stored in `/web/logos/local`). Example: `_87.600.png`

* To change logo animation for tentatively loaded PS RDS, Open `pluginStationLogosOCE.js`, find and edit the line containing `const logoEffect`.

v1.2.5
------
* Added option to ignore filename case for RDS PS

v1.2.4
------
* Container is slightly resized if Peakmeter plugin is found
* Added option to prioritise 'svg' over 'png' images
* Added "Santa hat" default logo shown during December

v1.2.3
------
* Minor fixes

v1.2.2
------
* Fix for FM-DX Webserver v1.2.4 compatibility issues
* Fix for tooltips
* Data for stations without RDS stored in json file
* Added more animations for partially loaded PS RDS

v1.2
----
* Public release

Original source code located at: [https://github.com/Highpoint2000/webserver-station-logos](https://github.com/Highpoint2000/webserver-station-logos)
