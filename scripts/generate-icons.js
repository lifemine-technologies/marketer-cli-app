const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sourceIconPath = path.join(__dirname, '../src/assets/App_Icon.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const iosAssetsPath = path.join(__dirname, '../ios/FatafatMarketerApp/Assets.xcassets/AppIcon.appiconset');

// Android icon sizes (in dp, converted to px with density multipliers)
const androidSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

// iOS icon sizes
const iosSizes = [
  { size: 20, scale: 2, filename: 'icon-20@2x.png' },
  { size: 20, scale: 3, filename: 'icon-20@3x.png' },
  { size: 29, scale: 2, filename: 'icon-29@2x.png' },
  { size: 29, scale: 3, filename: 'icon-29@3x.png' },
  { size: 40, scale: 2, filename: 'icon-40@2x.png' },
  { size: 40, scale: 3, filename: 'icon-40@3x.png' },
  { size: 60, scale: 2, filename: 'icon-60@2x.png' },
  { size: 60, scale: 3, filename: 'icon-60@3x.png' },
  { size: 76, scale: 1, filename: 'icon-76.png' },
  { size: 76, scale: 2, filename: 'icon-76@2x.png' },
  { size: 83.5, scale: 2, filename: 'icon-83.5@2x.png' },
  { size: 1024, scale: 1, filename: 'icon-1024.png' },
];

async function generateAndroidIcons() {
  console.log('Generating Android icons...');
  
  for (const [folder, size] of Object.entries(androidSizes)) {
    const folderPath = path.join(androidResPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const iconPath = path.join(folderPath, 'ic_launcher.png');
    const iconRoundPath = path.join(folderPath, 'ic_launcher_round.png');

    await sharp(sourceIconPath)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(iconPath);

    await sharp(sourceIconPath)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(iconRoundPath);

    console.log(`✓ Generated ${folder}/ic_launcher.png (${size}x${size})`);
    console.log(`✓ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
  }
}

async function generateIOSIcons() {
  console.log('Generating iOS icons...');
  
  if (!fs.existsSync(iosAssetsPath)) {
    fs.mkdirSync(iosAssetsPath, { recursive: true });
  }

  for (const { size, scale, filename } of iosSizes) {
    const pixelSize = size * scale;
    const iconPath = path.join(iosAssetsPath, filename);

    await sharp(sourceIconPath)
      .resize(pixelSize, pixelSize, { fit: 'cover' })
      .png()
      .toFile(iconPath);

    console.log(`✓ Generated ${filename} (${pixelSize}x${pixelSize})`);
  }

  // Generate Contents.json for iOS
  const contentsJson = {
    images: [
      { size: '20x20', idiom: 'iphone', scale: '2x', filename: 'icon-20@2x.png' },
      { size: '20x20', idiom: 'iphone', scale: '3x', filename: 'icon-20@3x.png' },
      { size: '29x29', idiom: 'iphone', scale: '2x', filename: 'icon-29@2x.png' },
      { size: '29x29', idiom: 'iphone', scale: '3x', filename: 'icon-29@3x.png' },
      { size: '40x40', idiom: 'iphone', scale: '2x', filename: 'icon-40@2x.png' },
      { size: '40x40', idiom: 'iphone', scale: '3x', filename: 'icon-40@3x.png' },
      { size: '60x60', idiom: 'iphone', scale: '2x', filename: 'icon-60@2x.png' },
      { size: '60x60', idiom: 'iphone', scale: '3x', filename: 'icon-60@3x.png' },
      { size: '20x20', idiom: 'ipad', scale: '1x', filename: 'icon-20@2x.png' },
      { size: '20x20', idiom: 'ipad', scale: '2x', filename: 'icon-20@3x.png' },
      { size: '29x29', idiom: 'ipad', scale: '1x', filename: 'icon-29@2x.png' },
      { size: '29x29', idiom: 'ipad', scale: '2x', filename: 'icon-29@3x.png' },
      { size: '40x40', idiom: 'ipad', scale: '1x', filename: 'icon-40@2x.png' },
      { size: '40x40', idiom: 'ipad', scale: '2x', filename: 'icon-40@3x.png' },
      { size: '76x76', idiom: 'ipad', scale: '1x', filename: 'icon-76.png' },
      { size: '76x76', idiom: 'ipad', scale: '2x', filename: 'icon-76@2x.png' },
      { size: '83.5x83.5', idiom: 'ipad', scale: '2x', filename: 'icon-83.5@2x.png' },
      { size: '1024x1024', idiom: 'ios-marketing', scale: '1x', filename: 'icon-1024.png' },
    ],
    info: {
      author: 'xcode',
      version: 1,
    },
  };

  fs.writeFileSync(
    path.join(iosAssetsPath, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('✓ Generated Contents.json');
}

async function main() {
  if (!fs.existsSync(sourceIconPath)) {
    console.error(`Error: Source icon not found at ${sourceIconPath}`);
    console.error('Please place App_Icon.png in src/assets/ folder');
    process.exit(1);
  }

  try {
    await generateAndroidIcons();
    await generateIOSIcons();
    console.log('\n✅ All icons generated successfully!');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();
