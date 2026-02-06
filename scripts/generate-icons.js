const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const assetsPath = path.join(__dirname, '../src/assets');
const foregroundIconPath = path.join(assetsPath, 'icon_foreground.png');
const backgroundIconPath = path.join(assetsPath, 'icon_background.png');
const backgroundIconPathAlt = path.join(assetsPath, 'icon_background .png'); // Handle space in filename
const fallbackIconPath = path.join(assetsPath, 'App_Icon.png');
const androidResPath = path.join(__dirname, '../android/app/src/main/res');
const iosAssetsPath = path.join(__dirname, '../ios/FatafatMarketerApp/Assets.xcassets/AppIcon.appiconset');
const androidManifestPath = path.join(__dirname, '../android/app/src/main/AndroidManifest.xml');

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

/**
 * Merge foreground and background icons into a single image
 * @returns {Promise<sharp.Sharp>} Merged image instance
 */
async function mergeIcons() {
  const hasForeground = fs.existsSync(foregroundIconPath);
  const hasBackground = fs.existsSync(backgroundIconPath) || fs.existsSync(backgroundIconPathAlt);
  const actualBackgroundPath = fs.existsSync(backgroundIconPath) ? backgroundIconPath : backgroundIconPathAlt;

  if (hasForeground && hasBackground) {
    console.log('Merging foreground and background icons...');
    
    // Get dimensions of background to ensure proper sizing
    const backgroundMetadata = await sharp(actualBackgroundPath).metadata();
    const width = backgroundMetadata.width || 1024;
    const height = backgroundMetadata.height || 1024;

    // Create merged image: background first, then foreground on top
    const merged = await sharp(actualBackgroundPath)
      .resize(width, height)
      .composite([
        {
          input: await sharp(foregroundIconPath)
            .resize(width, height, { fit: 'contain' })
            .toBuffer(),
          blend: 'over',
        },
      ])
      .png()
      .toBuffer();

    console.log('✓ Icons merged successfully');
    return sharp(merged);
  } else if (hasForeground) {
    console.log('Using foreground icon only...');
    return sharp(foregroundIconPath);
  } else if (hasBackground) {
    console.log('Using background icon only...');
    return sharp(actualBackgroundPath);
  } else if (fs.existsSync(fallbackIconPath)) {
    console.log('Using fallback App_Icon.png...');
    return sharp(fallbackIconPath);
  } else {
    throw new Error('No icon files found. Please place icon_foreground.png and/or icon_background.png in src/assets/');
  }
}

async function generateAndroidIcons(mergedIcon) {
  console.log('Generating Android icons...');
  
  for (const [folder, size] of Object.entries(androidSizes)) {
    const folderPath = path.join(androidResPath, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const iconPath = path.join(folderPath, 'ic_launcher.png');
    const iconRoundPath = path.join(folderPath, 'ic_launcher_round.png');

    await mergedIcon
      .clone()
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(iconPath);

    await mergedIcon
      .clone()
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(iconRoundPath);

    console.log(`✓ Generated ${folder}/ic_launcher.png (${size}x${size})`);
    console.log(`✓ Generated ${folder}/ic_launcher_round.png (${size}x${size})`);
  }
}

async function generateIOSIcons(mergedIcon) {
  console.log('Generating iOS icons...');
  
  if (!fs.existsSync(iosAssetsPath)) {
    fs.mkdirSync(iosAssetsPath, { recursive: true });
  }

  for (const { size, scale, filename } of iosSizes) {
    const pixelSize = size * scale;
    const iconPath = path.join(iosAssetsPath, filename);

    await mergedIcon
      .clone()
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

/**
 * Update AndroidManifest.xml to use the generated icons
 */
function updateAndroidManifest() {
  console.log('Updating AndroidManifest.xml...');
  
  let manifestContent = fs.readFileSync(androidManifestPath, 'utf8');
  
  // Replace icon references
  manifestContent = manifestContent.replace(
    /android:icon="@android:drawable\/sym_def_app_icon"/g,
    'android:icon="@mipmap/ic_launcher"'
  );
  
  manifestContent = manifestContent.replace(
    /android:roundIcon="@android:drawable\/sym_def_app_icon"/g,
    'android:roundIcon="@mipmap/ic_launcher_round"'
  );
  
  fs.writeFileSync(androidManifestPath, manifestContent, 'utf8');
  console.log('✓ Updated AndroidManifest.xml');
}

async function main() {
  try {
    // Merge icons
    const mergedIcon = await mergeIcons();
    
    // Generate all icon sizes
    await generateAndroidIcons(mergedIcon);
    await generateIOSIcons(mergedIcon);
    
    // Update AndroidManifest.xml
    updateAndroidManifest();
    
    console.log('\nAll icons generated successfully!');
    console.log('Android icons: android/app/src/main/res/mipmap-*/');
    console.log('iOS icons: ios/FatafatMarketerApp/Assets.xcassets/AppIcon.appiconset/');
  } catch (error) {
    console.error('Error generating icons:', error);
    process.exit(1);
  }
}

main();