export class ESCPosGenerator {
  private buffer: number[] = [];

  constructor(private paperSize: 58 | 80 = 80) {}

  init() {
    this.buffer.push(0x1B, 0x40);
    return this;
  }

  alignCenter() {
    this.buffer.push(0x1B, 0x61, 0x01);
    return this;
  }

  alignLeft() {
    this.buffer.push(0x1B, 0x61, 0x00);
    return this;
  }

  alignRight() {
    this.buffer.push(0x1B, 0x61, 0x02);
    return this;
  }

  bold(on: boolean) {
    this.buffer.push(0x1B, 0x45, on ? 1 : 0);
    return this;
  }

  size(widthMul: number, heightMul: number) {
    // widthMul and heightMul should be between 1 and 8
    const w = Math.max(0, Math.min(7, widthMul - 1));
    const h = Math.max(0, Math.min(7, heightMul - 1));
    this.buffer.push(0x1D, 0x21, (w << 4) | h);
    return this;
  }

  text(str: string) {
    for (let i = 0; i < str.length; i++) {
      this.buffer.push(str.charCodeAt(i));
    }
    return this;
  }

  textLine(str: string) {
    return this.text(str).newline();
  }

  newline(count: number = 1) {
    for (let i = 0; i < count; i++) {
      this.buffer.push(0x0A);
    }
    return this;
  }

  cut() {
    this.buffer.push(0x1D, 0x56, 0x41, 0x10);
    return this;
  }

  openDrawer() {
    this.buffer.push(0x1B, 0x70, 0x00, 0x19, 0xFA);
    return this;
  }

  generate(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
  
  async printImage(url: string) {
    try {
      const img = new Image();
            img.src = url;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return this;
      
      const maxWidth = this.paperSize === 58 ? 384 : 576;
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      width = Math.floor(width / 8) * 8;
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      const imgData = ctx.getImageData(0, 0, width, height);
      const pixels = imgData.data;
      
      let firstY = -1;
      let lastY = -1;
      
      for (let y = 0; y < height; y++) {
        let hasBlack = false;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];
          if (a > 128) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance < 128) {
               hasBlack = true;
               break;
            }
          }
        }
        if (hasBlack) {
           if (firstY === -1) firstY = y;
           lastY = y;
        }
      }
      
      if (firstY === -1) {
         // No black pixels, skip printing
         return this;
      }
      
      const croppedHeight = (lastY - firstY) + 1;
      const bytesWidth = width / 8;
      const data = new Uint8Array(bytesWidth * croppedHeight);
      
      for (let y = firstY; y <= lastY; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = pixels[idx];
          const g = pixels[idx + 1];
          const b = pixels[idx + 2];
          const a = pixels[idx + 3];
          
          let isBlack = false;
          if (a > 128) {
             const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
             isBlack = luminance < 128;
          }
          
          if (isBlack) {
            const byteIdx = (y - firstY) * bytesWidth + Math.floor(x / 8);
            const bit = 7 - (x % 8);
            data[byteIdx] |= (1 << bit);
          }
        }
      }
      
      this.buffer.push(0x1D, 0x76, 0x30, 0x00);
      this.buffer.push(bytesWidth & 0xFF, (bytesWidth >> 8) & 0xFF);
      this.buffer.push(croppedHeight & 0xFF, (croppedHeight >> 8) & 0xFF);
      
      for (let i = 0; i < data.length; i++) {
         this.buffer.push(data[i]);
      }
      
    } catch(e) {
       console.warn("Failed to print image: " + e.message);
    }
    return this;
  }

  print4Columns(col1: string, col2: string, col3: string, col4: string) {
     col1 = (col1 || '').toString();
     col2 = (col2 || '').toString();
     col3 = (col3 || '').toString();
     col4 = (col4 || '').toString();
     
     const width = this.paperSize === 58 ? 32 : 48;
     // Define column widths
     const col2Width = 4; // Qty
     const col3Width = 8; // Rate
     const col4Width = 9; // Amount
     const spaceBetween = 1; // 1 space between cols
     
     const rightSideWidth = col2Width + col3Width + col4Width + (spaceBetween * 3);
     const maxCol1Width = width - rightSideWidth;
     
     const formatRightSide = () => {
         return ' '.repeat(spaceBetween) + 
                col2.padStart(col2Width).substring(0, col2Width) + ' '.repeat(spaceBetween) +
                col3.padStart(col3Width).substring(0, col3Width) + ' '.repeat(spaceBetween) +
                col4.padStart(col4Width).substring(0, col4Width);
     };

     if (col1.length <= maxCol1Width) {
         const padding = maxCol1Width - col1.length;
         this.textLine(col1 + ' '.repeat(padding) + formatRightSide());
     } else {
         // Wrap col1
         const words = col1.split(' ');
         let currentLine = '';
         const lines = [];
         
         for (const word of words) {
             if ((currentLine + word).length > maxCol1Width) {
                 if (currentLine) {
                     lines.push(currentLine.trim());
                     currentLine = '';
                 }
                 if (word.length > maxCol1Width) {
                     lines.push(word.substring(0, maxCol1Width));
                     currentLine = word.substring(maxCol1Width) + ' ';
                 } else {
                     currentLine = word + ' ';
                 }
             } else {
                 currentLine += word + ' ';
             }
         }
         if (currentLine) {
             lines.push(currentLine.trim());
         }
         
         for (let i = 0; i < lines.length; i++) {
             const line = lines[i];
             const padding = maxCol1Width - line.length;
             if (i === 0) {
                 this.textLine(line + ' '.repeat(padding) + formatRightSide());
             } else {
                 this.textLine(line);
             }
         }
     }
     return this;
  }

  printLine(left: string, right: string) {
     left = (left || '').toString();
     right = (right || '').toString();
     const width = this.paperSize === 58 ? 32 : 48;
     const maxLeftWidth = width - right.length - 1; // 1 space minimum

     if (left.length <= maxLeftWidth) {
       const spaces = width - left.length - right.length;
       this.textLine(left + ' '.repeat(spaces > 0 ? spaces : 1) + right);
     } else {
       // Wrap the left string
       const words = left.split(' ');
       let currentLine = '';
       const lines = [];
       
       for (const word of words) {
         if ((currentLine + word).length > maxLeftWidth) {
           if (currentLine) {
             lines.push(currentLine.trim());
             currentLine = '';
           }
           if (word.length > maxLeftWidth) {
             lines.push(word.substring(0, maxLeftWidth));
             currentLine = word.substring(maxLeftWidth) + ' ';
           } else {
             currentLine = word + ' ';
           }
         } else {
           currentLine += word + ' ';
         }
       }
       if (currentLine) {
         lines.push(currentLine.trim());
       }

       for (let i = 0; i < lines.length; i++) {
         if (i === lines.length - 1) {
           const spaces = width - lines[i].length - right.length;
           this.textLine(lines[i] + ' '.repeat(spaces > 0 ? spaces : 1) + right);
         } else {
           this.textLine(lines[i]);
         }
       }
     }
     return this;
  }
  
  printDivider() {
    const width = this.paperSize === 58 ? 32 : 48;
    this.textLine('-'.repeat(width));
    return this;
  }
}
