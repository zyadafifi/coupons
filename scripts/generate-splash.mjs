#!/usr/bin/env node

/**
 * Splash Screen Generator
 * 
 * Generates a professional splash screen for Capacitor Android app
 * - Size: 2732x2732px (optimal for all devices)
 * - Background: #7c3aed (purple brand color)
 * - Logo: Centered and scaled to ~1200px width (large and crisp)
 * 
 * Usage: node scripts/generate-splash.mjs
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
  // Input logo (highest quality available)
  logoPath: join(projectRoot, 'src', 'assets', 'logo-original.png'),
  
  // Output splash
  outputPath: join(projectRoot, 'resources', 'splash.png'),
  
  // Splash dimensions (2732x2732 is optimal for all devices)
  splashSize: 2732,
  
  // Logo target width (large and visible)
  logoWidth: 1200,
  
  // Background color (purple brand)
  backgroundColor: '#7c3aed',
};

/**
 * Generate splash screen
 */
async function generateSplash() {
  console.log('🎨 Generating splash screen...\n');
  
  try {
    // Check if logo exists
    if (!existsSync(CONFIG.logoPath)) {
      throw new Error(`Logo not found: ${CONFIG.logoPath}`);
    }
    
    // Ensure resources directory exists
    const resourcesDir = join(projectRoot, 'resources');
    if (!existsSync(resourcesDir)) {
      mkdirSync(resourcesDir, { recursive: true });
      console.log('✓ Created resources/ directory');
    }
    
    // Load logo and get metadata
    const logoBuffer = await sharp(CONFIG.logoPath)
      .toBuffer();
    
    const logoMetadata = await sharp(logoBuffer).metadata();
    console.log(`✓ Loaded logo: ${logoMetadata.width}x${logoMetadata.height}px`);
    
    // Calculate logo dimensions maintaining aspect ratio
    const logoAspectRatio = logoMetadata.width / logoMetadata.height;
    const logoHeight = Math.round(CONFIG.logoWidth / logoAspectRatio);
    
    console.log(`✓ Scaling logo to: ${CONFIG.logoWidth}x${logoHeight}px`);
    
    // Resize logo
    const resizedLogo = await sharp(logoBuffer)
      .resize(CONFIG.logoWidth, logoHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer();
    
    // Create purple background
    const background = await sharp({
      create: {
        width: CONFIG.splashSize,
        height: CONFIG.splashSize,
        channels: 4,
        background: CONFIG.backgroundColor
      }
    })
    .png()
    .toBuffer();
    
    console.log(`✓ Created ${CONFIG.splashSize}x${CONFIG.splashSize}px background (${CONFIG.backgroundColor})`);
    
    // Calculate position to center logo
    const left = Math.round((CONFIG.splashSize - CONFIG.logoWidth) / 2);
    const top = Math.round((CONFIG.splashSize - logoHeight) / 2);
    
    // Composite logo onto background
    const splash = await sharp(background)
      .composite([{
        input: resizedLogo,
        left: left,
        top: top
      }])
      .png({
        compressionLevel: 9,
        quality: 100
      })
      .toFile(CONFIG.outputPath);
    
    console.log(`✓ Composited logo at position (${left}, ${top})`);
    console.log(`\n✅ Splash screen generated successfully!`);
    console.log(`   Output: ${CONFIG.outputPath}`);
    console.log(`   Size: ${Math.round(splash.size / 1024)}KB`);
    console.log(`   Dimensions: ${splash.width}x${splash.height}px\n`);
    
    console.log('📋 Next steps:');
    console.log('   1. npm run assets:android    (generate all densities)');
    console.log('   2. npm run build:mobile      (build and sync)');
    console.log('   3. npm run open:android      (test in Android Studio)\n');
    
  } catch (error) {
    console.error('❌ Error generating splash screen:', error.message);
    process.exit(1);
  }
}

// Run generator
generateSplash();

