/*
    Station Logos OCE + Station Info for no RDS v1.3.0 by AAD
    https://github.com/AmateurAudioDude/FM-DX-Webserver-Plugins

    https://github.com/Highpoint2000/webserver-station-logos
*/

(() => {

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const includeLocalStationInfo = true;       // Set to false to disable displaying localstationdata.json info
const delayLocalStationInfo = true;         // Enable to instantly display local station info and disregard signal strength stabilising first
const prioritiseSvg = true;                 // Display 'svg' file if both 'svg' and 'png' files exist for tuned station
const prioritiseSvgLocal = false;           // Display 'svg' file if both 'svg' and 'png' files exist for tuned station (for stations without RDS)
const enableCaseInsensitivePs = false;      // Ignores filename case for RDS PS (for legacy fetching method only)
const psCaseInsensitiveLevel = 1;           // Setting from 1-5, higher means likely more "404 File Not Found" errors. Level 5 not recommended
const logoEffect = 'fade-animation';        // imageRotate, curtain, fade-animation, fade-grayscale
const signalDimThreshold = -103;            // dBm
const signalHoldThreshold = -101;           // dBm
const fetchUsingEndpoint = true;            // Set to true
const decemberSantaHatLogo = true;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const pluginName = "Station Logos OCE";

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
let styleElement = document.createElement('style');
let cssCode = `
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
`;
styleElement.appendChild(document.createTextNode(cssCode));
document.head.appendChild(styleElement);

let defaultImagePath;

const currentDate = new Date();

if (currentDate.getMonth() === 11 && decemberSantaHatLogo) {
    defaultImagePath = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKwAAACsCAYAAADmMUfYAAAAB3RJTUUH6AwEDgo50yUEkQAAAAlwSFlzAAAK8AAACvABQqw0mAAAPMtJREFUGBnswQmAnWVhKOzn/b7vnDNrZib7HsjKjixGRAVkUQEhoihavUBRQaEu5VLcSm3FDbW3i61W/K3ora3SuoBe6oq2Fy6KFAMKhM1A2JJMktlnzpzle/+kE2TYMpMhLIN5nnDYYYfZZmhoyLp167S1tSkWi5YtW2ZwcFCxWLR27VqdXV0GOztNQz/2QA8eRI4mzEEP+jCIY7ARa404DuvwW7RhATZiA9rwEqzGHZiKI3AN1mM25qATBTQiYANS1NGEOlrQgyISvAg/xoG4Fq9AH9aSHUppI/MiB05l/znsvSd7zGBeO+0Fsjqxhy23c9sv+PEv+UbgvuOpXI0X46eYiX70IEFAMCJHQBUVzEfwzFgXo+eLzO+fAlqwsI2Xz+BlR7HfUhbNpdSOYESO3IiM2ccx+zRe/lPe/C98Df+EDRi22zMi8/ujFXMW8JLZvOY1rNyf2dORoYYKulEzIiAYkSNBM05lnyP42JW89g4uw7fxEHK7Pa0yz28B07B8H1adzKmHsXg2EpQxgBpyJAhIPV5qRD8GMQVnccirOORyTr6RS3ANhu32tMk8P6WYOZ2Dl/DaV/KGI2gpoowe5IhIEJAan8SIPqSYhndx3EEc/GX+4lb+CV12e1pknl8SzJ7GS17Mqtfw+pUUA7ag14gEAcHEJYjoR4ajmTafv/00i3/Kp/CQ3Xa5zPPHtGkcfiCvP5HXvJTWgE4MI0Vi10uQYxOW49O896+Z9c/8Ge6y2y6VmfyacODLefNJnHIkc5uwEYNIkXlmdGIaPsCbmmj7EhfgNrvtMpnJba8XceorecMr2H8GtqATCQqeWQGbMBXv5YSU4hc5H7+22y6RmZza8IpX8vY3cNxSDOA+1JF59gRswVScx7GBv76U9+A3dnvKMpPPPofz9tfw5sOYkWI9hpEi9ewKRmxBB87h6Dqf+SLvxRq7PSWZyaMRr3oT7zqNly9AL/oRkXruCEZ0owPn8Moal1zGe7HWbhOWmRzm7sfZZ/G2lzIvYj3qSBA89wREdKMD53FyztCX+J94wG4TknnuO/x03vMOXrOYYg8GEJB4bguI6MIMnMPrN9L7TT6ETrvttMxzVzPeeCHnncRBrdiEYSQIJoeAHFswk+S9/I8am/6Lj6Pfbjsl8dy07MV89K184s0cVMBDqCBFMLkkqGIzVtBwAecexDtQsNtOyTz3nPhe3vsGjpxPoRsDRiQmrwQVbMIy2s7kwk+zeT1f3oIc/SjYbUcSzx1TcMF7+Ot3cOwcCpvRj4DE5JdiCFtwODPexodxkt3GLfPccMAJXLiKk/ZiShWbkSP1eAEBEdHkkqCMfrySRev580+xHr+025gSz743vZ8vncsfLGfKIPoRkXi0gGBEDRGJySUgQR8qeAMHv4UPYU+7jSnz7JmGd3+Utx7CvBr6UUfweAEJKhhEDQmaUUA0uQT0Yjrexgn3cfd3+Qh67PakMs+OQ1/Hn76OY+fS3I+qEcHjBQSUMYCqETlyTEGGaPIIiOjCXArv4Oz7uP0WvoS63Z5Q4pl3xp9y2VmcNJPmHlQQEDxeQIoq+lAxIkfAMMqIJp+AOrbghbS8jfOn8ZJmBCRIkCBBggQJEiRIkCBBggQJEiRIPL8knjnTcckH+dQq9k1I+pEj8eQSVDGAGiIytKMZAUOom5wCBtGPk1i+ivOwwG5PKPHMOORM/r8LOe8AZg5i2IjgySXIMYhhBDShjtuwHkXkGEY0OaXoRpFwOqccyJtQstvjZJ5+b/kYFx7D3gWyQURjC0ZUUEaORgzg19iEAg7AdAyjAcHkE4zYiBUU3sy59/GrB/gxot1+J/P0acL7P8rZezGzQhgyfgE1DKGGDAF3oR8LsAkPoQMJKmhENPkE1LAJr2LRas76Grdl3G+330nsegHLzuQrF3PBcmYNEurGLyCigooRDehCLxpRRBFDGDaigtzklaIPCf6A05bxahTt9juZXStr5+XnccnrOChgGMHOCaihjBwJEgwgRwkRKSqooglV1JGZvArYiOWEU3n35/nF/fyqbrdtErtOaTanX8RXTucgW1XsvICIIVQQEJCjgoDEiICIiIAcZQST3yacyt4Hcjra7PbfErtGy4G8/338zVHM6UfVxARUMYyIYESCFDVERE+sjJrJLUEZDTiTdyzkhUjsJvHUTXsVH/00HzqYli2ompiAOsqoIzEiIkcLmlBHgmhEYkRAxDASk1vAZryIhiN5R8a0gICAgICAgICAgICAgOD5JTFxAStex19fzLsXUtiIOoKJCahhGBHBiIAKpmAmUtRRQ4aCRxtCDcHkFVBHBX/Aqj14GRK/5xJPbipegn09XkORV72Vf/wwb5lB6EQdwcQE1FFGjuDRIhKUkBpRQwkZohEBdQwhmNwC+rE32fGckzI1RYoUKVKkSJEiRYoUKVLPL5nHy7DfVm9eunTpKZ0bNty5du3ai3CDEbP25i1ncf6JzK2gEwGJp6aCshHBo0UEFJGihhoakHm0gDIakSE3OQVUUcdJvOx7vOxevu33WObRpi1ZsuTEVatWvfO00047bObMmYaHh5ckhUJ2yWc+czE2ncj5Z/PWRdiMISSemgQ1DCEi8XjRiAxF9CGiBSlyj5ZjCK0mv14sp/GV/OGlXI0ev6cyIxIsP/zww991wQUXnHbUUUdNs12pVPInF154bEzTuT/72Me6X9/VdfheWIcyUk9NgoghVBDsWIoMw8gwxYjoEQE5yiihiNzklKCKgFUc/e+8/D6+4/dU1traqlwuz33Vq1510Vve8pY/WLJkicdK8M63vW2fQwoF93z2s/K77jIfRdQ9NQHDGEJEYscSRJTRjGZERI8WUMcgCgiIJqcEPdiP5lN419/yE/T5PZQgaWtrW3HssceuWrJkiSfT1tbmyHe/26xPfcrqpUs9iAzBxCWooh91pHYsIqCOCjpQRPR4AQHDKCMxeQVUUcFpHLmCNyRIkCBBggQJEiRIkHh+STo7OyMqW7ZsGTKGIo495RTz3/Med06dahAFOy8goIY+DCMxfkNIMQ0BuScWjBhEFYnJK0UvFpKeyXsxx++hpLu7O3Z2diaDg4M149CEY84806w//EObm5rkCMYnIDGihj4MI0EwtmBEH6agFdGOBdTQj4hgcuvFCex3JO9pRQ011FBDDTXUUEPN80uC/Y4//vh3H3744R3GaXZLi/3e+Ea1xYtVkXpiAQEBiRE1lNGHYQQkxhaRoIwypqOAurEFVDCEgGByChhCI97KGXix3zPJ9OnT9zn33HNfu2DBgpJxylHevFkYGtKABNGIgICAgIgayuhHN3owhIiIHDmiJxeQohspOhCQG79BlJGYvAIGcRCzX8eFaPB7JOnr66sVi0U7I6C7s9Pdmze7CzUUkSCijhrKKGMIZdSQoQlT0IIGFJAiooYaokdEJIjYjFa0IiIYvzoGUENqcgrIEfAGjlnGm/weSQ4//PATkiTR19dnaGhIjNFYAla87GVm/dmfue/YY3V1dIioIkcRTWhGEa1oRxsCIiIiWjATszAHs9GGgCpyIwroxyCmoYTczgmooR91ZCavChbQ+j94O+b5PRFuvfXW/nnz5jX39/draWnR2toqhGA8+ioV1159tQ1//McOXLNGOypYj06G++ntY2iIwSGGK5QbKefUagiEOoVAcxttM+iYwdQZaEMZWzCINqzDPdgLU1G186IRjZiCgLrJqYROBi/k4hv4pCdRjdHzRbbXXns1r1+/XnNzs+bmZiEE49VaLFq0997u3Wsvt911l2qttuVWbtvA7Xdz80YeXE5/L+UtlOtU9mc4Uh9GwH0U+mmcSWtkZgPLFrFiPvsczIHLUMcAutCMFuQmJiDHEAJakaJu8qlhJk0ns+oG/g13eZ7LhoaG5HkuSRJpmtpZi+fOtfmcc+pfuuee7/7f1au/0ctvZrBhgN6NVJeTG6fNpH2U7mJKA4t+xguX8sqTOGEJSQElFJCbuAQ5BhHRggS5yaWOIlay90Gc8Ev+1vNckue5bcrlskqlYmeVCgWz99239tCCBT+8h2/jN+jEMHI7p45BrMcvfsul/8p5H+esz/GTjVQ6jIiemgQRg+hFFSkSk0sdc5hyOC/HNM9zWUNDg56eHrVaTW9vr7a2NlmWCSEYr9rgYHmov38Thu1aFay7ka/9mi2ns/gw9gyInroEERXUUUITEiNyz311lAh7sXRP9sK1nseyBx54wJQpUwwNDalWq/r7+7W3t9sZt9166wODfX0PHnToobYZvOEGu1gNw+2EIup2nWBEDXVU0IgSEiNyz00pUmSYTWsjc2w35bDD5Hlu3bp1nk+Sn/3sZ2s6OjrEGMUY1Wo1tVrNeHV3d7viiiuuumWEW265xdrGRrtKE6ajjcI00gzRrheMqKIX3RhEDQEJAoLnhgw5BlDBTFrnsnAuXnvRRZ6vkiuuuOJ/33HHHebNmyfLMpVKRW9vr3K5LM9zO7JlyxYf+chH/u1b3/rWpei2C1VRRDOa0UxLK5mtoqdPQEAV/ehGH4ZRR0CCBAHBMysiRTd+g9W4HrfSWmHx4rPP9nyWff/73/+H8lZnnXXWe0466aSFfX19BgcHVSoVDQ0NGhsb5XkuhKChoUEIwTZdXV0+//nPf+kb3/jGxX19fes8xr1otPMe9MT2ZXozDQHR0y8goo5BlJEhRYYMGRIkHhE9Itq1Agoo43Z0oxaCZOlSM488snB0pXL0g3wS9+Fq3OZ5JsOWO++88+/PP//8O5Ik+btVq1YtbG1tDbVaTblc1tXVpbGxUV9fX+Wmm27qnTdvXlOe5+m//uu/XnrjjTd+DBvsAtfaoUI70xsp5p45wYiAiCqqRiRIkSJBghQJAhIEIwKCRwREBKTIERE9WjQiQYIqKtiIPiRJov2YYxz12c+at3ixWK2uyEI4vzw8nMydM+e6yy677Hz80vNIZsTwfffd98Pzzz//3Guuuebt8+fPn9XS0jLlkEMOWbT//vu3FAoFP//5zx/4wAc+8PHOzs51HR0dDR0dHde0tLRssQt0Y4YdapzF9GaKEdEzL3i0HDmqHhEQEJAiIBgRkKCOKoqooQcpWpAiMSI3ImAYXWlqS6FgKMvUQ1CtVhVmzPCC88+3fMUK/61QSJA0NDY688wzD+/q6jrvs5/97J/ifs8TmUdUcNWaNWt+iHD99dc3X3LJJasuvPDCdy9ZsmT+V77ylcvvuOOOb3R0dPTZhe4yLq1tzG2hED03BI8WUUc9BLUYVVFFig5E9OJ+9KJjzhz1uXNt6upSCkEpTeWbNmno7dWGphjFPNcbo83Tpmk+/HDzX/xi0/feW0NLi813323t6tUWH3qoJ9LY2Jgcc8wxR1177bUn4FLPE5nHqxnRja984AMf+Leurq5FpVJpA/rsQv+BxLhMm8eCAiqICJ5ewYjoEQEJckQjAiI2Z5nBAw4Q58zR39VlcPNm5S1bNJTL5qWpoTz3UG+vARSXLrX4oovsfeKJBtev1zZjhlAsuvmKK9z94x/rr1ZV81yyZYsHH3zQvuec4/g/+iNNaep3jj3WQ93dmopFT2bu3Llte++99xG41PNEZmwDuNUudKWdM5u5M5mRInr6JUZUjMiQIqCC/sZGkkTzwIACOnHn3nt79de/bsWyZbq6u2264w6bbrtN//r1YkODdMsW9csv19zQ4BUf/agXnXiixFbTpnnY3DPO4IwzbJOjD5vWrjXc2ana08PUqUab095uRxobG5uWLl263PNI5hl2hZ2WzGGvaXTYqm58ghHBiNz4BBSwCfeitVQyPcskg4MGYrSxudnU00/XOnWqwa9/XX3LFhvmzLHywgu9YNky2zS2t5u7ciUrV3rY8PCwG1eu1DZjhn1WrjSWBG1o23NP9txTjNHOiDHKsqw4a9asPTyPZCbgm7e90SNeIghq9ZpangsxIRAFYhREIRY9mK3Tm26RSLzGVxQ0eTIzQjBK61yWT6UlR0SwYwEpaqgiIEWKiGBERERERIISunFrmupbtszM445T6uhwy3e/a3NXl73OOMPLL7xQe1OTNS94gY333OOlK1c66Igj7EipVPLiE080USEE41Wv1917772dt99+++BWU7ERBWzCN3EJukzQdx/6rqH6kESiJ/Y4eOrBEolreq/VkDQgEKI8qQu1kjx6nLPnnG4iMs9BvR6lYxYLW0lriAh2LKALPS0tikuWKMWodP/9mrdsEZEjGJEgN6KIHvy6uVnDySd7xdln2+eoo+QIhxyiIUm8+NWvVjDioFNPVUPBc0sIwerVq9e3trbOPPjgg1vQakQ73oFmvMsklNlJ69evd6u/8HSa6lFmzWVehiGPliAaERGQohu3zJhh6bveZfmxxyrU6x743vfcccklMgwiTVNNaaq1XjelXteAXtwxdao573ynV1xwgTnt7R72ipNP9lgBBc89SZJYtGjRPq2treny5cs9RhvOM+LdiCaRzHNQxSPmsXAmMxPUjQhIEJEgGJFgGHekqblvf7uTLrpIkxHFtjZX/d3fyQYGtB14oAVHHaV9+nRxwwZ9V11ly29/q3vPPS254AJHnnOOKWlqMhkYGJCmqYaGBtvkeZ7W63VPIuAcrMcnkJskMs9toZ35HSFMCTHKjUgxhC7kKKGIiHttddRRTnrvezV5REd7uz1OOsngunVOvuQSS176Uk3oitF/7befe66+2j5vfrMXnXyygslj48aNlbVr1z6wevXqXw0PDycnnnjiEWi67777Go4++mg7UMCFuBtfN0lknoNyv9M4rVSaP6VabarHKCJDHQ/gXlSSRPvMmUpJYrhaZflyx3/0o6bPmGG09lmzrPrgB1WqVXsdfLCHdYTg0NNPt+K008xrb5d4bvrtb3/b2dPTM7hw4cIFSZKEjVutXr367t/+9rfXDQ4OXr169eqbHnrooWJfX9+R++233+uPPvroE9rb241hCi7BbbjJJJB5Dsr9TsvyvfY6rPmmm5K6ESn6sR79pZLFq1bZ67WvFQoFw729lhx8sBUHHOCxCsWixfvv74m0NzZqb2z0XBFjFELwsO9+/zvrf/Ljq/9i4dw91sYYXzd16tTs+9///k+H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';
} else {
    defaultImagePath = 'data:image/png;base64,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';
}

// Desktop HTML
let showPeakmeter = localStorage.getItem("showPeakmeter");
let LogoContainerHtml;

document.addEventListener('DOMContentLoaded', function () {
    let isPeakmeterFound = document.getElementById('peak-meter-container');

    if (showPeakmeter === 'true' || (isPeakmeterFound && !showPeakmeter)) {
        LogoContainerHtml = '<div style="width: 2.95%; min-width: 2.95%"></div> <!-- Spacer -->' +
        '<div class="panel-25 m-0 hide-phone" style="width: 64%; max-width: 64%; min-width: 160px">' +
        '    <div id="logo-container" style="width: auto; height: 72px; display: flex; justify-content: center; align-items: center; margin: auto">' +
        '        <img id="station-logo" src="' + defaultImagePath + '" alt="Default logo" style="width: auto; max-width: 160px; padding: 0px 2px; margin: 0 8px; max-height: 100%; margin-top: 18px; border-radius: 4px; display: block; image-rendering: auto">' +
        '    </div>' +
        '</div>';
    } else { // if (showPeakmeter === 'false' || showPeakmeter === null) {
        LogoContainerHtml = '<div style="width: 5%; min-width: 2.5%"></div> <!-- Spacer -->' +
        '<div class="panel-25 m-0 hide-phone" style="width: 48%; max-width: 48%; min-width: 160px">' +
        '    <div id="logo-container" style="width: auto; height: 72px; display: flex; justify-content: center; align-items: center; margin: auto">' +
        '        <img id="station-logo" src="' + defaultImagePath + '" alt="Default logo" style="width: auto; max-width: 140px; padding: 0px 2px; margin: 0 8px; max-height: 100%; margin-top: 18px; border-radius: 4px; display: block; image-rendering: auto">' +
        '    </div>' +
        '</div>';
    }

    // Insert the new HTML code after the named <div>
    document.getElementById("ps-container").insertAdjacentHTML('afterend', LogoContainerHtml);

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
    originalDiv.outerHTML = buttonDiv.outerHTML;

    document.getElementById('ps-container').style.padding = '12px';

    document.getElementById('station-logo').oncontextmenu = function(e) { e.preventDefault(); };
});

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
                <span class="pointer stereo-container" style="position: relative; margin-left: 20px;" role="button" aria-label="Stereo / Mono toggle" tabindex="0">
                    <div class="circle-container">
                        <div class="circle data-st circle1"></div>
                        <div class="circle data-st circle2"></div>
                    </div>
                    <span class="overlay tooltip" data-tooltip="Stereo / Mono toggle. <br><strong>Click to toggle."></span>
                </span>                                                               
                <span style="margin-left: 15px;" class="data-ms">MS</span>
		</h3>
	</div>
`;

const localpath = `${logosPath}/`; // Path to local logo images
let logoImage;
let logoLocal;
let freqData;
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
let debug = false;

// Check PI or local frequency
document.addEventListener("DOMContentLoaded", function() {
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
                            }, 12);

                            return;
                        }
                        freq = dataFreq;
                    }
                }
            }
        };

        // Create observer
        const observer = new MutationObserver(observerCallback);
        observer.observe(targetNode, config);

    });
});

function CheckPIorFreq() {
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
	const psCode = $('#data-ps').text().trim().replace(/\s+/g, '_').replace(/_+$/, '');
	const signalData = $('#data-signal').text().trim();
	const signalCalc = {'dbm': signalData, 'dbf': signalData - 120, 'dbuv': signalData - 108.75}[localStorage.getItem('signalUnit').toLowerCase()] || -30;
	previousfreqData = freqData;
	freqData = $('#data-frequency').text().trim();
	const { name: customStationName, loc: customStationLoc, pwr: customStationPwr, pol: customStationPol, dist: customStationDist, azi: customAzimuth } = stationData[freqData] || {};
	signalHold = (signalCalc >= signalHoldThreshold) ? parseInt(signalHoldMax) : signalHold - 1; // Cooldown before hiding local station info
	signalHold = (signalHold <= 0) ? 0 : signalHold;
	signalDim = (signalCalc >= signalDimThreshold) ? signalDimMax : signalDim - 1; // Cooldown before dimming logo
	signalDim = (signalDim <= 0) ? 0 : signalDim;

	// Dim logo on low signal
	let img = document.getElementById(imgLogoImage);
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

        /*
            Case-insensitive code
        */

        function toTitleCase(str) {
            return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join('_');
        }

        function generateLevel1CaseVariations(str) {
            // Level 1: Basic variations (Original, lowercase, uppercase, first letter uppercase, title case)
            return [
                str,
                toTitleCase(str),
                str.toLowerCase(),
                str.toUpperCase(),
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()  // First letter uppercase
            ];
        }

        function generateLevel2CaseVariations(str) {
            // Level 2: Random case variation, alternating case, reversed case
            const randomCaseVariation = str.split('').map(char => 
                Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
            ).join('');

            return [
                str,
                toTitleCase(str),
                str.toLowerCase(),
                str.toUpperCase(),
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),
                randomCaseVariation  // Random case variation
            ];
        }

        function generateLevel3CaseVariations(str) {
            // Level 3: Random uppercase/lowercase for each character
            const randomCaseVariation = str.split('').map(char => 
                Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase()
            ).join('');

            const alternatingCase = str.split('').map((char, index) => 
                index % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
            ).join('');

            const reversedCase = str.split('').map(char => 
                char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
            ).join('');

            const allUpperCase = str.toUpperCase();

            const allLowerCase = str.toLowerCase();

            const capitalizedFirstLetter = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

            return [
                str,
                toTitleCase(str),
                allLowerCase,
                allUpperCase,
                capitalizedFirstLetter, // First letter uppercase
                randomCaseVariation, // Random case variation
                alternatingCase, // Alternating case (AbCdEf...)
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(),  // First letter uppercase
                reversedCase // Opposite of each character
            ];
        }

        function generateLevel4CaseVariations(str) {
            // Level 4: level 1 + 2 + 3
            const level1 = generateLevel1CaseVariations(str);
            const level2 = generateLevel2CaseVariations(str);
            const level3 = generateLevel3CaseVariations(str);

            return [
                ...level1,
                ...level2,
                ...level3
            ];
        }

        function generateLevel5CaseVariations(str) {
            // Level 5: All possible combinations of upper/lowercase for each character
            function generateAllCaseCombinations(str) {
                const results = [];
                const numCombinations = 1 << str.length; // 2^length of the string

                for (let i = 0; i < numCombinations; i++) {
                    let combination = '';
                    for (let j = 0; j < str.length; j++) {
                        combination += (i & (1 << j)) ? str.charAt(j).toUpperCase() : str.charAt(j).toLowerCase();
                    }
                    results.push(combination);
                }

                return results;
            }

            const allCombinations = generateAllCaseCombinations(str);

            return [
                str,
                toTitleCase(str),
                str.toUpperCase(),
                str.toLowerCase(),
                str.charAt(0).toUpperCase() + str.slice(1).toLowerCase(), // First letter uppercase
                ...allCombinations // All possible case combinations
            ];
        }

        let paths;

        if (enableCaseInsensitivePs) {
            switch (psCaseInsensitiveLevel) {
                case 0:
                    paths = [`${localpath}${piCode}_${psCode}`];
                    break;
                case 1:
                    paths = generateLevel1CaseVariations(psCode).map(variation => `${localpath}${piCode}_${variation}`);
                    break;
                case 2:
                    paths = generateLevel2CaseVariations(psCode).map(variation => `${localpath}${piCode}_${variation}`);
                    break;
                case 3:
                    paths = generateLevel3CaseVariations(psCode).map(variation => `${localpath}${piCode}_${variation}`);
                    break;
                case 4:
                    paths = generateLevel4CaseVariations(psCode).map(variation => `${localpath}${piCode}_${variation}`);
                    break;
                case 5:
                    paths = generateLevel5CaseVariations(psCode).map(variation => `${localpath}${piCode}_${variation}`);
                    break;
                default:
                    paths = [`${localpath}${piCode}_${psCode}`];
                    break;
            }
        } else {
            paths = [`${localpath}${piCode}_${psCode}`];
        }

        paths.unshift(`${localpath}${piCode}`);

        /*
            End of case-insensitive code
        */

        // Fetch logo
        let supportedExtensions = prioritiseSvg ? ['svg', 'png'] : ['png', 'svg'];
        let found = false;

        if (fetchUsingEndpoint) {

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

                    // Check if any available logo matches expected filename (case-insensitive)
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

        } else {

            // Function to check each path for logo image
            function checkNextPath(index) {
                if (found || index >= paths.length) {
                    return;
                }

                const path = paths[index];

                // Function to check each extension for logo image
                function checkNextExtension(extensionIndex) {
                    if (found || extensionIndex >= supportedExtensions.length) {
                        checkNextPath(index + 1);
                        return;
                    }

                    const url = `${path}.${supportedExtensions[extensionIndex]}`;
                    fetch(url, { method: 'HEAD' })
                    .then(response => {
                        if (response.ok) {
                            logoImage.attr('src', url)
                                .attr('alt', `Logo for ${psCode.replace(/_/g, ' ')}`)
                                .css('display', 'block')
                                .css('image-rendering', 'auto')
                                .attr('class', '');
                            logoPIPSVisible = true;
                            found = true;
                            logoRotate = false;
                        } else {
                            checkNextExtension(extensionIndex + 1);
                        }
                    })
                    .catch(() => {
                        checkNextExtension(extensionIndex + 1);
                    });
                }

                checkNextExtension(0); // Start checking extensions
            }

            checkNextPath(0); // Start checking paths

        }

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
let localInfo = document.getElementById('local-info-container');

if (localStorage.getItem('signalUnit') === null) {
	localStorage.setItem('signalUnit', 'dbf');
}

// Display local station logo JS code
function updateLocalStationInfo() {
    firstLocalstationRun = true;
    localStationDelayCounter++;
    if (localStationDelayCounter <= localStationDelayCounterMax) return;
    localStationDelayCounter = 0;
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

        let supportedExtensions = prioritiseSvgLocal ? ['svg', 'png'] : ['png', 'svg'];
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
	let existingElements = document.querySelectorAll('#local-info-container');
	existingElements.forEach(function(element) {
		element.parentNode.removeChild(localInfo);
		element.remove();
	});
}

// Local station field
function LocalStationInfoField() {
	let { name: customStationName, loc: customStationLoc, pwr: customStationPwr, pol: customStationPol, dist: customStationDist, azi: customAzimuth } = stationData[freqData] || {};
    let imperialUnits = localStorage.getItem("imperialUnits");
	localInfo = document.createElement('div');
	localInfo.id = 'local-info-container';
	localInfo.className = 'panel-33 hover-brighten tooltip-station-logos';
    localInfo.setAttribute('data-tooltip', 'This panel contains the current local station info when no RDS is being broadcast.');
	localInfo.innerHTML = `
        <h2 style="margin-top: 0" class="mb-0 show-phone" >
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
	let existingElements = document.querySelectorAll('#local-info-container');
	existingElements.forEach(function(element) {
		element.style.display = 'none';
		element.remove();
	});
	rtInfo.parentNode.insertBefore(localInfo, rtInfo.nextSibling);
	localInfo.style.display = 'block';
	documentLocal.style.display = 'none';
    initStationLogosTooltips();
}

// Tooltip
function initStationLogosTooltips(target = null) {
    // Define scope: all tooltips or specific one if target is provided
    const tooltips = target ? $(target) : $('.tooltip-station-logos');
    
    // Unbind existing event handlers before rebinding to avoid duplication
    tooltips.off('mouseenter mouseleave');
    
    tooltips.hover(function () {
        if ($(this).closest('.popup-content').length) {
            return;
        }
        
        var tooltipText = $(this).data('tooltip');
        var placement = $(this).data('tooltip-placement') || 'top'; // Default to 'top'
        
        // Clear existing timeouts
        $(this).data('timeout', setTimeout(() => {
            $('.tooltip-wrapper').remove();
            
            var tooltip = $(`
                <div class="tooltip-wrapper">
                    <div class="tooltiptext">${tooltipText}</div>
                </div>
            `);
                $('body').append(tooltip);
                
                var tooltipEl = $('.tooltiptext');
                var tooltipWidth = tooltipEl.outerWidth();
                var tooltipHeight = tooltipEl.outerHeight();
                var targetEl = $(this);
                var targetOffset = targetEl.offset();
                var targetWidth = targetEl.outerWidth();
                var targetHeight = targetEl.outerHeight();
                
                // Compute position
                var posX, posY;
                switch (placement) {
                    case 'bottom':
                    posX = targetOffset.left + targetWidth / 2 - tooltipWidth / 2;
                    posY = targetOffset.top + targetHeight + 10;
                    break;
                    case 'left':
                    posX = targetOffset.left - tooltipWidth - 10;
                    posY = targetOffset.top + targetHeight / 2 - tooltipHeight / 2;
                    break;
                    case 'right':
                    posX = targetOffset.left + targetWidth + 10;
                    posY = targetOffset.top + targetHeight / 2 - tooltipHeight / 2;
                    break;
                    case 'top':
                    default:
                    posX = targetOffset.left + targetWidth / 2 - tooltipWidth / 2;
                    posY = targetOffset.top - tooltipHeight - 10;
                    break;
                }
                
                // Apply positioning
                tooltipEl.css({ top: posY, left: posX, opacity: 1 });
                
            }, 300));
        }, function () {
            clearTimeout($(this).data('timeout'));
            
            setTimeout(() => {
                $('.tooltip-wrapper').fadeOut(300, function () {
                    $(this).remove(); 
                });
            }, 100); 
        });
        
        $('.popup-content').off('mouseenter').on('mouseenter', function () {
            clearTimeout($('.tooltip').data('timeout'));
            $('.tooltip-wrapper').fadeOut(300, function () {
                $(this).remove(); 
            });
        });
}

})();
