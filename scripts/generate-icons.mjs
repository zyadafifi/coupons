#!/usr/bin/env node

/**
 * Icon Generator for App Launcher + Splash Icon
 * 
 * Generates:
 * 1. resources/icon.png (1024x1024) - App launcher icon
 * 2. resources/icon-foreground.png (432x432) - For adaptive icons
 * 3. android/app/src/main/res/drawable/splash_icon.png (288x288) - For Android 12+ splash
 * 
 * All use the yellow logo from logo-original.png
 * 
 * Usage: node scripts/generate-icons.mjs
 */

import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const CONFIG = {
  // Input logo
  logoPath: join(projectRoot, 'src', 'assets', 'logo-original.png'),
  
  // Outputs
  appIconPath: join(projectRoot, 'resources', 'icon.png'),
  appIconForegroundPath: join(projectRoot, 'resources', 'icon-foreground.png'),
  splashIconPath: join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable', 'splash_icon.png'),
  
  // Sizes
  appIconSize: 1024,      // Standard app icon
  foregroundSize: 432,    // Adaptive icon foreground (512 * 0.84 safe zone)
  splashIconSize: 288,    // Android 12+ splash icon
  
  // Background color for app icon (purple brand)
  backgroundColor: '#7c3aed',
};

/**
 * Generate app launcher icon (1024x1024)
 */
async function generateAppIcon() {
  console.log('📱 Generating app launcher icon...');
  
  const logoBuffer = await sharp(CONFIG.logoPath).toBuffer();
  const metadata = await sharp(logoBuffer).metadata();
  
  // Logo should be 70% of icon size (industry standard)
  const logoSize = Math.round(CONFIG.appIconSize * 0.7);
  const logoHeight = Math.round(logoSize / (metadata.width / metadata.height));
  
  // Create purple background
  const background = await sharp({
    create: {
      width: CONFIG.appIconSize,
      height: CONFIG.appIconSize,
      channels: 4,
      background: CONFIG.backgroundColor
    }
  }).png().toBuffer();
  
  // Resize logo
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  // Composite
  const left = Math.round((CONFIG.appIconSize - logoSize) / 2);
  const top = Math.round((CONFIG.appIconSize - logoHeight) / 2);
  
  await sharp(background)
    .composite([{
      input: resizedLogo,
      left: left,
      top: top
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(CONFIG.appIconPath);
  
  console.log(`✓ App icon: ${CONFIG.appIconPath} (${CONFIG.appIconSize}x${CONFIG.appIconSize})`);
}

/**
 * Generate adaptive icon foreground (432x432)
 */
async function generateForeground() {
  console.log('🎨 Generating adaptive icon foreground...');
  
  const logoBuffer = await sharp(CONFIG.logoPath).toBuffer();
  const metadata = await sharp(logoBuffer).metadata();
  
  // Logo should be 60% of foreground size (safe zone)
  const logoSize = Math.round(CONFIG.foregroundSize * 0.6);
  const logoHeight = Math.round(logoSize / (metadata.width / metadata.height));
  
  // Create transparent background
  const background = await sharp({
    create: {
      width: CONFIG.foregroundSize,
      height: CONFIG.foregroundSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).png().toBuffer();
  
  // Resize logo
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  // Composite
  const left = Math.round((CONFIG.foregroundSize - logoSize) / 2);
  const top = Math.round((CONFIG.foregroundSize - logoHeight) / 2);
  
  await sharp(background)
    .composite([{
      input: resizedLogo,
      left: left,
      top: top
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(CONFIG.appIconForegroundPath);
  
  console.log(`✓ Foreground: ${CONFIG.appIconForegroundPath} (${CONFIG.foregroundSize}x${CONFIG.foregroundSize})`);
}

/**
 * Generate splash icon for Android 12+ (288x288)
 */
async function generateSplashIcon() {
  console.log('🌟 Generating Android 12+ splash icon...');
  
  const logoBuffer = await sharp(CONFIG.logoPath).toBuffer();
  const metadata = await sharp(logoBuffer).metadata();
  
  // Logo should be 80% of splash icon size (prominent but not too big)
  const logoSize = Math.round(CONFIG.splashIconSize * 0.8);
  const logoHeight = Math.round(logoSize / (metadata.width / metadata.height));
  
  // Create transparent background (Android 12+ will show our purple behind it)
  const background = await sharp({
    create: {
      width: CONFIG.splashIconSize,
      height: CONFIG.splashIconSize,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).png().toBuffer();
  
  // Resize logo
  const resizedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoHeight, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();
  
  // Composite
  const left = Math.round((CONFIG.splashIconSize - logoSize) / 2);
  const top = Math.round((CONFIG.splashIconSize - logoHeight) / 2);
  
  // Ensure drawable directory exists
  const drawableDir = join(projectRoot, 'android', 'app', 'src', 'main', 'res', 'drawable');
  if (!existsSync(drawableDir)) {
    mkdirSync(drawableDir, { recursive: true });
  }
  
  await sharp(background)
    .composite([{
      input: resizedLogo,
      left: left,
      top: top
    }])
    .png({ compressionLevel: 9, quality: 100 })
    .toFile(CONFIG.splashIconPath);
  
  console.log(`✓ Splash icon: ${CONFIG.splashIconPath} (${CONFIG.splashIconSize}x${CONFIG.splashIconSize})`);
}

/**
 * Main generator
 */
async function generateIcons() {
  console.log('🎨 Generating icons...\n');
  
  try {
    // Check if logo exists
    if (!existsSync(CONFIG.logoPath)) {
      throw new Error(`Logo not found: ${CONFIG.logoPath}`);
    }
    
    // Ensure resources directory exists
    const resourcesDir = join(projectRoot, 'resources');
    if (!existsSync(resourcesDir)) {
      mkdirSync(resourcesDir, { recursive: true });
    }
    
    // Generate all icons
    await generateAppIcon();
    await generateForeground();
    await generateSplashIcon();
    
    console.log(`\n✅ All icons generated successfully!\n`);
    console.log('📋 Next steps:');
    console.log('   1. npm run assets:android    (generate all densities)');
    console.log('   2. Update Android theme files (ic_launcher_background)');
    console.log('   3. npm run build:mobile && npm run open:android\n');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error.message);
    process.exit(1);
  }
}

// Run generator
generateIcons();

