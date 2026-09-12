import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const fetchImageAsBase64 = async (url: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generatePdfMenu = async (menuItems: any[]) => {
  // Initialize document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Colors
  const brandColor = [218, 165, 32]; // Gold
  const bgColor = [15, 15, 15]; // Very Dark Grey / Black
  
  // --- PAGE 1: COVER PAGE ---
  try {
    const coverImageBase64 = await fetchImageAsBase64('/pdf-cover.jpg');
    doc.addImage(coverImageBase64, 'JPEG', 0, 0, pageWidth, pageHeight);

    // Draw a black rectangle at the bottom to cover placeholder data
    doc.setFillColor(15, 15, 15);
    doc.rect(0, pageHeight - 45, pageWidth, 45, 'F');
    
    // Draw real phone number
    doc.setFontSize(14);
    doc.setTextColor(218, 165, 32); // Gold
    doc.setFont('helvetica', 'bold');
    doc.text('Call Us', 20, pageHeight - 25);
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255); // White
    doc.text('+91 90566 55093', 20, pageHeight - 15);

    doc.setFontSize(14);
    doc.setTextColor(218, 165, 32);
    doc.text('Visit Our Website', pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text('www.harjindertouristdhaba.com', pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Generate real QR code
    const qrDataUrl = await QRCode.toDataURL('https://harjindertouristdhaba.com', {
      errorCorrectionLevel: 'H', margin: 1, width: 30, color: { dark: '#000000', light: '#ffffff' }
    });
    doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, pageHeight - 38, 30, 30);
    doc.setFontSize(8);
    doc.setTextColor(218, 165, 32);
    doc.text('SCAN FOR MENU', pageWidth - 35, pageHeight - 4, { align: 'center' });
  } catch (err) {
    console.error('Failed to load cover image or QR code', err);
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    doc.setFontSize(36);
    doc.setTextColor(brandColor[0], brandColor[1], brandColor[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('Harjinder Tourist Dhaba', pageWidth / 2, 60, { align: 'center' });
  }

  // --- MENU PAGES ---
  
  // Filter out any non-veg items since the public menu is purely veg
  const vegItems = menuItems.filter(item => item.dietaryPreference?.toLowerCase() !== 'non-veg');
  
  const groupByCategory = (items: any[]) => {
    return items.reduce((acc: any, item: any) => {
      const cat = item.category || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});
  };

  const vegGroups = groupByCategory(vegItems);

  let lastTableY = 10;

  const drawPageBackground = () => {
    doc.setFillColor(253, 251, 247); // Soft Cream
    doc.rect(0, 0, pageWidth, pageHeight, 'F');
    // Subtle border
    doc.setDrawColor(210, 195, 175);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'D');
  };

  const printCategory = (title: string, group: any[]) => {
    if (group.length === 0) return;
    
    const titleColor = [184, 140, 81]; // Muted Gold
    const textColor = [44, 51, 51]; // Dark Charcoal
    const priceColor = [184, 140, 81]; // Gold

    // Draw Category Title Manually
    if (lastTableY > pageHeight - 40) {
      doc.addPage();
      drawPageBackground();
      lastTableY = 20;
    } else {
      lastTableY += 10;
    }

    doc.setFontSize(14);
    doc.setTextColor(titleColor[0], titleColor[1], titleColor[2]);
    doc.setFont('helvetica', 'bold');
    
    // Convert title to uppercase for elegant look
    const displayTitle = title.toUpperCase();
    doc.text(displayTitle, pageWidth / 2, lastTableY, { align: 'center' });
    
    // Draw a small decorative dot under the title
    doc.setFontSize(8);
    doc.text('◆', pageWidth / 2, lastTableY + 4, { align: 'center' });
    
    lastTableY += 10;

    if (title.toLowerCase().trim() === 'indian cuisine') {
      const half = Math.ceil(group.length / 2);
      const col1 = group.slice(0, half);
      const col2 = group.slice(half);

      const body = [];
      for (let i = 0; i < half; i++) {
        const item1 = col1[i];
        const item2 = col2[i];

        const formatPrice = (item: any) => {
          if (!item) return '';
          if (item.hasHalfPortion && item.halfPrice) return `${item.halfPrice}H/${item.price}F`;
          return `${item.price}`;
        };

        const formatName = (item: any) => {
          if (!item) return '';
          let n = item.name.toUpperCase();
          if (item.hasButterOption && item.butterPrice) n += `\n(+Butter: Rs ${item.butterPrice})`;
          return n;
        };

        body.push([
          formatName(item1), formatPrice(item1),
          formatName(item2), formatPrice(item2)
        ]);
      }

      autoTable(doc, {
        body: body,
        startY: lastTableY,
        theme: 'plain',
        pageBreak: 'avoid',
        showHead: 'never',
        bodyStyles: {
          fontSize: 10,
          cellPadding: { top: 4, bottom: 4, left: 8, right: 8 },
          textColor: textColor as [number, number, number]
        },
        columnStyles: {
          0: { cellWidth: 'auto', fontStyle: 'bold' },
          1: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: priceColor as [number, number, number] },
          2: { cellWidth: 'auto', fontStyle: 'bold' },
          3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: priceColor as [number, number, number] }
        },
        margin: { top: 20, bottom: 30, left: 15, right: 15 },
        didDrawPage: (data: any) => {
          if (data.cursor && data.cursor.y) lastTableY = data.cursor.y;
        }
      });
      return;
    }

    const body = group.map((item: any) => {
      let priceStr = `${item.price}`;
      if (item.hasHalfPortion && item.halfPrice) {
        priceStr = `${item.halfPrice}H/${item.price}F`;
      }
      
      let nameStr = item.name.toUpperCase();
      if (item.hasButterOption && item.butterPrice) nameStr += `\n(+ Butter: Rs ${item.butterPrice})`;
      
      return [
        nameStr,
        priceStr
      ];
    });

    autoTable(doc, {
      body: body,
      startY: lastTableY,
      theme: 'plain',
      pageBreak: 'avoid',
      showHead: 'never',
      bodyStyles: {
        fontSize: 11,
        cellPadding: { top: 6, bottom: 6, left: 10, right: 10 },
        textColor: textColor as [number, number, number]
      },
      columnStyles: {
        0: { cellWidth: 'auto', fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold', textColor: priceColor as [number, number, number] }
      },
      margin: { top: 20, bottom: 30, left: 20, right: 20 },
      didDrawPage: (data: any) => {
        if (data.cursor && data.cursor.y) {
          lastTableY = data.cursor.y;
        }
      }
    });
  };

  doc.addPage();
  drawPageBackground();
  lastTableY = 20;

  Object.keys(vegGroups).sort().forEach(cat => {
    printCategory(cat, vegGroups[cat]);
  });

  // --- LAST PAGE: CLOSING ---
  doc.addPage();
  drawPageBackground();
  
  const finalTitleColor = [184, 140, 81]; // Gold
  const finalTextColor = [44, 51, 51];
  
  doc.setFontSize(28);
  doc.setTextColor(finalTitleColor[0], finalTitleColor[1], finalTitleColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('THANK YOU', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(finalTextColor[0], finalTextColor[1], finalTextColor[2]);
  doc.setFont('helvetica', 'italic');
  doc.text('Harjinder Tourist Dhaba', pageWidth / 2, pageHeight / 2, { align: 'center' });
  doc.text('Your trust is our greatest reward.', pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });

  // --- ADD FOOTERS TO ALL MIDDLE PAGES ---
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 2; i < totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(184, 140, 81); // Gold
    doc.text('MILK FOR BABY IS ABSOLUTELY FREE!', pageWidth / 2, pageHeight - 12, { align: 'center' });
  }

  // --- SAVE THE PDF ---
  doc.save('Harjinder_Tourist_Dhaba_Menu.pdf');
};
