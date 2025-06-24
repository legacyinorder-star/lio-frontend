# Font Files

This directory contains the TMT Limkin font files for the application.

## Available Files

The application uses the **TMT-LimkinVF** variable font for optimal performance:

- `TMT-LimkinVF.woff2` - Web Open Font Format 2.0 Variable Font (preferred format)
- `TMT-LimkinVF.woff` - Web Open Font Format Variable Font (fallback)
- `TMT-LimkinVF.ttf` - TrueType Variable Font (fallback)

## Variable Font Benefits

- **Single file:** One font file contains all weights (100-900)
- **Smaller file size:** More efficient than multiple static font files
- **Smooth interpolation:** Any weight between 100-900 can be used
- **Better performance:** Faster loading and rendering

## Font Weight Range

The variable font supports the full weight range:
- **100-300:** Light weights
- **400:** Regular weight
- **500:** Medium weight  
- **600:** Semi-bold weight
- **700:** Bold weight
- **800-900:** Extra bold weights

## Implementation

The font is configured in:
- `src/index.css` - @font-face declaration with variable font support
- `tailwind.config.js` - Tailwind font family configuration

All text in the application will use TMT Limkin as the single font family with variable weight support.

## Static Font Files (Legacy)

The following static font files are also available but not used:
- `TMT Limkin.woff2`, `TMT Limkin.woff`, `TMT Limkin.ttf` (in untitled folder)
- `inter.ttf`, `inter.woff2` (Inter font - not used) 