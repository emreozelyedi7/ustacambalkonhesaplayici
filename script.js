// --- VARSAYILAN ÜRÜN LİSTESİ (V22 - GİYOTİN VİDEO GÜNCEL) ---
const defaultProductsData = {
    "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        price: 150, 
        img: "1", 
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        price: 175, 
        img: "2",
        video: "https://www.instagram.com/reel/Cj7YXuLK2aD/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        price: 220, 
        img: "4",
        video: "https://www.instagram.com/reel/DOI_7MvCNjO/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Temizlenebilir Giyotin": {
        price: 250, 
        img: "3",
        // YENİ VİDEO LİNKİ:
        video: "https://www.instagram.com/reel/Ch1eC1wjgeL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Sürme Sistem Cam Balkon": {
        price: 175, 
        img: "5",
        video: "https://www.instagram.com/reel/CbJE-S_q2F2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
};

// SÜRÜM GÜNCELLENDİ: myProductsV6 (Yeni video için zorunlu)
const STORAGE_KEY = 'myProductsV6'; 

document.addEventListener('DOMContentLoaded', function() {
    // ELEMENTLER
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const customerNameInput = document.getElementById('customerName');
    const salesChannelInput = document.getElementById('salesChannel');
    const productSelect = document.getElementById('productSelect');
    
    const widthContainer = document.getElementById('width-container');
    const addWidthBtn = document.getElementById('addWidthBtn');
    const resetInputsBtn = document.getElementById('resetInputsBtn');
    
    const heightInput = document.getElementById('height');
    
    // EK MALZEME INPUTLARI
    const extraItemNameInput = document.getElementById('extraItemName');
    const extraItemPriceInput = document.getElementById('extraItemPrice');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const shareBtn = document.getElementById('shareBtn');
    const shareVideoBtn = document.getElementById('shareVideoBtn');
    
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    const clearReportBtn = document.getElementById('clearReportBtn');

    const resultArea = document.getElementById('resultArea');
    const detailInfo = document.getElementById('detailInfo');
    const mainLogo = document.getElementById('mainLogo');

    const newProductName = document.getElementById('newProductName');
    const newProductImage = document.getElementById('newProductImage');
    const newProductVideo = document.getElementById('newProductVideo');
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    let lastCalculation = null;

    // --- BAŞLATMA ---
    checkAndLoadDefaults();
    loadRate();
    
    if(shareVideoBtn) shareVideoBtn.style.display = 'block';

    addWidthBtn.addEventListener('click', () => {
        const currentCount = widthContainer.querySelectorAll('.width-input').length;
        const nextCount = currentCount + 1;
        const newInput = document.createElement('input');
        newInput.type = 'number';
        newInput.className = 'width-input';
        newInput.placeholder = `En ${nextCount}`;
        widthContainer.appendChild(newInput);
    });

    resetInputsBtn.addEventListener('click', () => {
        if(confirm("Ölçüler temizlensin mi?")) {
            widthContainer.innerHTML = '<input type="number" class="width-input" placeholder="En 1">';
            heightInput.value = '';
            customerNameInput.value = '';
            salesChannelInput.value = 'WhatsApp';
            extraItemNameInput.value = '';
            extraItemPriceInput.value = '';
            resultArea.querySelector('.result-big').textContent = '0.00 ₺';
            detailInfo.innerHTML = '';
            downloadBtn.style.display = 'none';
            shareBtn.style.display = 'none';
            lastCalculation = null;
        }
    });

    navCalc.addEventListener('click', () => {
        calcSection.classList.remove('hidden');
        settingsSection.classList.add('hidden');
        navCalc.classList.add('active');
        navSettings.classList.remove('active');
        loadProducts();
    });

    navSettings.addEventListener('click', () => {
        calcSection.classList.add('hidden');
        settingsSection.classList.remove('hidden');
        navCalc.classList.remove('active');
        navSettings.classList.add('active');
    });

    function loadRate() {
        const savedRate = localStorage.getItem('dollarRate');
        if (savedRate) currentRateInput.value = savedRate;
    }

    // --- FİYAT YUVARLAMA (450 / 850 Kuralı) ---
    function smartRound(amount) {
        let integerPart = Math.floor(amount);
        let thousands = Math.floor(integerPart / 1000) * 1000;
        let remainder = integerPart % 1000;
        
        if (remainder <= 500) { 
            return thousands + 450; 
        } else { 
            return thousands + 850; 
        }
    }

    function checkAndLoadDefaults() {
        if (!localStorage.getItem(STORAGE_KEY)) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProductsData));
        }
        loadProducts();
    }

    window.resetDefaultProducts = function() {
        if(confirm("Tüm listeniz silinecek ve varsayılan veriler yüklenecek. Onaylıyor musunuz?")) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProductsData));
            loadProducts();
            alert("Varsayılan ürünler yüklendi!");
        }
    };

    saveProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const imgName = newProductImage.value.trim();
        const videoLink = newProductVideo.value.trim();
        const price = parseFloat(newProductPrice.value);

        if (!name || !imgName || isNaN(price)) { alert("Eksik bilgi girdiniz."); return; }

        let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        products[name] = { price: price, img: imgName, video: videoLink };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(products));

        alert(`${name} kaydedildi!`);
        newProductName.value = ''; newProductImage.value = ''; newProductVideo.value = ''; newProductPrice.value = '';
        loadProducts();
    });

    function loadProducts() {
        let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
        productSelect.innerHTML = '<option value="">Seçiniz...</option>';
        deleteSelect.innerHTML = '<option value="">Seçiniz...</option>';
        
        for (let [name, data] of Object.entries(products)) {
            let option1 = document.createElement('option');
            option1.value = JSON.stringify({ ...data, name: name });
            option1.textContent = `${name} ($${data.price})`;
            productSelect.appendChild(option1);
            
            let option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            deleteSelect.appendChild(option2);
        }

        // 1. Seçenek: CAM BALKON ÇEŞİTLERİ
        let glassOption = document.createElement('option');
        glassOption.value = "GLASS_BALCONY_VARIANTS";
        glassOption.textContent = "✨ CAM BALKON ÇEŞİTLERİ (Karşılaştırmalı) ✨";
        glassOption.style.fontWeight = "bold";
        glassOption.style.color = "#2980b9"; 
        productSelect.appendChild(glassOption);

        // 2. Seçenek: TÜM SİSTEMLER
        let multiOption = document.createElement('option');
        multiOption.value = "MULTI_CALCULATION";
        multiOption.textContent = "🚀 TÜM SİSTEMLER (Giyotin Dahil Liste) 🚀";
        multiOption.style.fontWeight = "bold";
        multiOption.style.color = "#d35400"; 
        productSelect.appendChild(multiOption);
    }

    function addToReport(customer, channel, product, area, price) {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        const newReport = {
            date: new Date().toLocaleString('tr-TR'),
            customer: customer || "İsimsiz Müşteri",
            channel: channel,
            product: product,
            area: area,
            price: price
        };
        reports.push(newReport);
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    }

    downloadReportBtn.addEventListener('click', () => {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        if (reports.length === 0) { alert("Rapor yok."); return; }
        let csvContent = "Tarih,Musteri Adi,Kanal,Urun,m2,Fiyat\n";
        reports.forEach(row => {
            let rowString = `"${row.date}","${row.customer}","${row.channel}","${row.product}","${row.area}","${row.price}"`;
            csvContent += rowString + "\n";
        });
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const today = new Date().toLocaleDateString('tr-TR').replace(/\./g, '-');
        link.setAttribute("href", url);
        link.setAttribute("download", `Gunluk_Rapor_${today}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    clearReportBtn.addEventListener('click', () => {
        if(confirm("Tüm günlük rapor kayıtları silinecek. Emin misiniz?")) {
            localStorage.removeItem('dailyReports');
            alert("Rapor temizlendi.");
        }
    });

    // --- YARDIMCI: GİYOTİN HESAPLAMA (KENAR BAZLI) ---
    function calculateGuillotineLogic(widthList, height) {
        let totalPricingArea = 0;
        let totalPieces = 0;

        widthList.forEach(w => {
            if (w <= 0) return;

            let currentPieces = 1;
            let currentPricingArea = 0;

            if (w > 800) {
                currentPieces = 3;
                let pieceWidth = w / 3;
                let onePieceArea = (pieceWidth * height) / 10000;
                if (onePieceArea < 7) onePieceArea = 7;
                currentPricingArea = onePieceArea * 3;
            } else if (w > 370) {
                currentPieces = 2;
                let halfWidth = w / 2;
                let onePieceArea = (halfWidth * height) / 10000;
                if (onePieceArea < 7) onePieceArea = 7;
                currentPricingArea = onePieceArea * 2;
            } else {
                currentPieces = 1;
                let onePieceArea = (w * height) / 10000;
                if (onePieceArea < 7) onePieceArea = 7;
                currentPricingArea = onePieceArea;
            }

            totalPricingArea += currentPricingArea;
            totalPieces += currentPieces;
        });

        return {
            pricingArea: totalPricingArea,
            pieces: totalPieces
        };
    }

    // --- HESAPLAMA ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        const selectedValue = productSelect.value;
        const custName = customerNameInput.value.trim();
        const channel = salesChannelInput.value;
        const extraName = extraItemNameInput.value.trim();
        const extraPrice = parseFloat(extraItemPriceInput.value) || 0;
        const h = parseFloat(heightInput.value);

        const allWidthInputs = document.querySelectorAll('.width-input');
        let widthList = [];
        let totalWidth = 0;
        allWidthInputs.forEach(input => {
            const val = parseFloat(input.value);
            if (!isNaN(val) && val > 0) {
                widthList.push(val);
                totalWidth += val;
            }
        });

        if (isNaN(rate) || rate <= 0) { alert("Dolar Kuru girin."); return; }
        if (!selectedValue || totalWidth <= 0 || isNaN(h)) {
            alert("Ürün seçin ve ölçüleri girin.");
            return;
        }

        localStorage.setItem('dollarRate', rate);
        let realArea = (totalWidth * h) / 10000;
        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 });

        let reportProductName = "";
        let reportPrice = "";

        // SENARYO 1: CAM BALKON ÇEŞİTLERİ (3 ÜRÜN)
        if (selectedValue === "GLASS_BALCONY_VARIANTS") {
            let allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProductsData;
            let multiResults = [];

            const targetProducts = [
                "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon",
                "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon",
                "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon"
            ];

            for (let [pName, pData] of Object.entries(allProducts)) {
                if (targetProducts.includes(pName)) {
                    let pricingArea = realArea;
                    let pricingHeight = h;
                    if (h < 180) {
                        pricingHeight = 180;
                        pricingArea = (totalWidth * pricingHeight) / 10000;
                    } else {
                        pricingArea = realArea;
                    }
                    if (pricingArea < 5) pricingArea = 5;

                    let rawTotal = (pricingArea * pData.price) * rate;
                    let roundedTotal = smartRound(rawTotal) + extraPrice; 

                    multiResults.push({
                        name: pName,
                        totalPrice: roundedTotal,
                        formattedPrice: fmtTL.format(roundedTotal)
                    });
                }
            }

            let htmlList = `<ul style="list-style:none; padding:0;">`;
            multiResults.forEach(item => {
                htmlList += `<li style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <strong>${item.name}</strong><br>
                    <span style="color:#2980b9; font-weight:bold; font-size:1.1em">${item.formattedPrice}</span>
                </li>`;
            });
            htmlList += `</ul>`;

            resultArea.querySelector('.result-big').textContent = "Çeşit Listesi";
            detailInfo.innerHTML = `Alan: ${realArea.toFixed(2)} m² <br><br> ${htmlList}`;
            
            lastCalculation = {
                isMulti: true,
                area: realArea.toFixed(2),
                multiResults: multiResults,
                extraName: extraName,
                extraPrice: extraPrice,
                details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
            };

            reportProductName = "Cam Balkon Çeşitleri (8mm, Isıcam, Jaluzi)";
            if(extraName) reportProductName += ` + ${extraName}`;
            reportPrice = "Fiyat Listesi";
        }
        // SENARYO 2: TÜM SİSTEMLER
        else if (selectedValue === "MULTI_CALCULATION") {
            let allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProductsData;
            let multiResults = [];

            for (let [pName, pData] of Object.entries(allProducts)) {
                if (pName.toLowerCase().includes("sürme")) continue; 

                let pricingArea = 0;
                
                if (pName.toLowerCase().includes("giyotin")) {
                    let gResult = calculateGuillotineLogic(widthList, h);
                    pricingArea = gResult.pricingArea;
                } 
                else if (pName.toLowerCase().includes("cam balkon")) {
                    let pricingHeight = h;
                    if (h < 180) {
                        pricingHeight = 180;
                        pricingArea = (totalWidth * pricingHeight) / 10000;
                    } else {
                        pricingArea = realArea;
                    }
                    if (pricingArea < 5) pricingArea = 5;
                }

                let rawTotal = (pricingArea * pData.price) * rate;
                let roundedTotal = smartRound(rawTotal) + extraPrice; 

                multiResults.push({
                    name: pName,
                    totalPrice: roundedTotal,
                    formattedPrice: fmtTL.format(roundedTotal)
                });
            }

            let htmlList = `<ul style="list-style:none; padding:0;">`;
            multiResults.forEach(item => {
                htmlList += `<li style="margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                    <strong>${item.name}</strong><br>
                    <span style="color:#27ae60; font-weight:bold; font-size:1.1em">${item.formattedPrice}</span>
                </li>`;
            });
            htmlList += `</ul>`;

            resultArea.querySelector('.result-big').textContent = "Çoklu Liste";
            detailInfo.innerHTML = `Alan: ${realArea.toFixed(2)} m² <br><br> ${htmlList}`;
            
            lastCalculation = {
                isMulti: true,
                area: realArea.toFixed(2),
                multiResults: multiResults,
                extraName: extraName,
                extraPrice: extraPrice,
                details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
            };

            reportProductName = "Tüm Sistemler (Cam Balkon & Giyotin)";
            if(extraName) reportProductName += ` + ${extraName}`;
            reportPrice = "Fiyat Listesi";

        } 
        // SENARYO 3: TEKİL ÜRÜN
        else {
            let selectedData = JSON.parse(selectedValue);
            
            let pricingArea = 0;
            const productName = selectedData.name.toLowerCase();
            let priceLabel = "Cam Balkon Sistem Bedeli";
            let calculatedParcaSayisi = 1;

            if (productName.includes("giyotin")) {
                let gResult = calculateGuillotineLogic(widthList, h);
                pricingArea = gResult.pricingArea;
                calculatedParcaSayisi = gResult.pieces;
                priceLabel = `${calculatedParcaSayisi} Adet Giyotin Sistem`;

            } else if (productName.includes("cam balkon")) {
                let pricingHeight = h;
                if (h < 180) {
                    pricingHeight = 180;
                    pricingArea = (totalWidth * pricingHeight) / 10000;
                } else {
                    pricingArea = realArea;
                }
                if (pricingArea < 5) pricingArea = 5;
                
                calculatedParcaSayisi = Math.ceil(totalWidth / 65);
                priceLabel = "Cam Balkon Sistem Bedeli";
            } else if (productName.includes("sürme")) {
                let pricingHeight = h;
                if (h < 180) {
                     pricingHeight = 180;
                     pricingArea = (totalWidth * pricingHeight) / 10000;
                } else {
                     pricingArea = realArea;
                }
                if (pricingArea < 5) pricingArea = 5;
            }

            const rawProductTotalTL = (pricingArea * selectedData.price) * rate;
            const roundedProductTotalTL = smartRound(rawProductTotalTL);
            const grandTotalTL = roundedProductTotalTL + extraPrice;
            
            const formattedProductPrice = fmtTL.format(roundedProductTotalTL);
            const formattedExtraPrice = fmtTL.format(extraPrice);
            const formattedGrandTotal = fmtTL.format(grandTotalTL);
            const formattedArea = realArea.toFixed(2);

            resultArea.querySelector('.result-big').textContent = formattedGrandTotal;
            detailInfo.innerHTML = `Alan: ${formattedArea} m² <br> Ürün: ${formattedProductPrice} + Ek: ${formattedExtraPrice}`;

            lastCalculation = {
                isMulti: false,
                productName: selectedData.name,
                productVideo: selectedData.video || "",
                area: formattedArea,
                priceLabel: priceLabel,
                productPriceStr: formattedProductPrice,
                extraName: extraName,
                extraPrice: extraPrice,
                extraPriceStr: formattedExtraPrice,
                grandTotalStr: formattedGrandTotal,
                totalWidthCm: totalWidth,
                heightCm: h,
                parcaSayisi: calculatedParcaSayisi,
                details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
            };

            reportProductName = selectedData.name;
            if(extraName) reportProductName += ` + ${extraName}`;
            reportPrice = formattedGrandTotal;
        }

        const formattedAreaReport = realArea.toFixed(2);
        addToReport(custName, channel, reportProductName, formattedAreaReport, reportPrice);

        if(downloadBtn) downloadBtn.style.display = 'block';
        if(shareBtn) shareBtn.style.display = 'block';
    });

    if(shareVideoBtn) {
        shareVideoBtn.addEventListener('click', async () => {
            let videoUrl = "";
            let pName = "";

            if (lastCalculation && !lastCalculation.isMulti && lastCalculation.productVideo) {
                videoUrl = lastCalculation.productVideo;
                pName = lastCalculation.productName;
            }
            else {
                const selectedVal = productSelect.value;
                if(selectedVal && selectedVal !== "MULTI_CALCULATION" && selectedVal !== "GLASS_BALCONY_VARIANTS") {
                     const data = JSON.parse(selectedVal);
                     videoUrl = data.video;
                     pName = data.name;
                }
            }

            if (!videoUrl) {
                 alert("Video paylaşmak için lütfen listeden tekil bir ürün seçiniz.");
                 return;
            }

            const shareData = {
                title: pName,
                text: `${pName} Tanıtım Videosu:\n${videoUrl}`
            };
            if (navigator.share) {
                try { await navigator.share(shareData); } catch (err) {}
            } else {
                navigator.clipboard.writeText(`${pName} Video: ${videoUrl}`);
                alert("Link kopyalandı.");
            }
        });
    }

    // --- TEKNİK ÇİZİM ---
    function drawSystemSchema(ctx, boxX, boxY, boxWidth, boxHeight, data) {
        const pName = data.productName.toLowerCase();
        const totalW = data.totalWidthCm;
        const totalH = data.heightCm;
        const parca = data.parcaSayisi;
        const profileColor = '#2c3e50';
        const glassColor = '#eaf2f8';
        const dimColor = '#e74c3c';
        
        const padding = 50; 
        const drawX = boxX + padding;
        const drawY = boxY + padding;
        const drawW = boxWidth - (padding * 2);
        const drawH = boxHeight - (padding * 2);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
        
        function drawDimensionLine(x1, y1, x2, y2, text, vertical = false) {
            ctx.strokeStyle = dimColor;
            ctx.fillStyle = dimColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            ctx.beginPath(); ctx.arc(x1, y1, 3, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(x2, y2, 3, 0, Math.PI*2); ctx.fill();
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            if (vertical) {
                ctx.save();
                ctx.translate(x1 - 15, (y1 + y2) / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(text, (x1 + x2) / 2, y1 + 25);
            }
        }

        drawDimensionLine(drawX, drawY + drawH + 15, drawX + drawW, drawY + drawH + 15, `${totalW} cm`);
        drawDimensionLine(drawX - 15, drawY + drawH, drawX - 15, drawY, `${totalH} cm`, true);

        if (pName.includes("giyotin")) {
            const pieceWidth = drawW / parca;
            const profileThick = 6;
            for (let i = 0; i < parca; i++) {
                const currentX = drawX + (i * pieceWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX, drawY, pieceWidth, drawH);
                ctx.fillStyle = profileColor;
                ctx.fillRect(currentX, drawY, profileThick, drawH);
                ctx.fillRect(currentX + pieceWidth - profileThick, drawY, profileThick, drawH);
                ctx.fillRect(currentX, drawY, pieceWidth, 40); 
                const panelH = (drawH - 40) / 3;
                ctx.fillRect(currentX, drawY + 40 + panelH, pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + 40 + (panelH * 2), pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + drawH - 20, pieceWidth, 20);
                ctx.fillStyle = '#7f8c8d';
                ctx.font = '16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText("Sistem " + (i+1), currentX + (pieceWidth/2), drawY + drawH/2);
            }
        } else {
            let panelCount = Math.ceil(totalW / 65);
            if (panelCount < 2) panelCount = 2;
            const panelWidth = drawW / panelCount;
            const profileThick = 4;
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, drawW, 20);
            ctx.fillRect(drawX, drawY + drawH - 20, drawW, 20);
            for (let i = 0; i < panelCount; i++) {
                const currentX = drawX + (i * panelWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX + profileThick, drawY + 20, panelWidth - (profileThick*2), drawH - 40);
                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(currentX, drawY + 20, profileThick, drawH - 40);
                ctx.fillRect(currentX + panelWidth - profileThick, drawY + 20, profileThick, drawH - 40);
                if (i === 0) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(currentX + panelWidth - 15, drawY + (drawH/2) - 20, 10, 40);
                    ctx.beginPath();
                    ctx.arc(currentX + panelWidth - 10, drawY + (drawH/2), 5, 0, Math.PI*2);
                    ctx.fill();
                }
            }
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, 10, drawH);
            ctx.fillRect(drawX + drawW - 10, drawY, 10, drawH);
        }

        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Segoe UI, Arial';
        ctx.textAlign = 'center';
        let schemaLabel = `TEKNİK GÖRÜNÜŞ`;
        ctx.fillText(schemaLabel, boxX + (boxWidth / 2), boxY + boxHeight + 35);
    }

    // --- A4 GÖRSEL OLUŞTURUCU ---
    async function createCanvasImage() {
        if (!lastCalculation) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = 1080;
        const height = 1527;
        canvas.width = width;
        canvas.height = height;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        ctx.textAlign = 'right';
        ctx.fillStyle = '#888888';
        ctx.font = '24px Segoe UI, Arial';
        const today = new Date().toLocaleDateString('tr-TR');
        ctx.fillText(today, width - 40, 50);

        ctx.textAlign = 'center';
        const logoWidth = 500;
        const logoHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * logoWidth;
        const logoX = (width - logoWidth) / 2;
        ctx.drawImage(mainLogo, logoX, 60, logoWidth, logoHeight);

        let currentY = 60 + logoHeight + 40; 
        
        if (lastCalculation.isMulti) {
            ctx.fillStyle = '#333330';
            ctx.font = 'bold 50px Segoe UI, Arial';
            ctx.fillText("FİYAT TEKLİF LİSTESİ", width / 2, currentY);
            currentY += 60;
            
            ctx.font = '30px Segoe UI, Arial';
            ctx.fillStyle = '#666';
            ctx.fillText(`Ölçüler: ${lastCalculation.details} | Toplam Alan: ${lastCalculation.area} m²`, width / 2, currentY);
            currentY += 80;

            ctx.beginPath();
            ctx.moveTo(100, currentY);
            ctx.lineTo(980, currentY);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
            currentY += 60;

            let products = lastCalculation.multiResults;
            
            products.forEach(item => {
                ctx.fillStyle = '#2c3e50';
                ctx.font = 'bold 36px Segoe UI, Arial';
                
                const maxWidthMulti = 900; 
                const words = item.name.split(' ');
                let line = '';
                
                for(let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidthMulti && n > 0) {
                        ctx.fillText(line, width / 2, currentY);
                        line = words[n] + ' ';
                        currentY += 45; 
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, width / 2, currentY);
                currentY += 50;

                ctx.fillStyle = '#27ae60';
                ctx.font = 'bold 44px Segoe UI, Arial';
                ctx.fillText(item.formattedPrice, width / 2, currentY);
                currentY += 40;

                ctx.beginPath();
                ctx.moveTo(300, currentY);
                ctx.lineTo(780, currentY);
                ctx.strokeStyle = '#eee';
                ctx.lineWidth = 1;
                ctx.stroke();
                currentY += 60; 
            });

            if(lastCalculation.extraPrice > 0) {
                currentY += 20;
                ctx.fillStyle = '#e67e22';
                ctx.font = 'italic 30px Segoe UI, Arial';
                ctx.fillText(`Not: Fiyatlara "${lastCalculation.extraName}" bedeli dahildir.`, width / 2, currentY);
            }

        } else {
            ctx.fillStyle = '#333330';
            ctx.font = 'bold 40px Segoe UI, Arial';
            
            let productName = lastCalculation.productName;
            if (lastCalculation.extraName) {
                productName += ` + ${lastCalculation.extraName}`;
            }

            const maxWidth = 950;
            const lineHeight = 50;
            const words = productName.split(' ');
            let line = '';
            
            for(let n = 0; n < words.length; n++) {
                const testLine = line + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    ctx.fillText(line, width / 2, currentY);
                    line = words[n] + ' ';
                    currentY += lineHeight;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line, width / 2, currentY);
            currentY += 50; 

            const boxWidth = 900;
            const boxHeight = 450; 
            const boxX = (width - boxWidth) / 2;
            const boxY = currentY; 
            drawSystemSchema(ctx, boxX, boxY, boxWidth, boxHeight, lastCalculation);
            currentY += boxHeight + 60;

            let detailsY = currentY;
            ctx.beginPath();
            ctx.moveTo(200, detailsY);
            ctx.lineTo(880, detailsY);
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 5;
            ctx.stroke();
            detailsY += 40; 

            ctx.fillStyle = '#666666';
            ctx.font = '40px Segoe UI, Arial';
            ctx.fillText(`Toplam Alan: ${lastCalculation.area} m²  ${lastCalculation.details}`, width / 2, detailsY);
            detailsY += 50; 

            if (lastCalculation.extraPrice > 0) {
                ctx.font = 'bold 35px Segoe UI, Arial';
                ctx.fillStyle = '#555555';
                ctx.fillText(`${lastCalculation.priceLabel}`, width / 2, detailsY);
                detailsY += 50;
                ctx.fillText(`${lastCalculation.extraName}: ${lastCalculation.extraPriceStr}`, width / 2, detailsY);
                detailsY += 80;
                ctx.fillStyle = '#28a745';
                ctx.font = 'bold 100px Segoe UI, Arial';
                ctx.fillText(`TOPLAM: ${lastCalculation.grandTotalStr}`, width / 2, detailsY);
            } else {
                detailsY += 20;
                ctx.font = 'bold 35px Segoe UI, Arial';
                ctx.fillStyle = '#555555';
                ctx.fillText(lastCalculation.priceLabel, width / 2, detailsY);
                detailsY += 100;
                ctx.fillStyle = '#28a745';
                ctx.font = 'bold 100px Segoe UI, Arial';
                ctx.fillText(lastCalculation.grandTotalStr, width / 2, detailsY);
            }
        }

        const footerHeight = 200;
        const footerY = height - footerHeight;
        
        ctx.fillStyle = '#F37021';
        ctx.fillRect(0, footerY, width, footerHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px Segoe UI, Arial';
        ctx.fillText("SİSTEMLERİMİZ 5 YIL GARANTİLİDİR", width / 2, footerY + 80);

        ctx.font = 'bold 34px Segoe UI, Arial';
        ctx.fillText("Tüm kartlara peşin fiyatına 5 taksit fırsatı", width / 2, footerY + 140);

        return canvas;
    }

    if(downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            let fileName = "Teklif.jpg";
            if(lastCalculation.isMulti) {
                fileName = "Fiyat_Listesi.jpg";
            } else {
                fileName = `Teklif-${lastCalculation.productName.replace(/ /g,"-")}.jpg`;
            }
            
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
        });
    }

    if(shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            canvas.toBlob(async (blob) => {
                const file = new File([blob], `Teklif.jpg`, { type: 'image/jpeg' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: 'Fiyat Teklifi',
                            text: 'Detaylı fiyat teklifi ektedir.'
                        });
                    } catch (error) { console.log('Hata', error); }
                } else {
                    alert("Tarayıcı desteklemiyor. 'İndir' butonunu kullanın.");
                }
            }, 'image/jpeg', 0.9);
        });
    }

    deleteProductBtn.addEventListener('click', () => {
        const nameToDelete = deleteSelect.value;
        if (!nameToDelete) return;
        if(confirm(`${nameToDelete} silinsin mi?`)) {
            let products = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
            delete products[nameToDelete];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
            loadProducts();
        }
    });
});