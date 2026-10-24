// --- VARSAYILAN ÜRÜN LİSTESİ (V30 - MİLİMETRİK ŞABLON HİZALAMA) ---
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

    function formatCanvasPrice(num) {
        return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(num) + ' TL';
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
                        formattedPrice: formatCanvasPrice(roundedTotal)
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
                multiTitle: "Cam Balkon Sistem Çeşitleri",
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
                    formattedPrice: formatCanvasPrice(roundedTotal)
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
                multiTitle: "Tüm Cam Balkon & Giyotin Sistemleri",
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
            const canvasPriceText = formatCanvasPrice(grandTotalTL);
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
                canvasPriceStr: canvasPriceText,
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

    // --- TEKNİK ÇİZİM: TÜM ÖLÇÜLER ORANSAL (TAŞMA SIFIR) ---
    function drawSystemSchema(ctx, scaleX, scaleY, data) {
        const pName = data.productName.toLowerCase();
        const totalW = data.totalWidthCm;
        const totalH = data.heightCm;
        const parca = data.parcaSayisi;
        const profileColor = '#2c3e50';
        const glassColor = '#eaf2f8';
        const dimColor = '#e74c3c';

        // Şablon dış kutusu: Sol=52.5, Sağ=544, Üst=289, Alt=557 (595x842 bazında)
        // Çizim alanı güvenli iç koordinatları:
        const drawX = 96 * scaleX;
        const drawY = 322 * scaleY;
        const drawW = 426 * scaleX; // Sağ bitiş: 522 * scaleX
        const drawH = 194 * scaleY; // Alt bitiş: 516 * scaleY

        // Kırmızı Ölçü Çizgileri
        ctx.strokeStyle = dimColor;
        ctx.fillStyle = dimColor;
        ctx.lineWidth = 1.6 * scaleX;

        // 1. Yatay Alt Ölçü Çizgisi (Genişlik)
        const dimBottomY = drawY + drawH + (11 * scaleY);
        ctx.beginPath();
        ctx.moveTo(drawX, dimBottomY);
        ctx.lineTo(drawX + drawW, dimBottomY);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(drawX, dimBottomY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(drawX + drawW, dimBottomY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();

        ctx.font = `bold ${Math.round(12 * scaleX)}px "OCR A Extended", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${totalW} cm`, drawX + (drawW / 2), dimBottomY + (13 * scaleY));

        // 2. Dikey Sol Ölçü Çizgisi (Yükseklik - Çerçeveden tamamen ayrıldı)
        const dimLeftX = drawX - (12 * scaleX); // 84 * scaleX
        ctx.beginPath();
        ctx.moveTo(dimLeftX, drawY);
        ctx.lineTo(dimLeftX, drawY + drawH);
        ctx.stroke();
        ctx.beginPath(); ctx.arc(dimLeftX, drawY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(dimLeftX, drawY + drawH, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        // Yazı merkezi: 70 * scaleX (Sol dış çerçeve 52.5 ile çizgi 84'ün tam ortası)
        ctx.translate(dimLeftX - (14 * scaleX), drawY + (drawH / 2));
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(`${totalH} cm`, 0, 0);
        ctx.restore();

        // Sistem Gövdesi Çizimi
        if (pName.includes("giyotin")) {
            const pieceWidth = drawW / parca;
            const profileThick = 4 * scaleX;
            const motorBoxH = 22 * scaleY;
            const bottomRailH = 14 * scaleY;

            for (let i = 0; i < parca; i++) {
                const currentX = drawX + (i * pieceWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX, drawY, pieceWidth, drawH);

                ctx.fillStyle = profileColor;
                ctx.fillRect(currentX, drawY, profileThick, drawH);
                ctx.fillRect(currentX + pieceWidth - profileThick, drawY, profileThick, drawH);
                ctx.fillRect(currentX, drawY, pieceWidth, motorBoxH); 

                const panelH = (drawH - motorBoxH) / 3;
                ctx.fillRect(currentX, drawY + motorBoxH + panelH, pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + motorBoxH + (panelH * 2), pieceWidth, profileThick);
                ctx.fillRect(currentX, drawY + drawH - bottomRailH, pieceWidth, bottomRailH);

                ctx.fillStyle = '#64748b';
                ctx.font = `bold ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText("Modül " + (i + 1), currentX + (pieceWidth / 2), drawY + motorBoxH + panelH + (panelH / 2));
            }
        } else {
            let panelCount = Math.ceil(totalW / 65);
            if (panelCount < 2) panelCount = 2;
            const panelWidth = drawW / panelCount;
            const profileThick = 3 * scaleX;
            const railH = 13 * scaleY;

            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, drawW, railH);
            ctx.fillRect(drawX, drawY + drawH - railH, drawW, railH);

            for (let i = 0; i < panelCount; i++) {
                const currentX = drawX + (i * panelWidth);
                ctx.fillStyle = glassColor;
                ctx.fillRect(currentX + profileThick, drawY + railH, panelWidth - (profileThick * 2), drawH - (railH * 2));

                ctx.fillStyle = '#bdc3c7';
                ctx.fillRect(currentX, drawY + railH, profileThick, drawH - (railH * 2));
                ctx.fillRect(currentX + panelWidth - profileThick, drawY + railH, profileThick, drawH - (railH * 2));

                if (i === 0) {
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(currentX + panelWidth - (9 * scaleX), drawY + (drawH / 2) - (12 * scaleY), 5 * scaleX, 24 * scaleY);
                }
            }
            ctx.fillStyle = profileColor;
            ctx.fillRect(drawX, drawY, 7 * scaleX, drawH);
            ctx.fillRect(drawX + drawW - (7 * scaleX), drawY, 7 * scaleX, drawH);
        }
    }

    function fitSingleLineText(ctx, text, maxWidth, initialSize, minSize, fontFamily) {
        let size = initialSize;
        ctx.font = `bold ${Math.round(size)}px ${fontFamily}`;
        while (ctx.measureText(text).width > maxWidth && size > minSize) {
            size -= 0.5;
            ctx.font = `bold ${Math.round(size)}px ${fontFamily}`;
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

    // --- ŞABLON TEMELLİ MİLİMETRİK CANVAS OLUŞTURUCU ---
    async function createCanvasImage() {
        if (!lastCalculation) return null;

        try {
            await document.fonts.ready;
            await document.fonts.load('40px "Dela Gothic One"');
        } catch(e) {}

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

        const scaleX = width / 595;
        const scaleY = height / 842;

        if (lastCalculation.isMulti) {
            // --- ÇOKLU SİSTEM LİSTESİ ---

            // 1. Satır (Adet: 1 karşısı): y = 164 * scaleY
            ctx.fillStyle = '#1c2649';
            fitSingleLineText(ctx, lastCalculation.multiTitle || "Çoklu Sistem Fiyat Listesi", 410 * scaleX, 13 * scaleX, 9 * scaleX, '"OCR A Extended", monospace');
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(lastCalculation.multiTitle || "Çoklu Sistem Fiyat Listesi", 125 * scaleX, 164 * scaleY);

            // Temsili Sistem Çizimi yazısını temizle ve şablon kutusunun içine listeyi bas
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(56 * scaleX, 292 * scaleY, 483 * scaleX, 260 * scaleY);

            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(16 * scaleX)}px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("ALTERNATİF SİSTEM FİYAT LİSTESİ", width / 2, 316 * scaleY);

            ctx.beginPath();
            ctx.moveTo(70 * scaleX, 332 * scaleY);
            ctx.lineTo(525 * scaleX, 332 * scaleY);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 1 * scaleX;
            ctx.stroke();

            let startY = 356 * scaleY;
            const rowStep = lastCalculation.multiResults.length > 4 ? 38 * scaleY : 44 * scaleY;

            lastCalculation.multiResults.forEach(item => {
                ctx.fillStyle = '#1e293b';
                fitSingleLineText(ctx, item.name, 315 * scaleX, 11.5 * scaleX, 8.5 * scaleX, '"OCR A Extended", monospace');
                ctx.textAlign = 'left';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.name, 68 * scaleX, startY);

                ctx.fillStyle = '#1c2649';
                ctx.font = `400 ${Math.round(14 * scaleX)}px "Dela Gothic One", sans-serif`;
                ctx.textAlign = 'right';
                ctx.textBaseline = 'middle';
                ctx.fillText(item.formattedPrice, 528 * scaleX, startY);

                ctx.beginPath();
                ctx.moveTo(68 * scaleX, startY + (rowStep / 2));
                ctx.lineTo(528 * scaleX, startY + (rowStep / 2));
                ctx.strokeStyle = '#f1f5f9';
                ctx.lineWidth = 1 * scaleX;
                ctx.stroke();

                startY += rowStep;
            });

            // Toplam Alan (Şablondaki "Toplam Alan:" yazısının tam taban hizası: 577.5 * scaleY)
            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(12.5 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 168 * scaleX, 577.5 * scaleY);

            // Lacivert Fiyat Kutusu İçi
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(24 * scaleX)}px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText("SEÇENEKLİ TEKLİF", width / 2, 636 * scaleY);

            if (lastCalculation.extraPrice > 0) {
                ctx.fillStyle = '#d97706';
                ctx.font = `italic bold ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`* Fiyatlara "${lastCalculation.extraName}" bedeli dahildir.`, width / 2, 712 * scaleY);
            }

        } else {
            // --- TEKİL ÜRÜN ---

            // 1. İŞ TANIMI 1. SATIR (Tam 1 numaranın karşısı: y = 164 * scaleY)
            ctx.fillStyle = '#1c2649';
            fitSingleLineText(ctx, lastCalculation.productName, 412 * scaleX, 13 * scaleX, 8.5 * scaleX, '"OCR A Extended", monospace');
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(lastCalculation.productName, 125 * scaleX, 164 * scaleY);

            // 2. TEMSİLİ SİSTEM ÇİZİMİ (Taşmasız oransal yerleşim)
            drawSystemSchema(ctx, scaleX, scaleY, lastCalculation);

            // 3. TOPLAM ALAN (Şablondaki "Toplam Alan:" yazısının tam hizası: y = 577.5 * scaleY)
            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(12.5 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 168 * scaleX, 577.5 * scaleY);

            // 4. FİYAT (Lacivert Kutunun İçi - "297.450 TL" formatı ve Dela Gothic One fontu)
            ctx.fillStyle = '#ffffff';
            let priceText = lastCalculation.canvasPriceStr || lastCalculation.grandTotalStr.replace('₺', '').trim() + ' TL';
            fitSingleLineText(ctx, priceText, 380 * scaleX, 34 * scaleX, 22 * scaleX, '"Dela Gothic One", sans-serif');
            // Dela Gothic One normal ağırlıkta (400) kendi kalın yapısını en net şekilde verir
            const finalPriceSize = parseInt(ctx.font.match(/\d+/)[0], 10);
            ctx.font = `400 ${finalPriceSize}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(priceText, width / 2, 636 * scaleY);

            // Ek Malzeme Bildirimi Varsa Kutu Altındaki Boşluğa Yaz
            if (lastCalculation.extraPrice > 0) {
                ctx.fillStyle = '#d97706';
                ctx.font = `italic bold ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`* Fiyata "${lastCalculation.extraName}" bedeli dahildir.`, width / 2, 712 * scaleY);
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
