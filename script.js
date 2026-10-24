// --- VARSAYILAN ÜRÜN LİSTESİ (V29 - ÖZEL ŞABLON ENTEGRASYONU) ---
const defaultProductsData = {
    "8mm Kollu Çıtalı Sistem Katlanır Cam Balkon": {
        priceCard: 149, 
        priceCash: 122.5,
        img: "1",
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 185, priceCash: 165,
        img: "1", 
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 210, priceCash: 185,
        img: "2",
        video: "https://www.instagram.com/reel/Cj7YXuLK2aD/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 265, priceCash: 235,
        img: "4",
        video: "https://www.instagram.com/reel/DOI_7MvCNjO/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Temizlenebilir Giyotin": {
        priceCard: 290, priceCash: 255,
        img: "3",
        video: "https://www.instagram.com/reel/Ch1eC1wjgeL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Sürme Sistem Cam Balkon": {
        priceCard: 210, priceCash: 185,
        img: "5",
        video: "https://www.instagram.com/reel/CbJE-S_q2F2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
};

const STORAGE_KEY = 'myProductsV12'; 

document.addEventListener('DOMContentLoaded', function() {
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const customerNameInput = document.getElementById('customerName');
    const salesChannelInput = document.getElementById('salesChannel');
    const productSelect = document.getElementById('productSelect');
    
    let paymentTypeSelect = document.getElementById('paymentType');
    if (!paymentTypeSelect && productSelect) {
        paymentTypeSelect = document.createElement('select');
        paymentTypeSelect.id = 'paymentType';
        paymentTypeSelect.className = productSelect.className;
        paymentTypeSelect.style.marginTop = '10px';
        paymentTypeSelect.style.fontWeight = 'bold';
        paymentTypeSelect.innerHTML = `
            <option value="card">💳 Kredi Kartı Fiyatı (5 Taksit)</option>
            <option value="cash">💵 Nakit Fiyatı (İndirimli)</option>
        `;
        productSelect.parentNode.insertBefore(paymentTypeSelect, productSelect.nextSibling);
    }
    
    const widthContainer = document.getElementById('width-container');
    const addWidthBtn = document.getElementById('addWidthBtn');
    const resetInputsBtn = document.getElementById('resetInputsBtn');
    const heightInput = document.getElementById('height');
    
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

    const newProductName = document.getElementById('newProductName');
    const newProductImage = document.getElementById('newProductImage');
    const newProductVideo = document.getElementById('newProductVideo');
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    let lastCalculation = null;

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
        products[name] = { priceCard: price, priceCash: price, img: imgName, video: videoLink };
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
            const pCard = data.priceCard || data.price;
            const pCash = data.priceCash || data.price;
            option1.textContent = `${name} (Kart: ${pCard}$ | Nakit: ${pCash}$)`;
            productSelect.appendChild(option1);
            
            let option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            deleteSelect.appendChild(option2);
        }

        let glassOption = document.createElement('option');
        glassOption.value = "GLASS_BALCONY_VARIANTS";
        glassOption.textContent = "✨ CAM BALKON ÇEŞİTLERİ (Karşılaştırmalı) ✨";
        glassOption.style.fontWeight = "bold";
        glassOption.style.color = "#2980b9"; 
        productSelect.appendChild(glassOption);

        let multiOption = document.createElement('option');
        multiOption.value = "MULTI_CALCULATION";
        multiOption.textContent = "🚀 TÜM SİSTEMLER (Giyotin Dahil Liste) 🚀";
        multiOption.style.fontWeight = "bold";
        multiOption.style.color = "#d35400"; 
        productSelect.appendChild(multiOption);
    }

    function addToReport(customer, channel, product, area, price) {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        reports.push({
            date: new Date().toLocaleString('tr-TR'),
            customer: customer || "İsimsiz Müşteri",
            channel: channel,
            product: product,
            area: area,
            price: price
        });
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    }

    downloadReportBtn.addEventListener('click', () => {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        if (reports.length === 0) { alert("Rapor yok."); return; }
        let csvContent = "Tarih,Musteri Adi,Kanal,Urun,m2,Fiyat\n";
        reports.forEach(row => {
            csvContent += `"${row.date}","${row.customer}","${row.channel}","${row.product}","${row.area}","${row.price}"\n`;
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

        return { pricingArea: totalPricingArea, pieces: totalPieces };
    }

    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        const selectedValue = productSelect.value;
        const paymentType = paymentTypeSelect ? paymentTypeSelect.value : 'card';
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

        if (selectedValue === "GLASS_BALCONY_VARIANTS") {
            let allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProductsData;
            let multiResults = [];

            const targetProducts = [
                "8mm Kollu Çıtalı Sistem Katlanır Cam Balkon",
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

                    let activePrice = (paymentType === 'cash') ? (pData.priceCash || pData.priceCard) : (pData.priceCard || pData.price);
                    let rawTotal = (pricingArea * activePrice) * rate;
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
            detailInfo.innerHTML = `Alan: ${realArea.toFixed(2)} m² <br>Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}<br><br> ${htmlList}`;
            
            lastCalculation = {
                isMulti: true,
                paymentType: paymentType,
                area: realArea.toFixed(2),
                multiResults: multiResults,
                extraName: extraName,
                extraPrice: extraPrice,
                details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
            };

            reportProductName = "Cam Balkon Çeşitleri";
            if(extraName) reportProductName += ` + ${extraName}`;
            reportPrice = paymentType === 'cash' ? "Fiyat Listesi (Nakit)" : "Fiyat Listesi (Kart)";
        }
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

                let activePrice = (paymentType === 'cash') ? (pData.priceCash || pData.priceCard) : (pData.priceCard || pData.price);
                let rawTotal = (pricingArea * activePrice) * rate;
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
            detailInfo.innerHTML = `Alan: ${realArea.toFixed(2)} m² <br>Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}<br><br> ${htmlList}`;
            
            lastCalculation = {
                isMulti: true,
                paymentType: paymentType,
                area: realArea.toFixed(2),
                multiResults: multiResults,
                extraName: extraName,
                extraPrice: extraPrice,
                details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
            };

            reportProductName = "Tüm Sistemler (Cam Balkon & Giyotin)";
            if(extraName) reportProductName += ` + ${extraName}`;
            reportPrice = paymentType === 'cash' ? "Fiyat Listesi (Nakit)" : "Fiyat Listesi (Kart)";
        } 
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

            let activePrice = (paymentType === 'cash') ? (selectedData.priceCash || selectedData.priceCard) : (selectedData.priceCard || selectedData.price);
            let rawProductTotalTL = (pricingArea * activePrice) * rate;
            
            const roundedProductTotalTL = smartRound(rawProductTotalTL);
            const grandTotalTL = roundedProductTotalTL + extraPrice;
            
            const formattedProductPrice = fmtTL.format(roundedProductTotalTL);
            const formattedExtraPrice = fmtTL.format(extraPrice);
            const formattedGrandTotal = fmtTL.format(grandTotalTL);
            const formattedArea = realArea.toFixed(2);

            resultArea.querySelector('.result-big').textContent = formattedGrandTotal;
            detailInfo.innerHTML = `Alan: ${formattedArea} m² <br> Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'} <br> Ürün: ${formattedProductPrice} + Ek: ${formattedExtraPrice}`;

            lastCalculation = {
                isMulti: false,
                paymentType: paymentType,
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
            reportPrice = formattedGrandTotal + (paymentType === 'cash' ? ' (Nakit)' : ' (Kart)');
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
            const selectedVal = productSelect.value;
            let allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProductsData;

            if (selectedVal === "GLASS_BALCONY_VARIANTS") {
                 let data8mm = allProducts["Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon"];
                 if(data8mm) {
                     videoUrl = data8mm.video;
                     pName = "Cam Balkon Örnek Tanıtımı";
                 }
            }
            else if (lastCalculation && !lastCalculation.isMulti && lastCalculation.productVideo) {
                videoUrl = lastCalculation.productVideo;
                pName = lastCalculation.productName;
            }
            else if (selectedVal && selectedVal !== "MULTI_CALCULATION") {
                 const data = JSON.parse(selectedVal);
                 videoUrl = data.video;
                 pName = data.name;
            }

            if (!videoUrl) {
                 alert("Video paylaşmak için lütfen listeden ürün veya 'Cam Balkon Çeşitleri'ni seçiniz.");
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

    // --- TEKNİK ÇİZİM: ŞABLON KUTUSUNA UYARLANMIŞ ---
    function drawSystemSchema(ctx, boxX, boxY, boxWidth, boxHeight, data) {
        const pName = data.productName.toLowerCase();
        const totalW = data.totalWidthCm;
        const totalH = data.heightCm;
        const parca = data.parcaSayisi;
        const profileColor = '#2c3e50';
        const glassColor = '#eaf2f8';
        const dimColor = '#e74c3c';
        
        const padding = 20; 
        const drawX = boxX + padding;
        const drawY = boxY + padding;
        const drawW = boxWidth - (padding * 2);
        const drawH = boxHeight - (padding * 2);

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
            ctx.font = 'bold 13px "OCR A Extended", monospace';
            ctx.textAlign = 'center';
            if (vertical) {
                ctx.save();
                ctx.translate(x1 - 10, (y1 + y2) / 2);
                ctx.rotate(-Math.PI / 2);
                ctx.fillText(text, 0, 0);
                ctx.restore();
            } else {
                ctx.fillText(text, (x1 + x2) / 2, y1 + 16);
            }
        }

        drawDimensionLine(drawX, drawY + drawH + 8, drawX + drawW, drawY + drawH + 8, `${totalW} cm`);
        drawDimensionLine(drawX - 8, drawY + drawH, drawX - 8, drawY, `${totalH} cm`, true);

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
                ctx.fillRect(currentX, drawY, pieceWidth, 25); 
                const panelH = (drawH - 25) / 3;
                ctx.fillRect(currentX, drawY + 25 + panelH, pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + 25 + (panelH * 2), pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + drawH - 15, pieceWidth, 15);
                ctx.fillStyle = '#7f8c8d';
                ctx.font = '12px "OCR A Extended", monospace';
                ctx.textAlign = 'center';
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
                    ctx.fillRect(currentX + panelWidth - 10, drawY + (drawH/2) - 15, 6, 25);
                }
            }
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, 8, drawH);
            ctx.fillRect(drawX + drawW - 8, drawY, 8, drawH);
        }
    }

    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    // --- YENİ ŞABLON TEMELLİ CANVAS OLUŞTURUCU ---
    async function createCanvasImage() {
        if (!lastCalculation) return null;

        const isCash = lastCalculation.paymentType === 'cash';
        const templateSrc = isCash ? 'sablon-nakit.jpg' : 'sablon-taksit.jpg';

        let bgImage;
        try {
            bgImage = await loadImage(templateSrc);
        } catch (err) {
            alert("Şablon görseli yüklenemedi! Dosya adlarını (sablon-nakit.jpg / sablon-taksit.jpg) kontrol ediniz.");
            return null;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = bgImage.naturalWidth || 595;
        const height = bgImage.naturalHeight || 842;
        canvas.width = width;
        canvas.height = height;

        // 1. Arka plan şablonunu bas
        ctx.drawImage(bgImage, 0, 0, width, height);

        // Oran katsayıları
        const scaleX = width / 595;
        const scaleY = height / 842;

        if (lastCalculation.isMulti) {
            // ÇOKLU LİSTE ŞABLON UYARLAMASI
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(55 * scaleX, 290 * scaleY, 485 * scaleX, 260 * scaleY);
            ctx.strokeStyle = '#0f172a';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(55 * scaleX, 290 * scaleY, 485 * scaleX, 260 * scaleY);

            ctx.fillStyle = '#1e293b';
            ctx.font = `bold ${Math.round(18 * scaleX)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
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

            // 1. Satıra Başlık Yaz
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(14 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.fillText("Cam Balkon Sistem Çeşitleri", 125 * scaleX, 195 * scaleY);

            // Toplam Alan Bilgisi
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(14 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 175 * scaleX, 570 * scaleY);

            // Fiyat Butonu (Lacivert Alanın İçi)
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(28 * scaleX)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText("LİSTELENDİ", width / 2, 655 * scaleY);

        } else {
            // TEKİL ÜRÜN ŞABLON UYARLAMASI

            // 1. İş Tanımı Tablosu 1. Satır
            ctx.fillStyle = '#0f172a';
            let titleFontSize = 13 * scaleX;
            if (lastCalculation.productName.length > 40) titleFontSize = 11 * scaleX;
            ctx.font = `bold ${Math.round(titleFontSize)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(lastCalculation.productName, 125 * scaleX, 195 * scaleY);

            // 2. Teknik Çizim Alanı
            const boxX = 55 * scaleX;
            const boxY = 300 * scaleY;
            const boxW = 485 * scaleX;
            const boxH = 245 * scaleY;

            drawSystemSchema(ctx, boxX, boxY, boxW, boxH, lastCalculation);

            // 3. Toplam Alan Bilgisi
            ctx.fillStyle = '#0f172a';
            ctx.font = `bold ${Math.round(14 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 175 * scaleX, 570 * scaleY);

            // 4. Fiyat (Lacivert Oval Alanın İçi)
            ctx.fillStyle = '#ffffff';
            let priceFontSize = 40 * scaleX;
            if (lastCalculation.grandTotalStr.length > 10) priceFontSize = 34 * scaleX;
            ctx.font = `bold ${Math.round(priceFontSize)}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(lastCalculation.grandTotalStr, width / 2, 655 * scaleY);

            // Ek Malzeme Bildirimi Varsa Küçük Not
            if (lastCalculation.extraPrice > 0) {
                ctx.fillStyle = '#e67e22';
                ctx.font = `italic ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'center';
                ctx.fillText(`* Fiyata ${lastCalculation.extraName} bedeli dahildir.`, width / 2, 700 * scaleY);
            }
        }

        return canvas;
    }

    if(downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            let fileName = lastCalculation.isMulti ? "Fiyat_Listesi.jpg" : `Teklif-${lastCalculation.productName.replace(/ /g,"-")}.jpg`;
            const link = document.createElement('a');
            link.download = fileName;
            link.href = canvas.toDataURL('image/jpeg', 0.95);
            link.click();
        });
    }

    if(shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            canvas.toBlob(async (blob) => {
                const file = new File([blob], `Teklif.png`, { type: 'image/png' });
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
            }, 'image/png', 1.0);
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
