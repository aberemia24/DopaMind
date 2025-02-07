import Jimp from 'jimp';
const path = require('path');
const fs = require('fs');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');

// Asigură-te că directorul assets există
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function generateAssets() {
  try {
    console.log('Starting asset generation...');

    // Setări comune
    const BLUE = "#6495EDFF"; // Albastru cornflower

    // Generează icon.png (1024x1024)
    console.log('Generating icon.png...');
    const icon = new Jimp(1024, 1024, BLUE);
    const iconFont = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    icon.print(iconFont, 0, 0, {
      text: 'DM',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, 1024, 1024);
    await icon.writeAsync(path.join(ASSETS_DIR, 'icon.png'));

    // Copiază icon.png pentru adaptive-icon.png
    await icon.writeAsync(path.join(ASSETS_DIR, 'adaptive-icon.png'));

    // Generează splash.png (2048x2048)
    console.log('Generating splash.png...');
    const splash = new Jimp(2048, 2048, BLUE);
    const splashFont = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
    splash.print(splashFont, 0, 0, {
      text: 'DopaMind',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, 2048, 2048);
    await splash.writeAsync(path.join(ASSETS_DIR, 'splash.png'));

    // Generează notification-icon.png (96x96)
    console.log('Generating notification-icon.png...');
    const notification = new Jimp(96, 96, BLUE);
    const notificationFont = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
    notification.print(notificationFont, 0, 0, {
      text: 'DM',
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
    }, 96, 96);
    await notification.writeAsync(path.join(ASSETS_DIR, 'notification-icon.png'));

    console.log('All assets generated successfully!');
  } catch (error) {
    console.error('Error in generateAssets:', error);
    process.exit(1);
  }
}

// Rulează generarea
generateAssets();
