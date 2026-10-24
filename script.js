// --- VARSAYILAN ÜRÜN LİSTESİ (V31 - KARMA TEKLİF & YAN YANA ÇİZİM) ---
const defaultProductsData = {
    "8mm Kollu Çıtalı Sistem Katlanır Cam Balkon": {
        priceCard: 149, priceCash: 122.5, img: "1",
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 185, priceCash: 165, img: "1", 
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 210, priceCash: 185, img: "2",
        video: "https://www.instagram.com/reel/Cj7YXuLK2aD/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": {
        priceCard: 265, priceCash: 235, img: "4",
        video: "https://www.instagram.com/reel/DOI_7MvCNjO/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Temizlenebilir Giyotin": {
        priceCard: 290, priceCash: 255, img: "3",
        video: "https://www.instagram.com/reel/Ch1eC1wjgeL/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Sürme Sistem Cam Balkon": {
        priceCard: 210, priceCash: 185, img: "5",
        video: "https://www.instagram.com/reel/CbJE-S_q2F2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
};

const STORAGE_KEY = 'myProductsV13'; 

document.addEventListener('DOMContentLoaded', function() {
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const customerNameInput = document.getElementById('customerName');
    const salesChannelInput = document.getElementById('salesChannel');
    const globalPaymentType = document.getElementById('globalPaymentType');
    
    const systemsContainer = document.getElementById('systems-container');
    const addSystemBtn = document.getElementById('addSystemBtn');

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

    // Dinamik Sistem Bloğu Yönetimi (Event Delegation)
    systemsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('addWidthBtn')) {
            const block = e.target.closest('.system-block');
            const wContainer = block.querySelector('.width-container');
            const currentCount = wContainer.querySelectorAll('.width-input').length;
            const newInput = document.createElement('input');
            newInput.type = 'number';
            newInput.className = 'width-input';
            newInput.placeholder = `En ${currentCount + 1}`;
            wContainer.appendChild(newInput);
        }
        else if (e.target.classList.contains('resetWidthBtn')) {
            const block = e.target.closest('.system-block');
            const wContainer = block.querySelector('.width-container');
            wContainer.innerHTML = '<input type="number" class="width-input" placeholder="En 1">';
            block.querySelector('.heightInput').value = '';
        }
        else if (e.target.classList.contains('remove-system-btn')) {
            const block = e.target.closest('.system-block');
            block.remove();
            updateSystemTitles();
        }
    });

    addSystemBtn.addEventListener('click', () => {
        const blockCount = systemsContainer.querySelectorAll('.system-block').length;
        if (blockCount >= 4) { alert("En fazla 4 sistem ekleyebilirsiniz."); return; }
        
        const firstBlock = systemsContainer.querySelector('.system-block');
        const newBlock = firstBlock.cloneNode(true);
        
        newBlock.querySelector('.width-container').innerHTML = '<input type="number" class="width-input" placeholder="En 1">';
        newBlock.querySelector('.heightInput').value = '';
        newBlock.querySelector('.productSelect').selectedIndex = 0;
        
        // İlk blok dışındakilere "Sil" butonu ekle
        if (!newBlock.querySelector('.remove-system-btn')) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-system-btn';
            removeBtn.innerHTML = '✖ Kaldır';
            newBlock.appendChild(removeBtn);
        }
        
        systemsContainer.appendChild(newBlock);
        updateSystemTitles();
    });

    function updateSystemTitles() {
        const blocks = systemsContainer.querySelectorAll('.system-block');
        blocks.forEach((block, index) => {
            block.querySelector('.system-title').textContent = `${index + 1}. SİSTEM`;
        });
    }

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
        if (remainder <= 500) { return thousands + 450; } 
        else { return thousands + 850; }
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
        const selects = document.querySelectorAll('.productSelect');
        const deleteSel = document.getElementById('deleteSelect');
        
        let optionsHTML = '<option value="">Seçiniz...</option>';
        let delOptionsHTML = '<option value="">Seçiniz...</option>';

        for (let [name, data] of Object.entries(products)) {
            const pCard = data.priceCard || data.price;
            const pCash = data.priceCash || data.price;
            const val = JSON.stringify({ ...data, name: name });
            optionsHTML += `<option value='${val}'>${name} (Kart: ${pCard}$ | Nakit: ${pCash}$)</option>`;
            delOptionsHTML += `<option value="${name}">${name}</option>`;
        }

        optionsHTML += `<option value="GLASS_BALCONY_VARIANTS" style="font-weight:bold; color:#2980b9;">✨ CAM BALKON ÇEŞİTLERİ (Karşılaştırmalı) ✨</option>`;
        optionsHTML += `<option value="MULTI_CALCULATION" style="font-weight:bold; color:#d35400;">🚀 TÜM SİSTEMLER (Giyotin Dahil Liste) 🚀</option>`;

        selects.forEach(sel => {
            const currentVal = sel.value;
            sel.innerHTML = optionsHTML;
            sel.value = currentVal; // Seçili olanı koru
        });
        if(deleteSel) deleteSel.innerHTML = delOptionsHTML;
    }

    function calculateGuillotineLogic(widthList, height) {
        let totalPricingArea = 0;
        let totalPieces = 0;
        widthList.forEach(w => {
            if (w <= 0) return;
            let currentPieces = 1;
            let currentPricingArea = 0;

            if (w > 800) {
                currentPieces = 3;
                let onePieceArea = ((w / 3) * height) / 10000;
                if (onePieceArea < 7) onePieceArea = 7;
                currentPricingArea = onePieceArea * 3;
            } else if (w > 370) {
                currentPieces = 2;
                let onePieceArea = ((w / 2) * height) / 10000;
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

    // --- HESAPLAMA MOTORU (ÇOKLU SİSTEM DESTEĞİ İLE) ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        const paymentType = globalPaymentType.value;
        const extraName = extraItemNameInput.value.trim();
        const extraPrice = parseFloat(extraItemPriceInput.value) || 0;

        if (isNaN(rate) || rate <= 0) { alert("Lütfen Dolar Kurunu giriniz."); return; }

        const blocks = document.querySelectorAll('.system-block');
        let combinedSystems = [];
        let grandTotalRaw = 0;
        let totalAreaGlobal = 0;

        // "Özel Seçenekler" (Tüm Sistemler listesi vs) sadece 1. blokta seçildiyse eskisi gibi çalışır
        let isSpecialListMode = false;
        let specialListType = "";

        blocks.forEach((block, index) => {
            const selectedValue = block.querySelector('.productSelect').value;
            const h = parseFloat(block.querySelector('.heightInput').value);
            const wInputs = block.querySelectorAll('.width-input');
            let wList = [], totalW = 0;
            
            wInputs.forEach(input => {
                const val = parseFloat(input.value);
                if (!isNaN(val) && val > 0) { wList.push(val); totalW += val; }
            });

            if (!selectedValue || totalW <= 0 || isNaN(h)) return; // Eksik blokları atla

            if (index === 0 && (selectedValue === "GLASS_BALCONY_VARIANTS" || selectedValue === "MULTI_CALCULATION")) {
                isSpecialListMode = true;
                specialListType = selectedValue;
                // Özel listeler ilk bloğun ölçülerini baz alır
                combinedSystems.push({ wList, totalW, h }); 
                return;
            }

            // Normal Ürün İşleme
            let selectedData = JSON.parse(selectedValue);
            const pName = selectedData.name.toLowerCase();
            let pricingArea = 0, calculatedParca = 1;

            if (pName.includes("giyotin")) {
                let gResult = calculateGuillotineLogic(wList, h);
                pricingArea = gResult.pricingArea;
                calculatedParca = gResult.pieces;
            } else {
                let pricingHeight = h < 180 ? 180 : h;
                pricingArea = (totalW * pricingHeight) / 10000;
                if (pricingArea < 5) pricingArea = 5;
                calculatedParca = Math.ceil(totalW / 65);
            }

            let realArea = (totalW * h) / 10000;
            totalAreaGlobal += realArea;

            let activePrice = (paymentType === 'cash') ? (selectedData.priceCash || selectedData.priceCard) : (selectedData.priceCard || selectedData.price);
            let rawTL = (pricingArea * activePrice) * rate;
            grandTotalRaw += rawTL;

            combinedSystems.push({
                productName: selectedData.name,
                video: selectedData.video,
                totalW: totalW,
                h: h,
                realArea: realArea,
                parcaSayisi: calculatedParca,
                isGuillotine: pName.includes("giyotin")
            });
        });

        if (combinedSystems.length === 0) {
            alert("Lütfen en az bir ürün seçin ve ölçülerini girin."); return;
        }

        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 });

        // ÖZEL LİSTE SENARYOLARI (Eski Yapı Korundu)
        if (isSpecialListMode) {
            const targetData = combinedSystems[0];
            let allProducts = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultProductsData;
            let multiResults = [];
            let realArea = (targetData.totalW * targetData.h) / 10000;

            const isGlassOnly = (specialListType === "GLASS_BALCONY_VARIANTS");
            const filterGlass = ["8mm Kollu Çıtalı Sistem Katlanır Cam Balkon", "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon", "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon", "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon"];

            for (let [pName, pData] of Object.entries(allProducts)) {
                if (isGlassOnly && !filterGlass.includes(pName)) continue;
                if (!isGlassOnly && pName.toLowerCase().includes("sürme")) continue;

                let pricingArea = 0;
                if (pName.toLowerCase().includes("giyotin")) {
                    pricingArea = calculateGuillotineLogic(targetData.wList, targetData.h).pricingArea;
                } else {
                    let pH = targetData.h < 180 ? 180 : targetData.h;
                    pricingArea = (targetData.totalW * pH) / 10000;
                    if (pricingArea < 5) pricingArea = 5;
                }

                let activePrice = (paymentType === 'cash') ? (pData.priceCash || pData.priceCard) : (pData.priceCard || pData.price);
                let rawTotal = (pricingArea * activePrice) * rate;
                let roundedTotal = smartRound(rawTotal) + extraPrice; 

                multiResults.push({ name: pName, totalPrice: roundedTotal, formattedPrice: formatCanvasPrice(roundedTotal) });
            }

            lastCalculation = {
                isSpecialList: true,
                paymentType: paymentType,
                area: realArea.toFixed(2),
                multiResults: multiResults,
                extraName: extraName,
                extraPrice: extraPrice,
                details: `(En: ${targetData.totalW}cm x Boy: ${targetData.h}cm)`,
                multiTitle: isGlassOnly ? "Cam Balkon Sistem Çeşitleri" : "Tüm Cam Balkon & Giyotin Sistemleri"
            };

            resultArea.querySelector('.result-big').textContent = "Çeşit Listesi Hazır";
            detailInfo.innerHTML = `Alan: ${realArea.toFixed(2)} m² <br>Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'}`;
        } 
        // KARMA TEKLİF & TEKİL SİSTEM SENARYOSU
        else {
            const finalGrandTL = smartRound(grandTotalRaw) + extraPrice;
            const formattedGrandTotal = fmtTL.format(finalGrandTL);
            
            let detailsText = combinedSystems.length === 1 ? 
                `(En: ${combinedSystems[0].totalW}cm x Boy: ${combinedSystems[0].h}cm)` : 
                `(${combinedSystems.length} Farklı Sistem Toplamı)`;

            lastCalculation = {
                isSpecialList: false,
                isCombined: combinedSystems.length > 1,
                paymentType: paymentType,
                systems: combinedSystems,
                area: totalAreaGlobal.toFixed(2),
                extraName: extraName,
                extraPrice: extraPrice,
                grandTotalStr: formattedGrandTotal,
                canvasPriceStr: formatCanvasPrice(finalGrandTL),
                details: detailsText,
                productVideo: combinedSystems[0].video, // İlk ürünün videosunu paylaşır
                productName: combinedSystems.length === 1 ? combinedSystems[0].productName : "Karma Sistem Teklifi"
            };

            resultArea.querySelector('.result-big').textContent = formattedGrandTotal;
            detailInfo.innerHTML = `Alan: ${totalAreaGlobal.toFixed(2)} m² <br> Ödeme: ${paymentType === 'cash' ? 'Nakit' : 'Kredi Kartı'} <br> Sistem Sayısı: ${combinedSystems.length} ${extraPrice>0 ? '<br>+ Ek Malzeme Dahil' : ''}`;
        }

        if(downloadBtn) downloadBtn.style.display = 'block';
        if(shareBtn) shareBtn.style.display = 'block';
    });

    if(shareVideoBtn) {
        shareVideoBtn.addEventListener('click', async () => {
            if (!lastCalculation || !lastCalculation.productVideo) {
                alert("Önce hesaplama yapınız veya video içeren bir ürün seçiniz."); return;
            }
            const shareData = { title: "Tanıtım", text: `Tanıtım Videosu:\n${lastCalculation.productVideo}` };
            if (navigator.share) { try { await navigator.share(shareData); } catch(e){} }
            else { navigator.clipboard.writeText(lastCalculation.productVideo); alert("Link kopyalandı."); }
        });
    }

    // --- TEKNİK ÇİZİM: TEK VEYA YAN YANA BÖLÜNMÜŞ (FİKİR B) ---
    function drawSystemSchema(ctx, scaleX, scaleY, data) {
        const profileColor = '#2c3e50';
        const glassColor = '#eaf2f8';
        const dimColor = '#e74c3c';

        // Temel çerçeve güvenli iç koordinatları
        const startX = 96 * scaleX;
        const startY = 322 * scaleY;
        const totalW = 426 * scaleX; 
        const drawH = 194 * scaleY; 

        // Sistemleri Çizen Alt Fonksiyon
        function drawSingle(sys, bX, bW) {
            // Ölçü Okları
            ctx.strokeStyle = dimColor; ctx.fillStyle = dimColor; ctx.lineWidth = 1.6 * scaleX;
            // Alt Yatay Ölçü
            const dimBottomY = startY + drawH + (11 * scaleY);
            ctx.beginPath(); ctx.moveTo(bX, dimBottomY); ctx.lineTo(bX + bW, dimBottomY); ctx.stroke();
            ctx.beginPath(); ctx.arc(bX, dimBottomY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(bX + bW, dimBottomY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
            ctx.font = `bold ${Math.round(10 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`${sys.totalW}cm`, bX + (bW / 2), dimBottomY + (13 * scaleY));

            // Sol Dikey Ölçü
            const dimLeftX = bX - (10 * scaleX);
            ctx.beginPath(); ctx.moveTo(dimLeftX, startY); ctx.lineTo(dimLeftX, startY + drawH); ctx.stroke();
            ctx.beginPath(); ctx.arc(dimLeftX, startY, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(dimLeftX, startY + drawH, 2.5 * scaleX, 0, Math.PI * 2); ctx.fill();
            ctx.save();
            ctx.translate(dimLeftX - (10 * scaleX), startY + (drawH / 2));
            ctx.rotate(-Math.PI / 2);
            ctx.fillText(`${sys.h}cm`, 0, 0);
            ctx.restore();

            // Kasa & Cam Çizimi
            if (sys.isGuillotine) {
                const pieceWidth = bW / sys.parcaSayisi;
                const profileThick = 4 * scaleX;
                const motorBoxH = 22 * scaleY;
                const bottomRailH = 14 * scaleY;

                for (let i = 0; i < sys.parcaSayisi; i++) {
                    const currentX = bX + (i * pieceWidth);
                    ctx.fillStyle = glassColor; ctx.fillRect(currentX, startY, pieceWidth, drawH);
                    ctx.fillStyle = profileColor;
                    ctx.fillRect(currentX, startY, profileThick, drawH);
                    ctx.fillRect(currentX + pieceWidth - profileThick, startY, profileThick, drawH);
                    ctx.fillRect(currentX, startY, pieceWidth, motorBoxH); 
                    const panelH = (drawH - motorBoxH) / 3;
                    ctx.fillRect(currentX, startY + motorBoxH + panelH, pieceWidth, profileThick);
                    ctx.fillRect(currentX, startY + motorBoxH + (panelH * 2), pieceWidth, profileThick);
                    ctx.fillRect(currentX, startY + drawH - bottomRailH, pieceWidth, bottomRailH);
                }
            } else {
                let panelCount = Math.ceil(sys.totalW / 65);
                if (panelCount < 2) panelCount = 2;
                const panelWidth = bW / panelCount;
                const profileThick = 3 * scaleX;
                const railH = 13 * scaleY;

                ctx.fillStyle = profileColor;
                ctx.fillRect(bX, startY, bW, railH);
                ctx.fillRect(bX, startY + drawH - railH, bW, railH);

                for (let i = 0; i < panelCount; i++) {
                    const currentX = bX + (i * panelWidth);
                    ctx.fillStyle = glassColor;
                    ctx.fillRect(currentX + profileThick, startY + railH, panelWidth - (profileThick * 2), drawH - (railH * 2));
                    ctx.fillStyle = '#bdc3c7';
                    ctx.fillRect(currentX, startY + railH, profileThick, drawH - (railH * 2));
                    ctx.fillRect(currentX + panelWidth - profileThick, startY + railH, profileThick, drawH - (railH * 2));
                    if (i === 0) {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(currentX + panelWidth - (8 * scaleX), startY + (drawH / 2) - (12 * scaleY), 4 * scaleX, 24 * scaleY);
                    }
                }
                ctx.fillStyle = profileColor;
                ctx.fillRect(bX, startY, 6 * scaleX, drawH);
                ctx.fillRect(bX + bW - (6 * scaleX), startY, 6 * scaleX, drawH);
            }
        }

        // Eğer Yan Yana İse (Karma Sistem)
        if (data.isCombined) {
            const sysCount = data.systems.length;
            const gap = 35 * scaleX; // Sistemler arası boşluk
            const totalGap = gap * (sysCount - 1);
            const subBoxW = (totalW - totalGap) / sysCount;

            data.systems.forEach((sys, idx) => {
                const subBoxX = startX + (idx * (subBoxW + gap));
                drawSingle(sys, subBoxX, subBoxW);
            });
        } else {
            // Tekil Sistem (Geniş)
            drawSingle(data.systems[0], startX, totalW);
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

    async function createCanvasImage() {
        if (!lastCalculation) return null;

        try {
            await document.fonts.ready;
            await document.fonts.load('40px "Dela Gothic One"');
        } catch(e) {}

        const isCash = lastCalculation.paymentType === 'cash';
        const templateSrc = isCash ? 'sablon-nakit.jpg' : 'sablon-taksit.jpg';

        let bgImage;
        try { bgImage = await loadImage(templateSrc); } 
        catch (err) { alert("Şablon bulunamadı."); return null; }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const width = bgImage.naturalWidth || 595;
        const height = bgImage.naturalHeight || 842;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(bgImage, 0, 0, width, height);

        const scaleX = width / 595;
        const scaleY = height / 842;

        if (lastCalculation.isSpecialList) {
            // --- ÖZEL ÇEŞİT LİSTESİ ŞABLONU ---
            ctx.fillStyle = '#1c2649';
            fitSingleLineText(ctx, lastCalculation.multiTitle, 410 * scaleX, 13 * scaleX, 9 * scaleX, '"OCR A Extended", monospace');
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText(lastCalculation.multiTitle, 125 * scaleX, 164 * scaleY);

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(56 * scaleX, 292 * scaleY, 483 * scaleX, 260 * scaleY);
            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(16 * scaleX)}px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText("ALTERNATİF SİSTEM FİYAT LİSTESİ", width / 2, 316 * scaleY);

            let startY = 356 * scaleY;
            lastCalculation.multiResults.forEach(item => {
                ctx.fillStyle = '#1e293b';
                fitSingleLineText(ctx, item.name, 315 * scaleX, 11.5 * scaleX, 8.5 * scaleX, '"OCR A Extended", monospace');
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(item.name, 68 * scaleX, startY);

                ctx.fillStyle = '#1c2649';
                ctx.font = `400 ${Math.round(14 * scaleX)}px "Dela Gothic One", sans-serif`;
                ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
                ctx.fillText(item.formattedPrice, 528 * scaleX, startY);
                startY += 40 * scaleY;
            });

            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(12.5 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 168 * scaleX, 574 * scaleY); // 574px GÜNCELLEMESİ

            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(24 * scaleX)}px "Segoe UI", Arial, sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText("SEÇENEKLİ TEKLİF", width / 2, 636 * scaleY);

        } else {
            // --- TEKİL VEYA KARMA TEKLİF (YANYANA ÇİZİM) ---

            // İş Tanımı Tablosu Yazımı (Satır 1, 2, 3...)
            let rowY = 164 * scaleY; // 1. satır hizası
            const rowHeight = 31.5 * scaleY; // Satırlar arası boşluk şablona göre
            lastCalculation.systems.forEach((sys, idx) => {
                if (idx > 3) return; // Tablo en fazla 4 satır alıyor
                ctx.fillStyle = '#1c2649';
                let prefix = lastCalculation.isCombined ? `[Sistem ${idx+1}] ` : "";
                fitSingleLineText(ctx, prefix + sys.productName, 412 * scaleX, 12 * scaleX, 8.5 * scaleX, '"OCR A Extended", monospace');
                ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                ctx.fillText(prefix + sys.productName, 125 * scaleX, rowY);
                rowY += rowHeight;
            });

            // Temsili Çizim
            drawSystemSchema(ctx, scaleX, scaleY, lastCalculation);

            // Toplam Alan (Kayma Düzeltildi - 574 * scaleY)
            ctx.fillStyle = '#1c2649';
            ctx.font = `bold ${Math.round(12.5 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
            ctx.fillText(`${lastCalculation.area} m²  ${lastCalculation.details}`, 168 * scaleX, 574 * scaleY);

            // Fiyat (Dela Gothic One)
            ctx.fillStyle = '#ffffff';
            fitSingleLineText(ctx, lastCalculation.canvasPriceStr, 380 * scaleX, 34 * scaleX, 22 * scaleX, '"Dela Gothic One", sans-serif');
            const finalPriceSize = parseInt(ctx.font.match(/\d+/)[0], 10);
            ctx.font = `400 ${finalPriceSize}px "Dela Gothic One", sans-serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(lastCalculation.canvasPriceStr, width / 2, 636 * scaleY);
        }

        // Genel Ek Malzeme Notu
        if (lastCalculation.extraPrice > 0) {
            ctx.fillStyle = '#d97706';
            ctx.font = `italic bold ${Math.round(11 * scaleX)}px "OCR A Extended", monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`* Fiyata "${lastCalculation.extraName}" bedeli dahildir.`, width / 2, 712 * scaleY);
        }

        return canvas;
    }

    if(downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            let fileName = lastCalculation.isCombined ? "Karma-Teklif.jpg" : `Teklif-${lastCalculation.systems[0].productName.replace(/ /g,"-")}.jpg`;
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
                    try { await navigator.share({ files: [file], title: 'Fiyat Teklifi' }); } 
                    catch (error) {}
                } else { alert("Tarayıcı desteklemiyor. 'İndir' butonunu kullanın."); }
            }, 'image/png', 1.0);
        });
    }
});
