declare const __FONT_BASE_URL__: string;

const BASE = __FONT_BASE_URL__;

const fonts: [string, FontFaceDescriptors][] = [
  [`${BASE}/Rubik-Light.ttf`,           { weight: '300', style: 'normal' }],
  [`${BASE}/Rubik-LightItalic.ttf`,     { weight: '300', style: 'italic' }],
  [`${BASE}/Rubik-Regular.ttf`,         { weight: '400', style: 'normal' }],
  [`${BASE}/Rubik-Italic.ttf`,          { weight: '400', style: 'italic' }],
  [`${BASE}/Rubik-Medium.ttf`,          { weight: '500', style: 'normal' }],
  [`${BASE}/Rubik-MediumItalic.ttf`,    { weight: '500', style: 'italic' }],
  [`${BASE}/Rubik-SemiBold.ttf`,        { weight: '600', style: 'normal' }],
  [`${BASE}/Rubik-SemiBoldItalic.ttf`,  { weight: '600', style: 'italic' }],
  [`${BASE}/Rubik-Bold.ttf`,            { weight: '700', style: 'normal' }],
  [`${BASE}/Rubik-BoldItalic.ttf`,      { weight: '700', style: 'italic' }],
  [`${BASE}/Rubik-ExtraBold.ttf`,       { weight: '800', style: 'normal' }],
  [`${BASE}/Rubik-ExtraBoldItalic.ttf`, { weight: '800', style: 'italic' }],
  [`${BASE}/Rubik-Black.ttf`,           { weight: '900', style: 'normal' }],
  [`${BASE}/Rubik-BlackItalic.ttf`,     { weight: '900', style: 'italic' }],
];

export function loadFonts() {
  fonts.forEach(([src, descriptors]) => {
    const face = new FontFace('Rubik', `url(${src}) format('truetype')`, descriptors);
    face.load().then(f => document.fonts.add(f));
  });
}
