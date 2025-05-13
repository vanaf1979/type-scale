const htmlTagInput = document.getElementById('html-tag');
const fontWeightSelect = document.getElementById('font-weight');
const minWidthInput = document.getElementById('min-width');
const minFontSizeInput = document.getElementById('min-font-size');
const maxWidthInput = document.getElementById('max-width');
const maxFontSizeInput = document.getElementById('max-font-size');
const fontFamilySelect = document.getElementById('font-family');
const textColorInput = document.getElementById('text-color'); // Now this is the hex input
const previewText = document.getElementById('preview-text');
const cssOutput = document.getElementById('css-output');
const copyButton = document.getElementById('copy-button'); // Get the copy button
const fontLinkTagId = 'google-font-link';
const rootFontSize = 16; // Assuming the root font size is 16px

const googleFonts = [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", "Nunito",
    "Source Sans Pro", "Oswald", "Merriweather", "PT Sans", "Slabo 27px",
    "Raleway", "Fira Sans", "Playfair Display", "Arimo", "Ubuntu",
    "Crimson Text", "Titillium Web", "Work Sans", "Karla"
];

function createFontLinkTag() {
    const link = document.createElement('link');
    link.id = fontLinkTagId;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return link;
}

const fontLinkTag = document.getElementById(fontLinkTagId) || createFontLinkTag();

function populateFonts() {
    googleFonts.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        fontFamilySelect.appendChild(option);
    });
}

function updateGoogleFontLink(fontFamily, fontWeight = 400) {
    const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@${fontWeight}&display=swap`;
    fontLinkTag.href = fontUrl;
}

function hexToHsl(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return null;
    }
    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function formatNumber(number) {
    const numStr = number.toString();
    if (numStr.includes('.')) {
        return numStr.replace(/(\.0+|0+)$/, '');
    }
    return numStr;
}

function generateResponsiveFontSize() {
    const htmlTag = htmlTagInput.value.trim();
    const fontWeight = fontWeightSelect.value;
    const minWidth = parseFloat(minWidthInput.value);
    const minFontSizePx = parseFloat(minFontSizeInput.value);
    const maxWidth = parseFloat(maxWidthInput.value);
    const maxFontSizePx = parseFloat(maxFontSizeInput.value);
    const hexColor = textColorInput.value;
    const hslColor = hexToHsl(hexColor);

    if (isNaN(minWidth) || isNaN(minFontSizePx) || isNaN(maxWidth) || isNaN(maxFontSizePx)) {
        cssOutput.textContent = '/* Please enter valid numeric values. */';
        previewText.style.fontSize = `${minFontSizePx}px`;
        return;
    }

    const minFontSizeRem = formatNumber(minFontSizePx / rootFontSize);
    const maxFontSizeRem = formatNumber(maxFontSizePx / rootFontSize);

    const slope = (maxFontSizePx - minFontSizePx) / (maxWidth - minWidth);
    const intercept = minFontSizePx - slope * minWidth;

    const vwSlope = formatNumber(slope * 100);
    const interceptRem = formatNumber(intercept / rootFontSize);

    const clampedValueRem = `clamp(${minFontSizeRem}rem, ${interceptRem}rem + ${vwSlope}vw, ${maxFontSizeRem}rem)`;

    const fontFamily = fontFamilySelect.value;

    updateGoogleFontLink(fontFamily, fontWeight);
    previewText.style.fontSize = clampedValueRem;
    previewText.style.fontFamily = `'${fontFamily}', sans-serif`;
    previewText.style.fontWeight = fontWeight;
    previewText.style.color = hexColor; // Keep the preview in hex for simplicity

    const css = `${htmlTag} {\n  font-size: ${clampedValueRem};\n  font-family: '${fontFamily}', sans-serif;\n  font-weight: ${fontWeight};\n  color: ${hslColor};\n}`; // Output HSL
    cssOutput.textContent = css;
}

function copyToClipboard() {
    const cssText = cssOutput.textContent;
    navigator.clipboard.writeText(cssText)
        .then(() => {
            alert('CSS copied to clipboard!'); // Simple feedback
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy CSS to clipboard.');
        });
}

function formatNumber(number) {
    const numStr = number.toFixed(4); // First, limit to 4 decimal places
    if (numStr.includes('.')) {
        return numStr.replace(/(\.0+|0+)$/, '');
    }
    return numStr;
}

// Initial font population
populateFonts();

// Initial font link setup with the default font and weight
updateGoogleFontLink(fontFamilySelect.value, fontWeightSelect.value);
generateResponsiveFontSize(); // Call once to generate initial CSS

// Event listeners for input changes
htmlTagInput.addEventListener('input', generateResponsiveFontSize);
fontWeightSelect.addEventListener('change', generateResponsiveFontSize);
minWidthInput.addEventListener('input', generateResponsiveFontSize);
minFontSizeInput.addEventListener('input', generateResponsiveFontSize);
maxWidthInput.addEventListener('input', generateResponsiveFontSize);
maxFontSizeInput.addEventListener('input', generateResponsiveFontSize);
fontFamilySelect.addEventListener('change', generateResponsiveFontSize);
textColorInput.addEventListener('input', generateResponsiveFontSize);

// Event listener for the copy button
copyButton.addEventListener('click', copyToClipboard);