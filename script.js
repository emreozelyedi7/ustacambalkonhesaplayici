// --- TEKNİK ÇİZİM: ŞABLON KUTUSUNA MİLİMETRİK OTURTULMUŞ ---
    function drawSystemSchema(ctx, boxX, boxY, boxWidth, boxHeight, data) {
        const pName = data.productName.toLowerCase();
        const totalW = data.totalWidthCm;
        const totalH = data.heightCm;
        const parca = data.parcaSayisi;
        const profileColor = '#2c3e50';
        const glassColor = '#eaf2f8';
        const dimColor = '#e74c3c';
        
        // Kutunun içine taşmaması için güvenli iç boşluklar
        const padLeft = 45; 
        const padRight = 20;
        const padTop = 15;
        const padBottom = 30;

        const drawX = boxX + padLeft;
        const drawY = boxY + padTop;
        const drawW = boxWidth - (padLeft + padRight);
        const drawH = boxHeight - (padTop + padBottom);

        function drawDimensionLine(x1, y1, x2, y2, text, vertical = false) {
            ctx.strokeStyle = dimColor;
            ctx.fillStyle = dimColor;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath(); ctx.arc(x1, y1, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y2, 2.5, 0, Math.PI*2); ctx.fill();
            ctx.font = 'bold 12px "OCR A Extended", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if (vertical) {
                ctx.save();
                ctx.translate(x1 - 12, (y1 + y2) / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(text, (x1 + x2) / 2, y1 + 14);
            }
        }

        // Ölçü Çizgileri (Kutunun içinde kalacak şekilde)
        drawDimensionLine(drawX, drawY + drawH + 8, drawX + drawW, drawY + drawH + 8, `${totalW} cm`);
        drawDimensionLine(drawX - 10, drawY + drawH, drawX - 10, drawY, `${totalH} cm`, true);

        if (pName.includes("giyotin")) {
            const pieceWidth = drawW / parca;
            const profileThick = 4;
            for (let i = 0; i < parca; i++) {
                const currentX = drawX + (i * pieceWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX, drawY, pieceWidth, drawH);
                ctx.fillStyle = profileColor;
                ctx.fillRect(currentX, drawY, profileThick, drawH);
                ctx.fillRect(currentX + pieceWidth - profileThick, drawY, profileThick, drawH);
                ctx.fillRect(currentX, drawY, pieceWidth, 24); 
                const panelH = (drawH - 24) / 3;
                ctx.fillRect(currentX, drawY + 24 + panelH, pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + 24 + (panelH * 2), pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + drawH - 16, pieceWidth, 16);
                ctx.fillStyle = '#555555';
                ctx.font = 'bold 11px "OCR A Extended", monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("Modül " + (i+1), currentX + (pieceWidth/2), drawY + drawH/2);
            }
        } else {
            let panelCount = Math.ceil(totalW / 65);
            if (panelCount < 2) panelCount = 2;
            const panelWidth = drawW / panelCount;
            const profileThick = 3;
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, drawW, 14);
            ctx.fillRect(drawX, drawY + drawH - 14, drawW, 14);
            for (let i = 0; i < panelCount; i++) {
                const currentX = drawX + (i * panelWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX + profileThick, drawY + 14, panelWidth - (profileThick*2), drawH - 28);
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(currentX, drawY + 14, profileThick, drawH - 28);
                ctx.fillRect(currentX + panelWidth - profileThick, drawY + 14, profileThick, drawH - 28);
                if (i === 0) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(currentX + panelWidth - 8, drawY + (drawH/2) - 15, 6, 25);
                }
            }
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, 8, drawH);
            ctx.fillRect(drawX + drawW - 8, drawY, 8, drawH);
        }
    }

    // --- ŞABLON UYUMLU KUSURSUZ CANVAS OLUŞTURUCU ---
    async function createCanvasImage() {
        if (!lastCalculation) return null;

        // Fontların belleğe yüklendiğini garanti et
        try {
            await document.fonts.load('bold 40px "Dela Gothic One"');
            await document.fonts.load('bold 14px "OCR A Extended"');
        } catch(e) {}

        const isCash = lastCalculation.paymentType === 'cash';
        const templateSrc = isCash ? 'sablon-nakit.jpg' : 'sablon-taksit.jpg';

        let bgImage;
        try {
            bgImage = await loadImage(templateSrc);
        } catch (err) {
            alert("Şablon görseli bulunamadı! Dosya isimlerini kontrol edin.");
            return null;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = bgImage.naturalWidth;
        const height = bgImage.naturalHeight;
        canvas.width = width;
        canvas.height = height;

        // 1. Arka plan şablonunu bas
        ctx.drawImage(bgImage, 0, 0, width, height);

        const scaleX = width / 595;
        const scaleY = height / 842;

        if (lastCalculation.isMulti) {
            // ÇOKLU LİSTE
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(55 * scaleX, 290 * scaleY, 485 * scaleX, 260 * scaleY);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(55 * scaleX, 290 * scaleY, 485 * scaleX, 260 * scaleY);

            ctx.fillStyle = '#1e293b';
            ctx.font = `bold ${Math.round(18 * scaleX)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText("FİYAT TEKLİF LİSTESİ", width / 2, 320 * scaleY);

            let startY = 350 * scaleY;
            lastCalculation.multiResults.forEach(item => {
                ctx.fillStyle = '#334155';
                ctx.font = `bold ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'left';
                let shortName = item.name.replace("Progold ", "").substring(0, 32);
                ctx.fillText(shortName, 65 * scaleX, startY);

                ctx.fillStyle = '#0f172a';
                ctx.font = `bold ${Math.round(12 * scaleX)}px "Dela Gothic One", sans-serif`;
                ctx.textAlign = 'right';
                ctx.fillText(item.formattedPrice, (width - 65 * scaleX), startY);
                startY += 30 * scaleY;
            });

            // 1. Satır: Ürün Grubu
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(13 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText("Cam Balkon Sistem Çeşitleri", 125 * scaleX, 194 * scaleY);

            // Toplam Alan
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(13 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 175 * scaleX, 570 * scaleY);

            // Lacivert Kutu İçi
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(28 * scaleX)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("LİSTELENDİ", width / 2, 642 * scaleY);

        } else {
            // TEKİL ÜRÜN

            // 1. SATIR 1 - İŞ TANIMI (1'in hizası: 194px)
            ctx.fillStyle = '#0f172a';
            let titleFontSize = 13 * scaleX;
            if (lastCalculation.productName.length > 36) titleFontSize = 11.5 * scaleX;
            ctx.font = `bold ${Math.round(titleFontSize)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(lastCalculation.productName, 125 * scaleX, 194 * scaleY);

            // 2. TEMSİLİ SİSTEM ÇİZİMİ KUTUSU İÇİ (yazının altına 310'dan başlar)
            const boxX = 55 * scaleX;
            const boxY = 308 * scaleY;
            const boxW = 485 * scaleX;
            const boxH = 242 * scaleY;

            drawSystemSchema(ctx, boxX, boxY, boxW, boxH, lastCalculation);

            // 3. TOPLAM ALAN (Şablondaki "Toplam Alan:" yazısının tam sağı)
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(12.5 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 170 * scaleX, 570 * scaleY);

            // 4. FİYAT (Lacivert Kutunun Tam Ortası)
            ctx.fillStyle = '#ffffff';
            let priceFontSize = 36 * scaleX;
            if (lastCalculation.grandTotalStr.length > 10) priceFontSize = 32 * scaleX;
            ctx.font = `bold ${Math.round(priceFontSize)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // Fiyatın lacivert butonun dikey ortasına oturması için 642px
            ctx.fillText(lastCalculation.grandTotalStr, width / 2, 642 * scaleY);

            // Ek Malzeme Bildirimi Varsa Altına Küçük Not
            if (lastCalculation.extraPrice > 0) {
                ctx.fillStyle = '#e67e22';
                ctx.font = `italic ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'alphabetic';
                ctx.fillText(`* Fiyata ${lastCalculation.extraName} bedeli dahildir.`, width / 2, 700 * scaleY);
            }
        }

        return canvas;
    }
