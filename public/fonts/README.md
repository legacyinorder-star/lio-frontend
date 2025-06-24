# Font Files

This directory contains the TMT Limkin font files for the application.

## Available Files

The following TMT Limkin font files are used:

- `TMT Limkin.woff2` - Web Open Font Format 2.0 (preferred format)
- `TMT Limkin.woff` - Web Open Font Format (fallback)
- `TMT Limkin.ttf` - TrueType Font (fallback)

## Font Weight

- **Regular (400)**: Used for all text elements including body text, headings, and emphasis

## Implementation

The font is configured in:
- `src/index.css` - @font-face declarations
- `tailwind.config.js` - Tailwind font family configuration

All text in the application will use TMT Limkin as the single font family. Since only one weight is available, the browser will automatically adjust the font weight using CSS font-weight properties (normal, bold, etc.) by scaling the available font. 