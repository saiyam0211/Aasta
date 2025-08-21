const fs = require('fs');
const path = require('path');

// This script requires the 'canvas' package to be installed
// npm install canvas

async function generateMaskableIcon() {
    try {
        // Check if canvas is available
        const { createCanvas, loadImage } = require('canvas');
        
        const sizes = [192, 512];
        
        for (const size of sizes) {
            const inputPath = path.join(__dirname, 'public', 'icons', `Aasta_Logos_${size}x${size}.png`);
            const outputPath = path.join(__dirname, 'public', 'icons', `Aasta_Logos_${size}x${size}.maskable.png`);
            
            // Create canvas with #002a01 background
            const canvas = createCanvas(size, size);
            const ctx = canvas.getContext('2d');
            
            // Fill with #002a01 background
            ctx.fillStyle = '#002a01';
            ctx.fillRect(0, 0, size, size);
            
            // Load the original icon
            const image = await loadImage(inputPath);
            
            // Calculate safe area (40% of canvas for maskable icons)
            const iconSize = size * 0.6;
            const offset = (size - iconSize) / 2;
            
            // Draw the icon in the center
            ctx.drawImage(image, offset, offset, iconSize, iconSize);
            
            // Save the maskable icon
            const buffer = canvas.toBuffer('image/png');
            fs.writeFileSync(outputPath, buffer);
            
            console.log(`✅ Generated maskable icon: ${outputPath}`);
        }
        
        console.log('\n🎉 All maskable icons generated successfully!');
        console.log('📁 Files saved in: public/icons/');
        console.log('🔄 Please rebuild your project to see the changes.');
        
    } catch (error) {
        if (error.message.includes('Cannot find module \'canvas\'')) {
            console.log('❌ Canvas package not found. Installing...');
            console.log('📦 Run: npm install canvas');
            console.log('🔄 Then run: node generate-maskable-icons.js');
        } else {
            console.error('❌ Error generating maskable icons:', error.message);
        }
    }
}

// Run the script
generateMaskableIcon();