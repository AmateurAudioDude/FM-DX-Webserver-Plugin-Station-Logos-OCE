/*
	Station Logos OCE + Station Info for no RDS by AAD v1.2
	https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugins
	https://github.com/Highpoint2000/webserver-station-logos
*/

// Local station data
const stationData = {
    "87.800":	{ name: "Example FM",					loc: "Melbourne",		pwr: "1 kW [V] • 10 km"	},
    "88.000":	{ name: "Example FM",					loc: "Melbourne",		pwr: "1 kW [V] • 10 km"	}
};

const includeLocalStationInfo = false; // Set to false to disable displaying local station info

// CSS code
var styleElement = document.createElement('style');
var cssCode = `
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

	.logoFull { filter: brightness(100%) }
	.logoDim { filter: brightness(50%) }
`;
styleElement.appendChild(document.createTextNode(cssCode));
document.head.appendChild(styleElement);

var defaultImagePath = 'data:image/png;base64,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';
// Desktop HTML
var LogoContainerHtml = '<div style="width: 5%; min-width: 2.5%"></div> <!-- Spacer -->' +
    '<div class="panel-25 m-0 hide-phone" style="width: 48%; max-width: 48%; min-width: 160px">' +
    '    <div id="logo-container" style="width: auto; height: 72px; display: flex; justify-content: center; align-items: center; margin: auto">' +
    '        <img id="station-logo" src="' + defaultImagePath + '" alt="Default logo" style="width: auto; max-width: 140px; padding: 0px 2px; margin: 0 8px; max-height: 100%; margin-top: 18px; border-radius: 4px; display: block; image-rendering: auto">' +
    '    </div>' +
    '</div>';
// Insert the new HTML code after the named <div>
document.getElementById("ps-container").insertAdjacentHTML('afterend', LogoContainerHtml);

// The new HTML for the div element with the Play / Stop button
var buttonHTML = '<div class="panel-10 no-bg h-100 m-0 m-right-20 hide-phone" style="width: 88px; margin-right: 20px !important;">' +
                     '<button class="playbutton" aria-label="Play / Stop Button"><i class="fa-solid fa-play fa-lg"></i></button>' +
                  '</div>';
// Select the original div element
var originalDiv = document.querySelector('.panel-10');
// Create a new div element
var buttonDiv = document.createElement('div');
buttonDiv.innerHTML = buttonHTML;
// Replace the original div element with the new HTML
originalDiv.outerHTML = buttonDiv.outerHTML;

document.getElementById('ps-container').style.padding = '12px';

// Mobile HTML
document.getElementById('flags-container-phone').innerHTML = `
	<div id="flags-container-phone" class="panel-33">
		<h2 class="show-phone">
			<div id="logo-container-phone" style="width: auto; height: 70px; display: flex; justify-content: center; align-items: center; margin: auto">
				<img id="station-logo-phone" src="${defaultImagePath}" alt="station-logo-phone" style="max-width: 160px; padding: 1px 2px; max-height: 100%; margin-top: 0; margin-bottom: 8px; border-radius: 8px; display: block; image-rendering: auto">
			</div>
			<br>
				<div class="data-pty text-color-default"></div>
		</h2>
		<h3 style="margin-top:0;margin-bottom:0;" class="color-4 flex-center">
		<br>
                <span class="data-tp">TP</span>
                <span style="margin-left: 15px;" class="data-ta">TA</span>
                <div style="display:inline-block">
                    <span style="margin-left: 20px;display: block;margin-top: 2px;" class="data-flag"></span>
                </div>
                <span class="pointer stereo-container" style="position: relative;">
                    <span style="margin-left: 20px;" class="data-st">ST</span>
                    <span class="overlay tooltip" data-tooltip="Stereo / Mono toggle. <br><strong>Click to toggle."></span>
                </span>
                <span style="margin-left: 15px;" class="data-ms">MS</span>
		</h3>
	</div>
`;

const localpath = '/logos/'; // Path to local logo images
var logoImage;
var logoLocal;
var freqData;
let logoRotate = false;
let logoPIPSVisible = false;
const signalHoldThreshold = -96; // dBm
let signalHoldMax = 10; // seconds
let signalHold = 0; // seconds
const signalDimThreshold = -98; // dBm
let signalDimMax = 30; // seconds
let signalDim = signalDimMax; // seconds

// Check PI or local frequency
$(document).ready(function() {
	setInterval(CheckPIorFreq, 1000);
});

function CheckPIorFreq() {
	// Check if mobile device code executed within function to catch any change in screen orientation
	if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini/i.test(navigator.userAgent) && window.matchMedia("(orientation: portrait)").matches || window.innerWidth <= 768) {
		logoImage = $('#station-logo-phone');
		imgLogoImage = 'station-logo-phone';
	} else {
		logoImage = $('#station-logo');
		imgLogoImage = 'station-logo';
	}

	const piCode = $('#data-pi').text().toUpperCase().trim();
	const psCode = $('#data-ps').text().trim().replace(/\s+/g, '_').replace(/_+$/, '');
	const signalData = $('#data-signal').text().trim();
	const signalCalc = {'dbm': signalData, 'dbf': signalData - 120, 'dbuv': signalData - 108.75}[localStorage.getItem('signalUnit').toLowerCase()] || -30;
	previousfreqData = freqData;
	freqData = $('#data-frequency').text().trim();
	const { name: customStationName, loc: customStationLoc, pwr: customStationPwr } = stationData[freqData] || {};
	signalHold = (signalCalc >= signalHoldThreshold) ? signalHoldMax : signalHold - 1; // Cooldown before hiding local station info
	signalHold = (signalHold <= 0) ? 0 : signalHold;
	signalDim = (signalCalc >= signalDimThreshold) ? signalDimMax : signalDim - 1; // Cooldown before dimming logo
	signalDim = (signalDim <= 0) ? 0 : signalDim;

	// Dim logo on low signal
	var img = document.getElementById(imgLogoImage);
	if (signalDim) {
		img.className = '';
		if (logoRotate) {
			img.classList.add('logoFull', 'imageRotate');
		} else {
			img.classList.add('logoFull');
		}
	} else {
		img.className = '';
		img.classList.add('logoDim');
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
			updateLocalStationInfo();
			logoPIPSVisible = false;
		} else { // Default logo
			logoImage.attr('src', defaultImagePath).attr('alt', 'Default logo');
			logoRotate = false;
			window.piCode = '';
			window.psCode = '';
			logoLocal = false; // Needed for local station signal threshold
			logoPIPSVisible = false;
			TXInfoField();
		}
	}
}

// Display PI+PS logo JS code
function updateStationLogo(piCode, psCode) {
	if (window.matchMedia("(orientation: portrait)").matches) { mobileRefreshNew = 'p'; } else { mobileRefreshNew = 'l'; }
    if (piCode !== window.piCode || psCode !== window.psCode || mobileRefresh !== mobileRefreshNew) {
        window.piCode = piCode;
        window.psCode = psCode;
		if (window.matchMedia("(orientation: portrait)").matches) { mobileRefresh = 'p'; } else { mobileRefresh = 'l'; }

        const paths = [
            `${localpath}${piCode}`,
            `${localpath}${piCode}_${psCode}`
        ];

        const supportedExtensions = ['png', 'svg'];
        let found = false;

        // Function to check each path for logo image
        function checkNextPath(index) {
            if (found || index >= paths.length) {
                if (!found) {
                    // Rotating logo is buggy here with high latency connections so therefore must be executed below
                }
                return;
            }

            const path = paths[index];

            // Function to check each extension for logo image
            function checkNextExtension(extensionIndex) {
                if (found || extensionIndex >= supportedExtensions.length) {
                    if (!found) {
                        checkNextPath(index + 1);
                    }
                    return;
                }

                $.ajax({
                    url: `${path}.${supportedExtensions[extensionIndex]}`,
                    method: 'HEAD',
                    success: function () {
                        logoImage.attr('src', `${path}.${supportedExtensions[extensionIndex]}`).attr('alt', `Logo for ${psCode.replace(/_/g, ' ')}`).css('display', 'block').css('image-rendering', 'auto').attr('class', '');
                        logoPIPSVisible = true;
                        found = true;
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

		// Replace local station field if it exists with TX info field
		if (logoLocal) {
			logoLocal = false;
			TXInfoField();
		}

		// Rotating logo during PS loading
		if (!found && !logoRotate && !logoPIPSVisible) { // logoPIPSVisible required for stations with dynamic PS
			logoImage.attr('src', defaultImagePath).attr('alt', 'Empty logo').attr('class', 'imageRotate');
			logoRotate = true;
		}
    }
}

var documentLocal = document.querySelector('div.flex-container.flex-phone.flex-phone-column div.panel-33.hover-brighten.tooltip');
var rtInfo = document.getElementById('rt-container');
var localInfo = document.getElementById('local-info-container');

if (localStorage.getItem('signalUnit') === null) {
	localStorage.setItem('signalUnit', 'dbm');
}

// Display local station logo JS code
function updateLocalStationInfo() {
	if (window.matchMedia("(orientation: portrait)").matches) { mobileRefreshNew = 'p'; } else { mobileRefreshNew = 'l'; }
    if (!logoLocal || mobileRefresh !== mobileRefreshNew) {
		logoLocal = true;
		if (window.matchMedia("(orientation: portrait)").matches) { mobileRefresh = 'p'; } else { mobileRefresh = 'l'; }

		// Force refresh when returning to station with PI+PS
		piCode = '';
		psCode = '';

		LocalStationInfoField();

        const paths = [
            `${localpath}local/_${freqData}`
        ];

        const supportedExtensions = ['png', 'svg'];
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
	var existingElements = document.querySelectorAll('#local-info-container');
	existingElements.forEach(function(element) {
		element.parentNode.removeChild(localInfo);
		element.remove();
	});
}

// Local station field
function LocalStationInfoField() {
	let { name: customStationName, loc: customStationLoc, pwr: customStationPwr } = stationData[freqData] || {};
	localInfo = document.createElement('div');
	localInfo.id = 'local-info-container';
	localInfo.className = 'panel-33 hover-brighten tooltip';
    localInfo.setAttribute('data-tooltip', 'This panel contains the current local station info when no RDS is being broadcast.');
	localInfo.innerHTML = `
		<h2 style="margin-top: 0" class="mb-0 show-phone">
			<span style="font-size: 20px">${customStationName}</span>
		</h2>
		<h4 class="m-0">
			<span style="font-size: 16px;">${customStationLoc || '&nbsp;'}</span> <span class="text-small">[<span>AUS</span>]</span>
		</h4>
		<span class="text-small">
			<span>${customStationPwr || '&nbsp;'}</span>
		</span>
	`;
	var existingElements = document.querySelectorAll('#local-info-container');
	existingElements.forEach(function(element) {
		element.style.display = 'none';
		element.remove();
	});
	rtInfo.parentNode.insertBefore(localInfo, rtInfo.nextSibling);
	localInfo.style.display = 'block';
	documentLocal.style.display = 'none';
}
