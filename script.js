// --- VARSAYILAN ÜRÜN LİSTESİ ---
const defaultProductsData = {
    "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { price: 140, img: "1" },
    "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { price: 165, img: "2" },
    "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { price: 200, img: "4" },
    "Isıcamlı Temizlenebilir Giyotin": { price: 240, img: "3" },
    "Isıcamlı Sürme Sistem Cam Balkon": { price: 165, img: "5" }
};

document.addEventListener('DOMContentLoaded', function() {
    // ELEMENTLER
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const productSelect = document.getElementById('productSelect');
    
    const widthContainer = document.getElementById('width-container');
    const addWidthBtn = document.getElementById('addWidthBtn');
    const resetInputsBtn = document.getElementById('resetInputsBtn'); 
    
    const heightInput = document.getElementById('height');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    const shareBtn = document.getElementById('shareBtn'); 
    
    const resultArea = document.getElementById('resultArea');
    const detailInfo = document.getElementById('detailInfo');
    const mainLogo = document.getElementById('mainLogo'); 

    const newProductName = document.getElementById('newProductName');
    const newProductImage = document.getElementById('newProductImage'); 
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    let lastCalculation = null;

    // --- BAŞLATMA ---
    checkAndLoadDefaults();
    loadRate();

    // --- EN EKLEME ---
    addWidthBtn.addEventListener('click', () => {
        const currentCount = widthContainer.querySelectorAll('.width-input').length;
        const nextCount = currentCount + 1;
        
        const newInput = document.createElement('input');
        newInput.type = 'number';
        newInput.className = 'width-input';
        newInput.placeholder = `En ${nextCount}`; 
        
        widthContainer.appendChild(newInput);
    });

    // --- SIFIRLAMA ---
    resetInputsBtn.addEventListener('click', () => {
        if(confirm("Ölçüler temizlensin mi?")) {
            widthContainer.innerHTML = '<input type="number" class="width-input" placeholder="En 1">';
            heightInput.value = '';
            resultArea.querySelector('.result-big').textContent = '0.00 ₺';
            detailInfo.innerHTML = '';
            downloadBtn.style.display = 'none';
            shareBtn.style.display = 'none';
            lastCalculation = null;
        }
    });

    // --- MENÜ GEÇİŞLERİ ---
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

    // --- AKILLI YUVARLAMA (0-500-1000) ---
    function smartRound(amount) {
        let integerPart = Math.floor(amount);
        let thousands = Math.floor(integerPart / 1000) * 1000;
        let remainder = integerPart % 1000;

        if (remainder === 0) { return integerPart; } 
        else if (remainder <= 500) { return thousands + 500; } 
        else { return thousands + 1000; }
    }

    function checkAndLoadDefaults() {
        if (!localStorage.getItem('myProductsV3')) {
            localStorage.setItem('myProductsV3', JSON.stringify(defaultProductsData));
        }
        loadProducts();
    }

    window.resetDefaultProducts = function() {
        if(confirm("Tüm listeniz silinecek ve varsayılan ürünler yüklenecek. Onaylıyor musunuz?")) {
            localStorage.setItem('myProductsV3', JSON.stringify(defaultProductsData));
            loadProducts();
            alert("Varsayılan ürünler yüklendi!");
        }
    };

    saveProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const imgName = newProductImage.value.trim(); 
        const price = parseFloat(newProductPrice.value);

        if (!name || !imgName || isNaN(price)) { alert("Eksik bilgi girdiniz."); return; }

        let products = JSON.parse(localStorage.getItem('myProductsV3')) || {};
        products[name] = { price: price, img: imgName };
        localStorage.setItem('myProductsV3', JSON.stringify(products));

        alert(`${name} kaydedildi!`);
        newProductName.value = ''; newProductImage.value = ''; newProductPrice.value = '';
        loadProducts();
    });

    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('myProductsV3')) || {};
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
    }

    // --- HESAPLAMA (ÖZEL KURALLAR EKLENDİ) ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        let selectedData = productSelect.value ? JSON.parse(productSelect.value) : null;
        
        const allWidthInputs = document.querySelectorAll('.width-input');
        let totalWidth = 0;
        
        allWidthInputs.forEach(input => {
            const val = parseFloat(input.value);
            if (!isNaN(val)) totalWidth += val;
        });

        const h = parseFloat(heightInput.value);

        if (isNaN(rate) || rate <= 0) { alert("Dolar Kuru girin."); return; }
        if (!selectedData || totalWidth <= 0 || isNaN(h)) {
            alert("Ürün seçin ve ölçüleri girin.");
            return;
        }

        localStorage.setItem('dollarRate', rate);

        // 1. GERÇEK ALAN (Müşteriye gösterilecek olan)
        // cm cinsinden hesaplandığı için 10000'e bölüp m2 buluyoruz
        let realArea = (totalWidth * h) / 10000; 

        // 2. FİYATLANDIRMA İÇİN GİZLİ HESAP
        let pricingHeight = h;
        let pricingArea = realArea;

        const productName = selectedData.name.toLowerCase();

        // KURAL: CAM BALKON İSE
        if (productName.includes("cam balkon")) {
            // Min Yükseklik Kuralı: 1.8m (180cm)
            if (h < 180) {
                pricingHeight = 180;
                // Yükseklik değiştiği için alanı o anlık tekrar hesapla
                pricingArea = (totalWidth * pricingHeight) / 10000;
            }
            
            // Min m2 Kuralı: 5m2
            if (pricingArea < 5) {
                pricingArea = 5;
            }
        }
        
        // KURAL: GİYOTİN İSE
        else if (productName.includes("giyotin")) {
            // Min m2 Kuralı: 7m2
            if (pricingArea < 7) {
                pricingArea = 7;
            }
        }

        // Fiyatı "pricingArea" (gizli m2) üzerinden hesapla
        const rawTotalTL = (pricingArea * selectedData.price) * rate; 
        
        // Akıllı yuvarlama uygula
        const roundedTotalTL = smartRound(rawTotalTL);

        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        resultArea.querySelector('.result-big').textContent = fmtTL.format(roundedTotalTL);
        
        // Ekranda da bilgi verelim (Burada gerçek alanı gösteriyoruz ama fiyat farklı çıkabilir)
        detailInfo.innerHTML = `Hesaplanan Alan: ${realArea.toFixed(2)} m² <br> Ham Tutar: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(rawTotalTL)}`;

        if(downloadBtn) downloadBtn.style.display = 'block';
        if(shareBtn) shareBtn.style.display = 'block';

        lastCalculation = {
            productName: selectedData.name,
            productImg: selectedData.img, 
            area: realArea.toFixed(2), // Görselde GERÇEK ALAN yazacak
            totalPrice: fmtTL.format(roundedTotalTL), // Görselde YUVARLANMIŞ/MİNİMUM FİYAT yazacak
            details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
        };
    });

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

        const logoWidth = 500; 
        const logoHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * logoWidth;
        const logoX = (width - logoWidth) / 2;
        ctx.drawImage(mainLogo, logoX, 60, logoWidth, logoHeight);

        let cursorY = 60 + logoHeight + 60; 
        
        ctx.fillStyle = '#333333';
        const fontSize = 70;
        ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
        ctx.textAlign = 'center';
        
        const productName = lastCalculation.productName;
        const maxWidth = 950;
        const lineHeight = 80;

        const words = productName.split(' ');
        let line = '';
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, width / 2, cursorY);
                line = words[n] + ' ';
                cursorY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width / 2, cursorY);

        const imgName = lastCalculation.productImg;
        const productImgObj = new Image();
        productImgObj.src = imgName + ".jpg"; 

        await new Promise((resolve, reject) => {
            productImgObj.onload = resolve;
            productImgObj.onerror = resolve; 
        });

        if (productImgObj.complete && productImgObj.naturalWidth !== 0) {
            cursorY += 40; 
            const boxWidth = 900;
            const boxHeight = 600;
            const boxX = (width - boxWidth) / 2;
            
            const hRatio = boxWidth / productImgObj.naturalWidth;
            const vRatio = boxHeight / productImgObj.naturalHeight;
            const ratio = Math.min(hRatio, vRatio);
            
            const centerShift_x = (boxWidth - productImgObj.naturalWidth * ratio) / 2;
            const centerShift_y = (boxHeight - productImgObj.naturalHeight * ratio) / 2; 
            
            ctx.drawImage(productImgObj, 0, 0, productImgObj.naturalWidth, productImgObj.naturalHeight,
                boxX + centerShift_x, cursorY + centerShift_y, productImgObj.naturalWidth * ratio, productImgObj.naturalHeight * ratio);
            
            cursorY += boxHeight + 40; 
        } else {
            cursorY += 600; 
        }

        ctx.beginPath();
        ctx.moveTo(200, cursorY);
        ctx.lineTo(880, cursorY);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 5;
        ctx.stroke();

        cursorY += 80;
        ctx.fillStyle = '#666666';
        ctx.font = '50px Segoe UI, Arial';
        ctx.fillText(`Toplam Alan: ${lastCalculation.area} m²`, width / 2, cursorY);
        
        cursorY += 50;
        ctx.font = 'italic 30px Segoe UI, Arial';
        ctx.fillText(lastCalculation.details, width / 2, cursorY);

        cursorY += 120; 
        ctx.fillStyle = '#28a745'; 
        ctx.font = 'bold 120px Segoe UI, Arial';
        ctx.fillText(lastCalculation.totalPrice, width / 2, cursorY);

        const footerHeight = 200;
        const footerY = height - footerHeight;
        
        ctx.fillStyle = '#F37021'; 
        ctx.fillRect(0, footerY, width, footerHeight);

        ctx.fillStyle = '#ffffff'; 
        ctx.font = 'bold 40px Segoe UI, Arial';
        ctx.fillText("SİSTEMLERİMİZ 5 YIL GARANTİLİDİR", width / 2, footerY + 80);

        ctx.font = '32px Segoe UI, Arial';
        ctx.fillText("Tüm kartlara peşin fiyatına 5 taksit fırsatı", width / 2, footerY + 140);

        ctx.fillStyle = '#999999';
        ctx.font = '24px Segoe UI, Arial';
        const today = new Date().toLocaleDateString('tr-TR');
        ctx.fillText(today, width / 2, footerY - 20);

        return canvas;
    }

    if(downloadBtn) {
        downloadBtn.addEventListener('click', async () => {
            const canvas = await createCanvasImage();
            if(!canvas) return;
            const link = document.createElement('a');
            link.download = `Teklif-${lastCalculation.productName.replace(/ /g,"-")}.jpg`;
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
                            text: `${lastCalculation.productName} Fiyat Teklifi`
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
            let products = JSON.parse(localStorage.getItem('myProductsV3')) || {};
            delete products[nameToDelete];
            localStorage.setItem('myProductsV3', JSON.stringify(products));
            loadProducts();
        }
    });
});