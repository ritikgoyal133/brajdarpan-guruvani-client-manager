/**
 * Helper script to guide icon download process
 * Run with: node scripts/download-icons-helper.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagesDir = path.join(__dirname, '..', 'public', 'images');
const icon192 = path.join(imagesDir, 'icon-192.png');
const icon512 = path.join(imagesDir, 'icon-512.png');

console.log('\n🔮 Astrology Icon Setup Helper\n');
console.log('='.repeat(50));

// Check if icons exist
const hasIcon192 = fs.existsSync(icon192);
const hasIcon512 = fs.existsSync(icon512);

if (hasIcon192 && hasIcon512) {
  console.log('✅ Icons are already present!');
  console.log(`   - ${icon192}`);
  console.log(`   - ${icon512}`);
  console.log('\n🎉 Your PWA is ready for installation!');
} else {
  console.log('❌ Icons are missing. Here\'s what you need:\n');
  
  if (!hasIcon192) {
    console.log('   Missing: icon-192.png (192x192 pixels)');
  }
  if (!hasIcon512) {
    console.log('   Missing: icon-512.png (512x512 pixels)');
  }
  
  console.log('\n📥 Download Options:\n');
  console.log('1. Flaticon: https://www.flaticon.com/');
  console.log('   Search: "astrology", "zodiac", "spiritual"');
  console.log('\n2. Icons8: https://icons8.com/');
  console.log('   Search: "astrology", "mystic", "zodiac"');
  console.log('\n3. PWA Builder: https://www.pwabuilder.com/imageGenerator');
  console.log('   Upload any astrology image, auto-generates all sizes');
  console.log('\n4. Pixabay: https://pixabay.com/');
  console.log('   Search: "astrology icon", "zodiac symbol"');
  
  console.log('\n📋 Steps:');
  console.log('1. Download an astrology/spiritual icon (512x512 or larger)');
  console.log('2. Resize to 192x192 and 512x512 pixels');
  console.log('3. Save as:');
  console.log(`   - ${icon192}`);
  console.log(`   - ${icon512}`);
  console.log('\n4. Run this script again to verify!');
}

console.log('\n' + '='.repeat(50));
console.log('\n💡 Tip: Choose icons with orange/white theme to match your app!');
console.log('   Theme colors: Orange (#FF6B35) and White (#FFFFFF)\n');

