/*
    Station Logos OCE + Station Info for no RDS v1.3.6 by AAD
    https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Station-Logos-OCE

    https://github.com/Highpoint2000/webserver-station-logos
*/

'use strict';

(() => {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const includeLocalStationInfo = true;       // Set to false to disable displaying localstationdata.json info
const delayLocalStationInfo = true;         // Enable to instantly display local station info and disregard signal strength stabilising first
const prioritiseSvg = true;                 // Display 'svg' file if both 'svg' and 'webp' files exist for tuned station
const prioritiseSvgLocal = false;           // Display 'svg' file if both 'svg' and 'png' files exist for tuned station (for stations without RDS)
const logoEffect = 'fade-animation';        // imageRotate, curtain, fade-animation, fade-grayscale
const signalDimThreshold = -103;            // Value in dBm
const signalHoldThreshold = -101;           // Value in dBm
const decemberSantaHatLogo = true;          // Santa hat as default logo during December

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const pluginVersion = '1.3.6';
const pluginName = "Station Logos OCE";
const pluginHomepageUrl = "https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Station-Logos-OCE";
const pluginUpdateUrl = "https://raw.githubusercontent.com/AmateurAudioDude/FM-DX-Webserver-Plugin-Station-Logos-OCE/refs/heads/main/StationLogosOCE/pluginStationLogosOCE.js";
const pluginSetupOnlyNotify = true;
const CHECK_FOR_UPDATES = true;

const basePath = window.location.pathname.replace(/\/?$/, '/');
const logosPath = `${basePath}logos`.replace(/\/+/g, '/');          // /logos
const apiPath = `${basePath}logos-data`.replace(/\/+/g, '/');       // /logos-data

// Declare stationData
let stationData = {};

if (includeLocalStationInfo) {
    // Local station data file
    const protocol = window.location.protocol; // http
    const hostname = document.location.hostname; // example.com
    const port = window.location.port; // 8080

    let dataFilePath = `${protocol}//${hostname}`;
    if (port) { dataFilePath += `:${port}`; }
    dataFilePath += `${logosPath}/json/localstationdata.json`;

    // Fetch localstationdata.json
    fetch(dataFilePath).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    }).then(data => {
        stationData = data; // Update stationData with fetched data
    }).catch(error => {
        console.error(`${pluginName}: Error fetching station data:`, error);
    });
}

// CSS code
document.head.appendChild(Object.assign(document.createElement('style'), {
  textContent: `
	@keyframes fadeIn {
		0% { opacity: 0; }
		75% { opacity: 0; }
		100% { opacity: 1; }
	}

	@-moz-keyframes spin { 100% { -moz-transform: rotate(360deg); } }
	@-webkit-keyframes spin { 100% { -webkit-transform: rotate(360deg); } }
	@keyframes spin { 100% { -webkit-transform: rotate(360deg); transform:rotate(360deg); } }
	.imageRotate {
		-webkit-animation: spin 2s linear infinite;
		-moz-animation: spin 2s linear infinite;
		animation: spin 2s linear infinite;
	}

    @keyframes curtain-animation {
        0% {
            clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
        }
        100% {
            clip-path: polygon(50% 0, 50% 100%, 50% 100%, 50% 0);
        }
    }
    .curtain {
		-webkit-animation: curtain-animation 2s ease-in-out infinite alternate;
		-moz-animation: curtain-animation 2s ease-in-out infinite alternate;
        animation: curtain-animation 2s ease-in-out infinite alternate;
    }

    @keyframes fadeInOut {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }
    .fade-animation {
      animation: fadeInOut 4s ease-in-out infinite;
    }

    @keyframes fadeGrayscale {
      0% { filter: grayscale(0%); }
      50% { filter: grayscale(50%); }
      100% { filter: grayscale(0%); }
    }
    .fade-grayscale {
      animation: fadeGrayscale 4s ease-in-out infinite;
    }

	.logoFull { filter: brightness(100%) }
	.logoDim { filter: brightness(50%) }
  `
}));

let defaultImagePath;

const currentDate = new Date();

if (currentDate.getMonth() === 11 && decemberSantaHatLogo) {
    defaultImagePath = 'data:image/webp;base64,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';
} else {
    defaultImagePath = 'data:image/webp;base64,UklGRuoJAABXRUJQVlA4TN0JAAAvq8AqEAFJbiNJkgSTWXfPYvX/B7tnRNWxbxH9nwD9grvKG1zlDbaFZOn/oyKBkrfUsjlVlEjJgYcXG6CtBJAkli4yXrWBTkkBMhXk/0LC0NpqDdjeFCDJXymCYQDbr9rQgyRAwkMearcGvB9MBSAS01bLXJRIJ68BG3AhznR1vvD8kSD5oh+QbKkfyMhAq/H4izp6RUgW22b2IksyVs0HX3SQBDiwgWKzFyk6CFA9Mr1Fr7ECJAmA/q9gLwZ0zB5O67V3SiigbG1r43n3+zxgFEmSovSvdkkC7/G9BAJJKPvTjcCojSRHhlL80W26+Or/BOALVw1OhWo0qcmPfRnY12FxoWs6b+Ps7aRuvp1TAPsa1hNViLFDlUD4f4JyI0mSJElq73tzDwKGf6qahCKgUQl0VbqbR+bMtyE1kiRJsmwkAaUhDMTBsa+CUhBa+7orIES2XbfZq/wE40ERhEIQBEMQFEExFEEogoRSbTuCHOk1AptBaRiYQf1i0AysZGAIKgYeBgoGhqBkUBB+LGfnXM4OoiQrdaVxo3lfQEVMsj+AP+Cbmj7955Mh7giFD7wBDHrMfW1xggKBAAgAYAA/05C7/0BBuAEYjef1uJP4BC8JGnD/2AFxhEDg1skCUwNjcOYg8A1eEuZ64A7ATKP7WgEhP6ob+Op8p0EDAAdPnAZ4wKsAAMagwx3wZY/CpQhYCW9rCYm/eAP/6zymAQDQoAGAvSAoPgQAe/GxHygIOzxlRaOxA1VQpbmuugAE6HlbK5G4g391nAbYrwYgKFKxNSBQACW6X4EuWrdl14zOQH2sgZtwg5Hgz4oFACXjO5TschdgGm26/oHCJ/jhrwN2QTEXXbELAMD2rZFZ4EsuANW0Hwi3H04HONgFsADwlA0B1aDhRjnsKy7IZsHtF50fdBTdsemt4VpsBOJ6u7AxeRO5rx0QeD8AAIClAICITwYAfQXQudPgBN4B4Ac/VqPoDIPsdl14HwJvP3gCDMAJ7EI3ZF6rwEYPTE7jNl9ukPrVZw4QAIEAiOg3FbU0EN6ac661D39BiUFyBgbdqQlByAiQ70Iv3XXfK5EIGEbBJTgx6UlwBIwSHemCxETAsT9HNby9d0IQQH+h4RAk7sADAAASKxYaWStm0AIj3ddHGFNi4QGhk6xSHMrbtveONxr3V8HS+PC3B8BBZwuccAgMg+AMnLMGjAl+F652xdWAAL/4AsDTEAjsABQAimfQowAw1lx+0IIeuw6caLj375hqNSzQ4Da4wQc3AQAMHkF3xAAAXgFQdhzGv5X4Bh1IsCBRg6lprOGeichUwACDzqE2wpVgz0oxoAOGwJKEB7phLwAm7Izokr6nh4JSju6Mwf/VWH+Di0RmVBdFLQ2+lkxcMK3SAxuixmMklxAIxEu/hzEzCACNnSmKxFWNR/Hmfa8ABoG55C9rm2IXLmkGl5CvDTGd4KFrFACdtSUMVgKynchEIDMxUZ0/h2qYiQTgF/jxArgNKh1gFFYJDkwDBufIzW2p1yQORAPQg8y2seAGZHMGAH8OgEHfplE481YEoQ7gP3StIfYLuAYFDjhoZnDoFpCgptYNwh38CQZhD8MzD+uLplkD45lsQnVPgpIST0wETkyD1FddU3/AmrgL1bj3TVU2LkMJdZvARi7bFglqkOD0hMIGUQ/GfmG7x6u0GwbPCix0AiKqEWzUBRx6IzmUVTka6/VA3R3wSB0DjJ01x6g9AtQCa0WCbRnfJQqIEwfwqmXE0dVxO+HCo65nEBE1tjK0wiydguFqCiQAibeBopEJu5bqBpXpgw246k4GWcgAA7CgKHrllupuMzsQnYgVuls4KeFwMChmH6jF/QM7HLUjM2+p31IWBFgHJpCvDiaxev1gTKQ0jBWZ1GngBk2aL66YJLhDzjN0/Hsw6qVP4kC1K8gjW8YLjgr8RkVMciUqAqqPYIq5BgBRzAMAFgaEgyOubBPXFIAIGXk6RBbw4YBXPSiA8ZWpBmVq9uzQxgSzK8PuFG5DDThgEEXEAF73JiDOTkw4axDQaHBERlPsO4QXIqKRbVkGZhkWavQkDAvOfDMc6nKVDF4hfeLxZjOg+laFciv1TV4zLMi+sjQ+5atM5+n8LWCDla/SxoNCJgyMBJNbwWC5zoJrv8oEANXfaA4MT7BxiuqIhRmAsbp7NQy7AeIcgyzbiJ+3YgZCwHiFbmxdeLGuiyGGQUwbGuEYvJyZs2x6M81CoHiQhA/jIrId59EngKizsGZnhJEZzjDGRyFaYbCP2HdA2TBSgj53N5QZDlk5ndVzfCQo2Zio7lDD4Xk8QYCRSQsmAGTrZpbVAiqrZRgeh8NpJicOEwRQFxkYzNLnPlBVhpOaeXixKcKatUX4uCjoEgQFQBaHF+xC4VlVfva8ACsDirPpATRWYDiCohQCz6Qb5g4UCUrg7R6voz54z7r5AqAog3FkrgFCrpy+pFWPwVW33lZh+wQIwZ4PmMhicDz97T0aCn195j7fUG231F74EHF8LjN/muygkQJeE1Rtr/mTPrCCsoH1CxHLjqnAm02Z0sfN9hskamrZqzE5lwYXGrjQ+PpoG8bv0XB3SO2Pid5ZoLNNgALNL2D3b1CDgb5T7wZZMIjMTGDdwi2OTMQr6sB4hUEm1TU7tC0OC3nYkX8U2IACMyDQM3ruiisssFE1isC/4EAiUYd3gP0euAPGGjYtRETf0BSFJWuql2B4wi3BDqzB1QY1yPDdKgYkGWb0ACF0jKhCeARoLliYXMEg1BSdqgfuUDH7+mtYAGSDYmE8bgBSLxG6z/5peGPHzNKxxXogjhbFTAbhgh84VQ6eKIwTndQ0Nia8CYD6DIGcYu2EADChAQ1A4TlS0AWiJhFuWbOoJbMfABQPDxzgE4WmGjuHIxTuHrzrdEdhHHGbwQ66KwyFMQISAgAt86f51Cr+6+VWIPpvlisRUbiD988OUHTLptT2z7TPIJ/aSH2f9HYRwNjT7ynRGOoHVwcnkEjcwPvPG6ChBcJeUJ4SOg4uwSTsAAAMY4p5EOIjQQA8ft6AHZ7fi3dLLD3q7LfKA/d/0HvqNx8/T4CGHfphCPQxcNmiTwa73YVXHXxmaHjiAAAa4AG9HavpZ1rC4PSEZyc5XHYEOMwO/yuww2vfSZYNBiMFEpyfkJMxFLlgAwAA1vVaNM4LgBM1Gu8xZxi8KftvVi6wa+R6sRf/oVGdu0iuudwuBOjEmE7zJw/bsZGXOanTBpoJhQPCrFrDP108jQWduH7muzMAUOgFa6jtNV/zJ6DX/EOH/R6FGe3BhF4HGw0un6D41nhAKEy8R+o3VgFfV//PMRg58al44iH1DiHRGBiurkUhZ40K18EfwOCbmj7953MhAAA=';
}

// Desktop HTML
let showPeakmeter = localStorage.getItem("showPeakmeter");
let LogoContainerHtml;

document.addEventListener('DOMContentLoaded', function () {
    let isPeakmeterFound = document.getElementById('peak-meter-container');
    const existsVisualEqPlugin = (localStorage.getItem('visualeq_settings') && window.innerWidth > 768) ? 182 : 160;

    if (showPeakmeter === 'true' || (isPeakmeterFound && !showPeakmeter)) {
        LogoContainerHtml = '<div style="width: 2.95%; min-width: 2.95%"></div> <!-- Spacer -->' +
        '<div class="panel-25 m-0 hide-phone" style="width: 64%; max-width: 64%; min-width: ' + existsVisualEqPlugin + 'px">' +
        '    <div id="logo-container" style="width: auto; height: 72px; display: flex; justify-content: center; align-items: center; margin: auto">' +
        '        <img id="station-logo" src="' + defaultImagePath + '" alt="Default logo" style="width: auto; max-width: 160px; padding: 0px 2px; margin: 0 8px; max-height: 100%; margin-top: 18px; border-radius: 4px; display: block; image-rendering: auto">' +
        '    </div>' +
        '</div>';
    } else {
        LogoContainerHtml = '<div style="width: 5.3%; min-width: 2.5%"></div> <!-- Spacer -->' +
        '<div class="panel-25 m-0 hide-phone" style="width: 48%; max-width: 48%; min-width: ' + existsVisualEqPlugin + 'px">' +
        '    <div id="logo-container" style="width: auto; height: 72px; display: flex; justify-content: center; align-items: center; margin: auto">' +
        '        <img id="station-logo" src="' + defaultImagePath + '" alt="Default logo" style="width: auto; max-width: 140px; padding: 0px 2px; margin: 0 8px; max-height: 100%; margin-top: 18px; border-radius: 4px; display: block; image-rendering: auto">' +
        '    </div>' +
        '</div>';
    }

    // Insert the new HTML code after the named <div>
    if (window.location.pathname !== '/setup') document.getElementById("ps-container").insertAdjacentHTML('afterend', LogoContainerHtml);

    // The new HTML for the div element with the Play / Stop button
    let buttonHTML = '<div class="panel-10 no-bg h-100 m-0 m-right-20 hide-phone" style="width: 88px; margin-right: 20px !important;">' +
                         '<button class="playbutton" aria-label="Play / Stop Button"><i class="fa-solid fa-play fa-lg"></i></button>' +
                      '</div>';
    // Select the original div element
    let originalDiv = document.querySelector('.panel-10');
    // Create a new div element
    let buttonDiv = document.createElement('div');
    buttonDiv.innerHTML = buttonHTML;
    // Replace the original div element with the new HTML
    if (window.location.pathname !== '/setup') {
        originalDiv.outerHTML = buttonDiv.outerHTML;
        document.getElementById('ps-container').style.padding = '12px';
        document.getElementById('station-logo').oncontextmenu = function(e) { e.preventDefault(); };
    }
});

// Mobile HTML
if (window.location.pathname !== '/setup') {
    const container = document.querySelector('#flags-container-phone .show-phone');

    if (container) {
      const logoContainer = document.createElement('div');
      logoContainer.id = 'logo-container-phone';
      logoContainer.style.cssText = 'width: auto; height: 70px; display: flex; justify-content: center; align-items: center; margin: auto; margin-bottom: 32px;';

      const logoImage = document.createElement('img');
      logoImage.id = 'station-logo-phone';
      logoImage.src = defaultImagePath;  // Make sure defaultImagePath is defined
      logoImage.alt = 'station-logo-phone';
      logoImage.style.cssText = 'max-width: 160px; padding: 1px 2px; max-height: 100%; border-radius: 8px; display: block; image-rendering: auto;';

      logoContainer.appendChild(logoImage);
      container.prepend(logoContainer);  // Insert at top
    }
}

const localpath = `${logosPath}/`; // Path to local logo images
let freqData, logoImage, logoLocal, mobileRefresh, mobileRefreshNew;
let intervalDividerPrimary = 5;
let intervalDividerSecondary = 1.25;
let firstLocalstationRun = false;
let firstLocalstationRunCounter = 0;
let firstLocalstationRunCounterMax = 10;
let logoRotate = false;
let logoPIPSVisible = false;
let signalHoldMax = 10 * ((intervalDividerPrimary / intervalDividerSecondary) / 1.6666); // seconds
let signalHold = 0; // seconds
let signalDimMax = 30 * ((intervalDividerPrimary / intervalDividerSecondary) / 1.6666); // seconds
let signalDim = signalDimMax; // seconds
let localStationDelayCounterMax = delayLocalStationInfo ? 8 : 0;
let localStationDelayCounter = localStationDelayCounterMax;
let setIntervalMain;
let setTimeoutMain;
let freq = 0;
let dataFreq = 0;
let lastLocalAntenna = 0;
let isLocalActive = false;
let debug = false;

const optionSaveAntenna = (!!document.getElementById('data-ant'));

// Function to get the current antenna value
function getCurrentAntennaValue() {
  const dataAntInput = document.querySelector('.data-ant input');
  if (dataAntInput) {
    const currentAntennaText = dataAntInput.value || dataAntInput.placeholder;
    // Find the option that matches the current text
    const options = document.querySelectorAll('.data-ant li.option');
    for (let option of options) {
      if (option.textContent.trim() === currentAntennaText.trim()) {
        return !optionSaveAntenna ? '0' : (option.getAttribute('data-value') || '0');
      }
    }
  }
  return '0'; // Default antenna value
}

function tryUpdateLocalInfoFromAntennaChange() {
  const usingFallbackData = !!documentLocal && (documentLocal.getAttribute('data-tooltip')?.includes('local station info') || isLocalActive);

  if (usingFallbackData) {
    TXInfoField();
    LocalStationInfoField();
  }
}

// Check PI or local frequency
document.addEventListener("DOMContentLoaded", function() {
    function setupAntennaObserver() {
        const dataAntContainer = document.querySelector('.data-ant');
        if (!dataAntContainer) return;

        let antennaUpdateTimeout = null;

        // --- Main observer ---
        const observer = new MutationObserver(() => {
            clearTimeout(antennaUpdateTimeout);

            antennaUpdateTimeout = setTimeout(() => {
                lastLocalAntenna = getCurrentAntennaValue(); // Update antenna tracking when antenna changes
                tryUpdateLocalInfoFromAntennaChange();
            }, 1000);
        });

        observer.observe(dataAntContainer, {
            attributes: true,
            childList: true,
            characterData: true,
            subtree: true
        });

        // --- Additional observer ---
        const ANTENNA_ADDITIONAL_OBSERVER = false;

        if (ANTENNA_ADDITIONAL_OBSERVER) {
            const input = document.querySelector('#data-ant input');
            if (input) {
                const placeholderObserver = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.attributeName === 'placeholder') {
                            clearTimeout(antennaUpdateTimeout);

                            antennaUpdateTimeout = setTimeout(() => {
                                lastLocalAntenna = getCurrentAntennaValue(); // Update antenna tracking when antenna changes
                                tryUpdateLocalInfoFromAntennaChange();
                            }, 1000);
                        }
                    }
                });

                placeholderObserver.observe(input, {
                    attributes: true,
                    attributeFilter: ['placeholder']
                });
            }
        }

        // --- Main listener ---
        const ANTENNA_LISTENER = true;

        if (ANTENNA_LISTENER) {
            let lastProcessedTime = 0;
            let reconnectAttempts = 0;
            let executeFunction = false;
            let ant;
            let previousAnt;

            const TIMEOUT_DURATION = 500;

            window.addEventListener('DOMContentLoaded', (event) => {
                executeFunction = true;
            });

            function connectWebSocket() {
                if (window.socket.readyState === WebSocket.OPEN) {
                    reconnectAttempts = 0;
                }

                window.socket.addEventListener('message', (event) => {
                    handle_ANTENNA_LISTENER(event);
                });

                window.socket.addEventListener('close', () => {
                    console.log(`[${pluginName}] ANTENNA_LISTENER: WebSocket closed. Attempting to reconnect...`);
                    attemptReconnect();
                });

                window.socket.addEventListener('error', (err) => {
                    attemptReconnect();
                });
            }

            function attemptReconnect() {
                if (reconnectAttempts >= 500) return;

                setTimeout(() => {
                    reconnectAttempts++;
                    connectWebSocket();
                }, 10000);
            }

            function handle_ANTENNA_LISTENER(event) {
                const now = Date.now();

                if (now - lastProcessedTime < TIMEOUT_DURATION) return;
                lastProcessedTime = now;

                const { ant } = JSON.parse(event.data);

                if (!previousAnt) previousAnt = ant;

                function updateAnt(ant) {
                    if (previousAnt !== ant) {
                        clearTimeout(antennaUpdateTimeout);

                        antennaUpdateTimeout = setTimeout(() => {
                            lastLocalAntenna = getCurrentAntennaValue(); // Update antenna tracking when antenna changes
                            tryUpdateLocalInfoFromAntennaChange();
                        }, 1000);
                    }

                    previousAnt = ant;
                }

                if (executeFunction) updateAnt(ant);
            }

            connectWebSocket();
        }
    }

    setupAntennaObserver();

    $(document).ready(function() {
        setIntervalMain = setInterval(CheckPIorFreq, 1000 / intervalDividerPrimary);
        setTimeoutMain = setTimeout(() => {
            clearInterval(setIntervalMain);
            setIntervalMain = setInterval(CheckPIorFreq, 1000 / intervalDividerSecondary);
        }, 10000);

        // Initialise MutationObserver for #data-frequency
        const targetNode = document.getElementById('data-frequency');
        const config = { childList: true, subtree: true };

        // MutationObserver callback
        const observerCallback = (mutationsList) => {
            let dataFreq;

            for (let mutation of mutationsList) {
                if (mutation.type === 'childList' || mutation.type === 'subtree') {
                    if (data.freq || targetNode.textContent) {
                        dataFreq = Number(data.freq) || Number(targetNode.textContent);
                        if (freq !== 0 && freq !== dataFreq) {
                            freq = dataFreq;
                            if (debug) console.log(`${pluginName}: Frequency changed:`, freq);

                            if (typeof setIntervalMain !== 'undefined') clearInterval(setIntervalMain);

                            setIntervalMain = setInterval(CheckPIorFreq, 1000 / intervalDividerPrimary);

                            if (typeof setTimeoutMain !== 'undefined') clearTimeout(setTimeoutMain);

                            setTimeoutMain = setTimeout(() => {
                                clearInterval(setIntervalMain);
                                setIntervalMain = setInterval(CheckPIorFreq, 1000 / intervalDividerSecondary);
                            }, 10000);

                            setTimeout(() => { // Might actually be executing too quickly
                                CheckPIorFreq();
                            }, 20);

                            return;
                        }
                        freq = dataFreq;
                    }
                }
            }
        };

        // Create observer
        const observer = new MutationObserver(observerCallback);
        if (window.location.pathname !== '/setup') observer.observe(targetNode, config);

    });
});

function CheckPIorFreq() {
    let imgLogoImage, previousfreqData;
    if (debug) console.log(`${pluginName}: `, 'freq', (data.freq || document.getElementById("data-frequency").textContent), ' localStationDelayCounter:', localStationDelayCounter, ' signalHold:', signalHold, ' firstLocalstationRun:', firstLocalstationRun, '   ', CheckPIorFreq);

    if (!firstLocalstationRun) {
        firstLocalstationRunCounter++;
        if (firstLocalstationRunCounter >= firstLocalstationRunCounterMax) {
            firstLocalstationRun = true;
        }
    }

	// Check if mobile device code executed within function to catch any change in screen orientation
	if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) && window.matchMedia("(orientation: portrait)").matches || window.innerWidth <= 768) {
		logoImage = $('#station-logo-phone');
		imgLogoImage = 'station-logo-phone';
	} else {
		logoImage = $('#station-logo');
		imgLogoImage = 'station-logo';
	}

	const piCode = $('#data-pi').text().toUpperCase().trim();
	const psCode = $('#data-ps').text().trim().replace(/^_+/, '').replace(/\s+/g, '_').replace(/_+$/, '');
	const signalData = $('#data-signal').text().trim();
	const signalCalc = {'dbm': signalData, 'dbf': signalData - 120, 'dbuv': signalData - 108.75}[localStorage.getItem('signalUnit').toLowerCase()] || -30;
	previousfreqData = freqData;
	freqData = $('#data-frequency').text().trim();

    const currentAntenna = getCurrentAntennaValue();
    const rawEntry = stationData[freqData];
    const entryList = Array.isArray(rawEntry)
      ? rawEntry.filter(entry => entry && typeof entry === 'object')  // clean array
      : rawEntry && typeof rawEntry === 'object'
        ? [rawEntry]
        : [];
    const matchedEntry = entryList.find(entry => {
      return !entry.ant || entry.ant === currentAntenna;
    }) || {};
    const {
      name: customStationName,
      loc: customStationLoc,
      pwr: customStationPwr,
      pol: customStationPol,
      dist: customStationDist,
      azi: customAzimuth,
      ant: customAnt
    } = matchedEntry;

	signalHold = (signalCalc >= signalHoldThreshold) ? parseInt(signalHoldMax) : signalHold - 1; // Cooldown before hiding local station info
	signalHold = (signalHold <= 0) ? 0 : signalHold;
	signalDim = (signalCalc >= signalDimThreshold) ? signalDimMax : signalDim - 1; // Cooldown before dimming logo
	signalDim = (signalDim <= 0) ? 0 : signalDim;

	// Dim logo on low signal
	let img = document.getElementById(imgLogoImage);
    if (window.location.pathname !== '/setup') {
        if (signalDim) {
            img.className = '';
            if (logoRotate) {
                img.classList.add('logoFull', logoEffect);
                setTimeout(() => {
                    img.classList.remove(logoEffect);
                }, 128000);
            } else {
                img.classList.add('logoFull');
            }
        } else {
            img.className = '';
            img.classList.add('logoDim');
        }
    }

	// Check if confirmed PI code exists
	if (freqData) {
		if (freqData !== previousfreqData) { // Default logo on frequency change
			logoImage.attr('src', defaultImagePath).attr('alt', 'Default logo');
			logoRotate = true;
			signalHold = 0; // Reset displaying local station info unless the signal is strong enough
		}
		if (!piCode === '' || !piCode.includes('?')) { // PI+PS logo update
			updateStationLogo(piCode, psCode);
		} else if (includeLocalStationInfo && customStationName && signalHold) { // Local station info if signal is greater than signalHoldThreshold in dBm value
			if (freqData !== previousfreqData) { logoLocal = false; }
			if (signalCalc >= signalHoldThreshold) {
                updateLocalStationInfo();
            } else {
                localStationDelayCounter = 0;
            }
			logoPIPSVisible = false;
		} else { // Default logo
			logoImage.attr('src', defaultImagePath).attr('alt', 'Default logo');
			logoRotate = false;
			window.piCode = '';
			window.psCode = '';
			logoLocal = false; // Needed for local station signal threshold
			logoPIPSVisible = false;
            if (firstLocalstationRun) localStationDelayCounter = 0;
			TXInfoField();
		}
	}
}

// Display PI+PS logo JS code
function updateStationLogo(piCode, psCode) {
    if (window.matchMedia("(orientation: portrait)").matches) {
        mobileRefreshNew = 'p';
    } else {
        mobileRefreshNew = 'l';
    }

    if (piCode !== window.piCode || psCode !== window.psCode || mobileRefresh !== mobileRefreshNew) {
        window.piCode = piCode;
        window.psCode = psCode;

        if (window.matchMedia("(orientation: portrait)").matches) {
            mobileRefresh = 'p';
        } else {
            mobileRefresh = 'l';
        }

        let paths;

        paths = [`${localpath}${piCode}_${psCode}`];

        paths.unshift(`${localpath}${piCode}`);

        // Fetch logo
        let supportedExtensions = prioritiseSvg ? ['svg', 'webp', 'png'] : ['webp', 'png', 'svg'];
        let found = false;

        // Fetch available logo list once
        fetch(`${apiPath}`, {
            method: 'GET',
            headers: {
                'X-Plugin-Name': 'StationLogosOCEPlugin',
            }
        })
        .then(response => response.json())
        .then(data => {
            let availableLogos = data.availableLogos.map(file => file.toLowerCase()); // Store lowercase filenames

            function checkNextPath(index) {
                if (found || index >= paths.length) {
                    return;
                }

                const path = paths[index];

                // Check if any available logo matches expected case-insensitive filename
                let matchingLogo = supportedExtensions
                    .map(ext => `${path}.${ext}`)
                    .find(file => availableLogos.includes(file.split('/').pop().toLowerCase()));

                if (debug) console.log(`${pluginName}: Checking path ${path}`);

                if (matchingLogo) {
                    let correctFilename = data.availableLogos.find(file => file.toLowerCase() === matchingLogo.split('/').pop().toLowerCase());

                    if (correctFilename) {
                        logoImage.attr('src', `${logosPath}/${correctFilename}`) // Use the correct case-sensitive filename
                            .attr('alt', `Logo for ${psCode.replace(/_/g, ' ')}`)
                            .css('display', 'block')
                            .css('image-rendering', 'auto')
                            .attr('class', '');
                        logoPIPSVisible = true;
                        found = true;
                        logoRotate = false;
                    }
                } else {
                    checkNextPath(index + 1); // Continue checking next path
                }
            }

            checkNextPath(0); // Start checking paths
        })
        .catch(err => console.error(`${pluginName}: Failed to fetch logo list`, err));

        // Replace local station field if it exists with TX info field
        if (logoLocal) {
            logoLocal = false;
            TXInfoField();
        }

        // Rotating logo during PS loading
        if (!found && !logoRotate && !logoPIPSVisible) {
            logoImage.attr('src', defaultImagePath)
                .attr('alt', 'Empty logo')
                .attr('class', logoEffect);
            logoRotate = true;
        }
    }
}

let documentLocal = document.querySelector('div.flex-container.flex-phone.flex-phone-column div.panel-33.hover-brighten.tooltip');
let rtInfo = document.getElementById('rt-container');
    let isCurrentlyShowingLocalData;
    let localDataElement;
    let localInfo;
    isCurrentlyShowingLocalData = false;
    localDataElement = null;

if (localStorage.getItem('signalUnit') === null) {
	localStorage.setItem('signalUnit', 'dbf');
}

// Display local station logo JS code
function updateLocalStationInfo() {
    const currentAntenna = getCurrentAntennaValue();
    const newAntenna = currentAntenna !== lastLocalAntenna;
    lastLocalAntenna = currentAntenna;

    if (newAntenna) TXInfoField(); // Remove local data element

    const rawEntry = stationData[freqData];
    const entryList = Array.isArray(rawEntry)
      ? rawEntry.filter(entry => entry && typeof entry === 'object')  // clean array
      : rawEntry && typeof rawEntry === 'object'
        ? [rawEntry]
        : [];
    const matchedEntry = entryList.find(entry => {
      return !entry.ant || entry.ant === currentAntenna;
    }) || {};
    const {
      name: customStationName,
      loc: customStationLoc,
      pwr: customStationPwr,
      pol: customStationPol,
      dist: customStationDist,
      azi: customAzimuth,
      ant: customAnt
    } = matchedEntry;

    firstLocalstationRun = true;
    localStationDelayCounter++;
    if (localStationDelayCounter <= localStationDelayCounterMax && !newAntenna) return;
    localStationDelayCounter = 0;
	if (window.matchMedia("(orientation: portrait)").matches) { mobileRefreshNew = 'p'; } else { mobileRefreshNew = 'l'; }
    if (!logoLocal || mobileRefresh !== mobileRefreshNew || newAntenna) {
		logoLocal = true;
		if (window.matchMedia("(orientation: portrait)").matches) { mobileRefresh = 'p'; } else { mobileRefresh = 'l'; }

		// Force refresh when returning to station with PI+PS
		piCode = '';
		psCode = '';

		LocalStationInfoField();

        let paths;

        if (Number(currentAntenna) === 0 || customAnt === undefined) {
            paths = [
                `${localpath}local/_${freqData}`
            ];
        } else {
            paths = [
                `${localpath}local/_${freqData}_${currentAntenna}`
            ];
        }

        let supportedExtensions = prioritiseSvgLocal ? ['svg', 'webp', 'png'] : ['webp', 'png', 'svg'];
        let foundLocal = false;

        // Function to check each path for logo image
        function checkNextPath(index) {
            if (foundLocal || index >= paths.length) {
                if (!foundLocal) {
					// Nothing needed here
                }
                return;
            }

            const path = paths[index];

            // Function to check each extension for logo image
            function checkNextExtension(extensionIndex) {
                if (foundLocal || extensionIndex >= supportedExtensions.length) {
                    if (!foundLocal) {
                        checkNextPath(index + 1);
                    }
                    return;
                }

                $.ajax({
                    url: `${path}.${supportedExtensions[extensionIndex]}`,
                    method: 'HEAD',
                    success: function () {
                        logoImage.attr('src', `${path}.${supportedExtensions[extensionIndex]}`).attr('alt', `Logo for ${freqData} FM`).css('display', 'block').css('image-rendering', 'auto').attr('class', '');
                        foundLocal = true;
                        logoRotate = false;
                    },
                    error: function () {
                        checkNextExtension(extensionIndex + 1);
                    }
                });
            }

            checkNextExtension(0); // Start checking extensions
        }

        checkNextPath(0); // Start checking paths
    }
}

// TX Info field
function TXInfoField() {
	documentLocal.style.display = 'block';

    // Only reset if showing local data
    if (isCurrentlyShowingLocalData) {
        // Remove local data element and restore original styling
        if (localDataElement && localDataElement.parentNode) {
            localDataElement.parentNode.removeChild(localDataElement);
            localDataElement = null;
        }

        isLocalActive = false; // Tooltip code normally here

        // Reset flag
        isCurrentlyShowingLocalData = false;
    }
}

// Local station field
function LocalStationInfoField() {
    const currentAntenna = getCurrentAntennaValue();
    const rawEntry = stationData[freqData];
    const entryList = Array.isArray(rawEntry)
      ? rawEntry.filter(entry => entry && typeof entry === 'object')  // clean array
      : rawEntry && typeof rawEntry === 'object'
        ? [rawEntry]
        : [];
    const matchedEntry = entryList.find(entry => {
      return !entry.ant || entry.ant === currentAntenna;
    }) || {};
    const {
      name: customStationName,
      loc: customStationLoc,
      pwr: customStationPwr,
      pol: customStationPol,
      dist: customStationDist,
      azi: customAzimuth,
      ant: customAnt
    } = matchedEntry;

    let imperialUnits = localStorage.getItem("imperialUnits");

    TXInfoField(); // Clear to prevent possible duplicates

    // Mark that showing local data
    isCurrentlyShowingLocalData = true;

    // Hide original webserver content
    const originalContainer = documentLocal.querySelector('#data-station-container');
    if (originalContainer) {
        originalContainer.style.display = 'none';
    }

    // Create local data element and add it to documentLocal
    localDataElement = document.createElement('div');
    localDataElement.className = 'local-station-data';
    localDataElement.innerHTML = `
        <h2 style="margin-top: 0" class="mb-0 show-phone">
            <span id="data-station-name" style="font-size: 20px">${customStationName}</span>
        </h2>
        <h4 class="m-0">
            <span style="font-size: 16px;">${customStationLoc || '&nbsp;'}</span> <span class="text-small">[<span>AUS</span>]</span>
        </h4>
        <span class="text-small">
            <span>
              ${customStationPwr ? customStationPwr + ' kW [' + customStationPol + ']' : '&nbsp;'}
              ${customStationDist && !isNaN(customStationDist) ? ' \u2022 ' + Math.round(customStationDist / (imperialUnits === 'true' ? 1.6093 : 1)) + (imperialUnits === 'true' ? ' mi' : ' km') : (typeof customStationDist === 'string' ? ' \u2022 ' + customStationDist + ' ' + (imperialUnits === 'true' ? 'mi' : 'km') : '&nbsp;')}
              ${customAzimuth !== undefined ? ' \u2022 ' + customAzimuth + '\u00B0' : ''}
            </span>
        </span>
    `;

    // Update documentLocal styling for local data
    documentLocal.className = 'panel-33 hover-brighten tooltip-station-logos';
    if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) && window.matchMedia("(orientation: portrait)").matches || window.innerWidth <= 768) {
        documentLocal.style.backgroundColor = "transparent";
    }

    isLocalActive = true; // Tooltip code normally here

    // Add local data element to documentLocal
    documentLocal.appendChild(localDataElement);
    documentLocal.style.display = 'block';
}

// Function for update notification in /setup
function checkUpdate(setupOnly, pluginVersion, pluginName, urlUpdateLink, urlFetchLink) {
    if (setupOnly && window.location.pathname !== '/setup') return;

    // Function to check for updates
    async function fetchFirstLine() {
        const urlCheckForUpdate = urlFetchLink;

        try {
            const response = await fetch(urlCheckForUpdate);
            if (!response.ok) {
                throw new Error(`[${pluginName}] update check HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            const lines = text.split('\n');

            let version;

            if (lines.length > 2) {
                const versionLine = lines.find(line => line.includes("const pluginVersion =") || line.includes("const plugin_version ="));
                if (versionLine) {
                    const match = versionLine.match(/const\s+plugin[_vV]ersion\s*=\s*['"]([^'"]+)['"]/);
                    if (match) {
                        version = match[1];
                    }
                }
            }

            if (!version) {
                const firstLine = lines[0].trim();
                version = /^\d/.test(firstLine) ? firstLine : "Unknown"; // Check if first character is a number
            }

            return version;
        } catch (error) {
            console.error(`[${pluginName}] error fetching file:`, error);
            return null;
        }
    }

    // Check for updates
    fetchFirstLine().then(newVersion => {
        if (newVersion) {
            if (newVersion !== pluginVersion) {
                let updateConsoleText = "There is a new version of this plugin available";
                // Any custom code here
                
                console.log(`[${pluginName}] ${updateConsoleText}`);
                setupNotify(pluginVersion, newVersion, pluginName, urlUpdateLink);
            }
        }
    });

    function setupNotify(pluginVersion, newVersion, pluginName, urlUpdateLink) {
        if (window.location.pathname === '/setup') {
          const pluginSettings = document.getElementById('plugin-settings');
          if (pluginSettings) {
            const currentText = pluginSettings.textContent.trim();
            const newText = `<a href="${urlUpdateLink}" target="_blank">[${pluginName}] Update available: ${pluginVersion} --> ${newVersion}</a><br>`;

            if (currentText === 'No plugin settings are available.') {
              pluginSettings.innerHTML = newText;
            } else {
              pluginSettings.innerHTML += ' ' + newText;
            }
          }

          const updateIcon = document.querySelector('.wrapper-outer #navigation .sidenav-content .fa-puzzle-piece') || document.querySelector('.wrapper-outer .sidenav-content') || document.querySelector('.sidenav-content');

          const redDot = document.createElement('span');
          redDot.style.display = 'block';
          redDot.style.width = '12px';
          redDot.style.height = '12px';
          redDot.style.borderRadius = '50%';
          redDot.style.backgroundColor = '#FE0830' || 'var(--color-main-bright)'; // Theme colour set here as placeholder only
          redDot.style.marginLeft = '82px';
          redDot.style.marginTop = '-12px';

          updateIcon.appendChild(redDot);
        }
    }
}

if (CHECK_FOR_UPDATES) checkUpdate(pluginSetupOnlyNotify, pluginVersion, pluginName, pluginHomepageUrl, pluginUpdateUrl);

})();
