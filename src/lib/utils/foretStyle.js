export const colorPalette = {
'vert-clair': '#c7e3b5',
'vert-foncé': '#4f8247',
bleu: '#6b8fe0',
marron: '#8a5a34',
gris: '#9aa3ad',
jaune: '#e2c85f',
orange: '#e5791f',
rouge: '#d8675f',
violet: '#9a7edc',
rose: '#d88bb4',
none: '#c7c7c7',
};




export function resolveColor(token) {
return colorPalette[token] ?? colorPalette.none;
}

export function cardStyle(token) {
const resolved = resolveColor(token);
return `--card-color: ${resolved}; --card-light: ${lighten(resolved)};`;
}

export function lighten(hex, amount = 40) {
let r = parseInt(hex.slice(1, 3), 16);
let g = parseInt(hex.slice(3, 5), 16);
let b = parseInt(hex.slice(5, 7), 16);
r = Math.min(255, r + amount);
g = Math.min(255, g + amount);
b = Math.min(255, b + amount);
return `rgb(${r},${g},${b})`;
}