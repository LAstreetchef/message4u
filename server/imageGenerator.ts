import { createCanvas, registerFont } from 'canvas';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'client', 'public', 'generated');

// Ensure output directory exists
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

export async function generateMessageImage(
  messageBody: string,
  messageId: string
): Promise<string> {
  // Create canvas
  const width = 800;
  const padding = 60;
  const lineHeight = 40;
  
  // Calculate text wrapping
  const canvas = createCanvas(width, 100);
  const ctx = canvas.getContext('2d');
  ctx.font = 'bold 28px sans-serif';
  
  // Wrap text
  const maxWidth = width - (padding * 2);
  const words = messageBody.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Calculate final height
  const textHeight = lines.length * lineHeight + padding;
  const height = textHeight + padding * 2;
  
  // Create final canvas
  const finalCanvas = createCanvas(width, height);
  const finalCtx = finalCanvas.getContext('2d');
  
  // Background gradient (peachy/cream color)
  const gradient = finalCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#FEA47F');
  gradient.addColorStop(0.5, '#FFE5D9');
  gradient.addColorStop(1, '#FEA47F');
  finalCtx.fillStyle = gradient;
  finalCtx.fillRect(0, 0, width, height);
  
  // Add decorative hearts in corners (simple shapes, not emoji)
  finalCtx.fillStyle = 'rgba(255, 107, 157, 0.2)';
  
  // Draw simple heart shapes in corners
  const drawHeart = (x: number, y: number, size: number) => {
    finalCtx.beginPath();
    finalCtx.arc(x - size/4, y, size/4, 0, 2 * Math.PI);
    finalCtx.arc(x + size/4, y, size/4, 0, 2 * Math.PI);
    finalCtx.fill();
    finalCtx.beginPath();
    finalCtx.moveTo(x - size/2, y);
    finalCtx.lineTo(x, y + size/2);
    finalCtx.lineTo(x + size/2, y);
    finalCtx.fill();
  };
  
  // Top left
  drawHeart(30, 30, 20);
  // Top right
  drawHeart(width - 30, 30, 20);
  // Bottom left
  drawHeart(30, height - 30, 20);
  // Bottom right
  drawHeart(width - 30, height - 30, 20);
  
  // Draw text
  finalCtx.fillStyle = '#2d2d2d';
  finalCtx.font = 'bold 28px sans-serif';
  finalCtx.textAlign = 'center';
  finalCtx.textBaseline = 'top';
  
  let y = padding;
  for (const line of lines) {
    finalCtx.fillText(line, width / 2, y);
    y += lineHeight;
  }
  
  // Save to file
  const filename = `message-${messageId}.png`;
  const filepath = join(OUTPUT_DIR, filename);
  const buffer = finalCanvas.toBuffer('image/png');
  writeFileSync(filepath, buffer);
  
  // Return public URL path
  return `/generated/${filename}`;
}
