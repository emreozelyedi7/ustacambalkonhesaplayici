document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENTLER ---
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const productSelect = document.getElementById('productSelect');
    
    const w1Input = document.getElementById('w1');
    const w2Input = document.getElementById('w2');
    const w3Input = document.getElementById('w3');
    const heightInput = document.getElementById('height');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    const shareBtn = document.getElementById('shareBtn'); 
    
    const resultArea = document.getElementById('resultArea');
    const detailInfo = document.getElementById('detailInfo');
    const mainLogo = document.getElementById('mainLogo'); 

    // Yeni Ayar Alanları
    const newProductName = document.getElementById('newProductName');
    const newProductImage = document.getElementById('newProductImage'); // Resim Adı Girişi
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    let lastCalculation = null;

    loadProducts();
    loadRate();

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

    // --- ÜRÜN KAYDETME (Güncellendi) ---
    saveProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const imgName = newProductImage.value.trim(); // Resim adı
        const price = parseFloat(newProductPrice.value);

        if (!name || !imgName || isNaN(price)) { 
            alert("Lütfen Ürün Adı, Resim Kodu ve Fiyatı eksiksiz girin."); 
            return; 
        }

        let products = JSON.parse(localStorage.getItem('myProductsV2')) || {};
        
        // Veriyi Obje olarak kaydediyoruz: {fiyat: 100, resim: 'giyotin'}
        products[name] = { price: price, img: imgName };
        
        localStorage.setItem('myProductsV2', JSON.stringify(products));

        alert(`${name} kaydedildi! (Resim kodu: ${imgName})`);
        newProductName.value = ''; 
        newProductImage.value = '';
        newProductPrice.value = '';
        loadProducts();
    });

    function loadProducts() {
        // V2 veritabanını kullanıyoruz
        let products = JSON.parse(localStorage.getItem('myProductsV2')) || {};
        productSelect.innerHTML = '<option value="">Seçiniz...</option>';
        deleteSelect.innerHTML = '<option value="">Seçiniz...</option>';

        for (let [name, data] of Object.entries(products)) {
            let option1 = document.createElement('option');
            // Value içine tüm datayı gömüyoruz
            option1.value = JSON.stringify({ ...data, name: name }); 
            option1.textContent = `${name} ($${data.price})`; 
            productSelect.appendChild(option1);

            let option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            deleteSelect.appendChild(option2);
        }
    }

    // --- HESAPLAMA ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        let selectedData = productSelect.value ? JSON.parse(productSelect.value) : null;
        
        const w1 = parseFloat(w1Input.value) || 0;
        const w2 = parseFloat(w2Input.value) || 0;
        const w3 = parseFloat(w3Input.value) || 0;
        const totalWidth = w1 + w2 + w3;
        const h = parseFloat(heightInput.value);

        if (isNaN(rate) || rate <= 0) { alert("Dolar Kuru girin."); return; }
        if (!selectedData || totalWidth <= 0 || isNaN(h)) {
            alert("Ürün seçin ve ölçüleri girin.");
            return;
        }

        localStorage.setItem('dollarRate', rate);

        const area = (totalWidth * h) / 10000; 
        const totalUSD = area * selectedData.price;
        const totalTL = totalUSD * rate;

        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
        const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        resultArea.querySelector('.result-big').textContent = fmtTL.format(totalTL);
        detailInfo.innerHTML = `Toplam En: ${totalWidth} cm | Yükseklik: ${h} cm <br> Alan: ${area.toFixed(2)} m² <br> (${fmtUSD.format(totalUSD)})`;

        if(downloadBtn) downloadBtn.style.display = 'block';
        if(shareBtn) shareBtn.style.display = 'block';

        lastCalculation = {
            productName: selectedData.name,
            productImg: selectedData.img, // Resim adını buradan alıyoruz
            area: area.toFixed(2),
            totalPrice: fmtTL.format(totalTL),
            details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
        };
    });

    // --- A4 GÖRSEL OLUŞTURUCU ---
    // Bu fonksiyon artık asenkron (async) çünkü resmin yüklenmesini bekleyecek
    async function createCanvasImage() {
        if (!lastCalculation) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // A4 Boyutu (Piksel cinsinden yüksek kalite)
        // Genişlik: 1080px, Yükseklik: 1527px (A4 Oranı)
        const width = 1080;
        const height = 1527;
        
        canvas.width = width;
        canvas.height = height;

        // Arka Plan Beyaz
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // 1. LOGO (En Üst)
        const logoWidth = 500; 
        const logoHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * logoWidth;
        const logoX = (width - logoWidth) / 2;
        ctx.drawImage(mainLogo, logoX, 60, logoWidth, logoHeight);

        // 2. ÜRÜN ADI (Logonun Altı)
        let cursorY = 60 + logoHeight + 60; // İmleç konumu
        
        ctx.fillStyle = '#333333';
        const fontSize = 70;
        ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
        ctx.textAlign = 'center';
        
        const productName = lastCalculation.productName;
        const maxWidth = 950;
        const lineHeight = 80;

        // Satır Kaydırma Döngüsü
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

        // 3. ÜRÜN RESMİ (ORTA ALAN)
        // Resmi yükle
        const imgName = lastCalculation.productImg;
        // Klasördeki dosyayı bulmaya çalışır (jpg varsayılan)
        const productImgObj = new Image();
        productImgObj.src = imgName + ".jpg"; 

        // Resmin yüklenmesini bekle (Promise)
        await new Promise((resolve, reject) => {
            productImgObj.onload = resolve;
            productImgObj.onerror = resolve; // Hata olsa bile devam et (resimsiz basar)
        });

        // Eğer resim yüklendiyse çiz
        if (productImgObj.complete && productImgObj.naturalWidth !== 0) {
            cursorY += 40; // Yazıdan biraz boşluk
            
            // Resim Alanı (Kutu)
            const boxWidth = 900;
            const boxHeight = 600;
            const boxX = (width - boxWidth) / 2;
            
            // Resmi orantılı sığdır (Cover/Contain mantığı)
            const hRatio = boxWidth / productImgObj.naturalWidth;
            const vRatio = boxHeight / productImgObj.naturalHeight;
            const ratio = Math.min(hRatio, vRatio); // Sığdırmak için min, doldurmak için max
            
            const centerShift_x = (boxWidth - productImgObj.naturalWidth * ratio) / 2;
            const centerShift_y = (boxHeight - productImgObj.naturalHeight * ratio) / 2; 
            
            ctx.drawImage(productImgObj, 0, 0, productImgObj.naturalWidth, productImgObj.naturalHeight,
                boxX + centerShift_x, cursorY + centerShift_y, productImgObj.naturalWidth * ratio, productImgObj.naturalHeight * ratio);
            
            cursorY += boxHeight + 40; // İmleci resmin altına taşı
        } else {
            // Resim bulunamazsa boşluk bırak
            cursorY += 600; 
        }

        // 4. DETAYLAR VE FİYAT
        // Çizgi
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

        // 5. ALT BİLGİ (Footer) - En Alta Sabit
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

    // --- İNDİR BUTONU ---
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

    // --- PAYLAŞ BUTONU ---
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

    // SİLME
    deleteProductBtn.addEventListener('click', () => {
        const nameToDelete = deleteSelect.value;
        if (!nameToDelete) return;
        if(confirm(`${nameToDelete} silinsin mi?`)) {
            let products = JSON.parse(localStorage.getItem('myProductsV2')) || {};
            delete products[nameToDelete];
            localStorage.setItem('myProductsV2', JSON.stringify(products));
            loadProducts();
        }
    });
});