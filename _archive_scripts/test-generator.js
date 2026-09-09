class ESCPosGenerator {
  constructor(paperSize = 80) { this.paperSize = paperSize; this.buffer = []; }
  init() { this.buffer.push(0x1B, 0x40); return this; }
  alignCenter() { this.buffer.push(0x1B, 0x61, 0x01); return this; }
  alignLeft() { this.buffer.push(0x1B, 0x61, 0x00); return this; }
  alignRight() { this.buffer.push(0x1B, 0x61, 0x02); return this; }
  text(str) { for (let i = 0; i < str.length; i++) this.buffer.push(str.charCodeAt(i)); return this; }
  textLine(str) { return this.text(str).newline(); }
  newline(count = 1) { for (let i = 0; i < count; i++) this.buffer.push(0x0A); return this; }
  printLine(left, right) {
     const width = this.paperSize === 58 ? 32 : 48;
     const spaces = width - left.length - right.length;
     if (spaces > 0) {
       this.textLine(left + ' '.repeat(spaces) + right);
     } else {
       this.textLine(left);
       this.alignRight().textLine(right).alignLeft();
     }
     return this;
  }
}
const generator = new ESCPosGenerator(58);
generator.printLine("Sub Total:", "Rs. 610.00");
generator.printLine("GST (5%):", "Rs. 30.50");
console.log(Buffer.from(generator.buffer).toString('utf8'));
