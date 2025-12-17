document.addEventListener('DOMContentLoaded', function() {
    // --- ELEMENT SEÇİMLERİ ---
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
    
    // BUTONLAR
    const downloadBtn = document.getElementById('downloadBtn'); 
    const shareBtn = document.getElementById('shareBtn'); 
    
    const resultArea = document.getElementById('resultArea');
    const detailInfo = document.getElementById('detailInfo');
    const mainLogo = document.getElementById('mainLogo'); 

    const newProductName = document.getElementById('newProductName');
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    let lastCalculation = null;

    // --- BAŞLANGIÇ ---
    loadProducts();
    loadRate();

    // --- SEKME GEÇİŞLERİ ---
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

    // --- KAYIT İŞLEMLERİ ---
    saveProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const price = parseFloat(newProductPrice.value);
        if (!name || isNaN(price)) { alert("Geçerli isim ve fiyat girin."); return; }

        let products = JSON.parse(localStorage.getItem('myProducts')) || {};
        products[name] = price;
        localStorage.setItem('myProducts', JSON.stringify(products));

        alert(`${name} kaydedildi!`);
        newProductName.value = ''; newProductPrice.value = '';
        loadProducts();
    });

    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('myProducts')) || {};
        productSelect.innerHTML = '<option value="">Seçiniz...</option>';
        deleteSelect.innerHTML = '<option value="">Seçiniz...</option>';

        for (let [name, price] of Object.entries(products)) {
            let option1 = document.createElement('option');
            option1.value = JSON.stringify({ price: price, name: name }); 
            option1.textContent = `${name} ($${price})`; 
            productSelect.appendChild(option1);

            let option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            deleteSelect.appendChild(option2);
        }
    }

    // --- HESAPLAMA MANTIĞI ---
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
            area: area.toFixed(2),
            totalPrice: fmtTL.format(totalTL),
            details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
        };
    });

    // --- GÖRSEL OLUŞTURUCU ---
    function createCanvasImage() {
        if (!lastCalculation) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 1080; 
        canvas.width = size;
        canvas.height = size;

        // Arka Plan
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // Logo
        const logoWidth = 500; 
        const logoHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * logoWidth;
        const logoX = (size - logoWidth) / 2;
        ctx.drawImage(mainLogo, logoX, 50, logoWidth, logoHeight);

        // --- Yazı Başlangıç Konumu ---
        let cursorY = 50 + logoHeight + 80; 

        // --- Ürün Adı (Düzeltildi: Olduğu gibi yazıyor) ---
        ctx.fillStyle = '#333333';
        const fontSize = 70;
        ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
        ctx.textAlign = 'center';
        
        // BURADAKİ uppercase komutunu kaldırdık. Artık "Isıcamlı" ise "Isıcamlı" yazar.
        const productName = lastCalculation.productName; 
        
        const maxWidth = 950;
        const lineHeight = 80;

        const words = productName.split(' ');
        let line = '';
        
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, size / 2, cursorY);
                line = words[n] + ' ';
                cursorY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, size / 2, cursorY);

        // --- Çizgi ---
        cursorY += 40; 
        ctx.beginPath();
        ctx.moveTo(200, cursorY);
        ctx.lineTo(880, cursorY);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 5;
        ctx.stroke();

        // --- Ölçüler ---
        cursorY += 80;
        ctx.fillStyle = '#666666';
        ctx.font = '50px Segoe UI, Arial';
        ctx.fillText(`Toplam Alan: ${lastCalculation.area} m²`, size / 2, cursorY);
        
        cursorY += 50;
        ctx.font = 'italic 30px Segoe UI, Arial';
        ctx.fillText(lastCalculation.details, size / 2, cursorY);

        // --- Fiyat ---
        cursorY += 150; 
        ctx.fillStyle = '#28a745'; 
        ctx.font = 'bold 130px Segoe UI, Arial';
        ctx.fillText(lastCalculation.totalPrice, size / 2, cursorY);

        // --- Alt Şerit ---
        const footerHeight = 200;
        const footerY = size - footerHeight;
        
        ctx.fillStyle = '#F37021'; 
        ctx.fillRect(0, footerY, size, footerHeight);

        ctx.fillStyle = '#ffffff'; 
        ctx.font = 'bold 40px Segoe UI, Arial';
        ctx.fillText("SİSTEMLERİMİZ 5 YIL GARANTİLİDİR", size / 2, footerY + 80);

        ctx.font = '32px Segoe UI, Arial';
        ctx.fillText("Tüm kartlara peşin fiyatına 5 taksit fırsatı", size / 2, footerY + 140);

        ctx.fillStyle = '#999999';
        ctx.font = '24px Segoe UI, Arial';
        const today = new Date().toLocaleDateString('tr-TR');
        ctx.fillText(today, size / 2, footerY - 20);

        return canvas;
    }

    // --- İNDİR BUTONU ---
    if(downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const canvas = createCanvasImage();
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
            const canvas = createCanvasImage();
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

    // Silme
    deleteProductBtn.addEventListener('click', () => {
        const nameToDelete = deleteSelect.value;
        if (!nameToDelete) return;
        if(confirm(`${nameToDelete} silinsin mi?`)) {
            let products = JSON.parse(localStorage.getItem('myProducts')) || {};
            delete products[nameToDelete];
            localStorage.setItem('myProducts', JSON.stringify(products));
            loadProducts();
        }
    });
});