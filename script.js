document.addEventListener('DOMContentLoaded', function() {
    // HTML Elementlerini Tanımla
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const productSelect = document.getElementById('productSelect');
    
    // YENİ GİRİŞLER
    const w1Input = document.getElementById('w1');
    const w2Input = document.getElementById('w2');
    const w3Input = document.getElementById('w3');
    const heightInput = document.getElementById('height');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadBtn = document.getElementById('downloadBtn'); // Yeni Buton
    const resultArea = document.getElementById('resultArea');
    const detailInfo = document.getElementById('detailInfo');
    const mainLogo = document.getElementById('mainLogo'); // Logo Görseli

    const newProductName = document.getElementById('newProductName');
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    // Son Hesaplama Verilerini Tutacak Obje
    let lastCalculation = null;

    loadProducts();
    loadRate();

    // Sekme Geçişleri
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

    // Ürün Kaydetme
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

    // Listeleri Doldurma
    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('myProducts')) || {};
        productSelect.innerHTML = '<option value="">Seçiniz...</option>';
        deleteSelect.innerHTML = '<option value="">Seçiniz...</option>';

        for (let [name, price] of Object.entries(products)) {
            let option1 = document.createElement('option');
            // Ürün adını value içinde de tutalım ki görselde kullanabilelim
            option1.value = JSON.stringify({ price: price, name: name }); 
            option1.textContent = `${name} ($${price})`; 
            productSelect.appendChild(option1);

            let option2 = document.createElement('option');
            option2.value = name;
            option2.textContent = name;
            deleteSelect.appendChild(option2);
        }
    }

    // --- YENİ HESAPLAMA MANTIĞI ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        
        // Dropdown value artık JSON formatında, onu parse edelim
        let selectedData = productSelect.value ? JSON.parse(productSelect.value) : null;
        
        // 3 En Değerini Al ve Topla (Boşsa 0 kabul et)
        const w1 = parseFloat(w1Input.value) || 0;
        const w2 = parseFloat(w2Input.value) || 0;
        const w3 = parseFloat(w3Input.value) || 0;
        const totalWidth = w1 + w2 + w3;
        
        const h = parseFloat(heightInput.value);

        if (isNaN(rate) || rate <= 0) { alert("Dolar Kuru girin."); return; }
        if (!selectedData || totalWidth <= 0 || isNaN(h)) {
            alert("Ürün seçin ve en az bir en/boy ölçüsü girin.");
            return;
        }

        localStorage.setItem('dollarRate', rate);

        const area = (totalWidth * h) / 10000; // m²
        const totalUSD = area * selectedData.price;
        const totalTL = totalUSD * rate;

        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
        const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        // Ekrana Yaz
        resultArea.querySelector('.result-big').textContent = fmtTL.format(totalTL);
        detailInfo.innerHTML = `Toplam En: ${totalWidth} cm | Yükseklik: ${h} cm <br> Alan: ${area.toFixed(2)} m² <br> (${fmtUSD.format(totalUSD)})`;

        // Görsel İndirme Butonunu Göster
        downloadBtn.style.display = 'block';

        // Görsel oluşturmak için verileri sakla
        lastCalculation = {
            productName: selectedData.name,
            area: area.toFixed(2),
            totalPrice: fmtTL.format(totalTL),
            details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
        };
    });

    // --- GÖRSEL OLUŞTURMA VE İNDİRME ---
    downloadBtn.addEventListener('click', () => {
        if (!lastCalculation) return;

        // 1. Sanal bir tuval (canvas) oluştur
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const size = 1080; // Kare görsel boyutu (Instagram uyumlu)
        canvas.width = size;
        canvas.height = size;

        // 2. Arka planı beyaz yap
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        // 3. Logoyu Çiz (Ortala)
        const logoWidth = 600; // Logonun tuvaldeki genişliği
        const logoHeight = (mainLogo.naturalHeight / mainLogo.naturalWidth) * logoWidth;
        const logoX = (size - logoWidth) / 2;
        const logoY = 100; // Üstten boşluk
        ctx.drawImage(mainLogo, logoX, logoY, logoWidth, logoHeight);

        // 4. Yazı Ayarları
        ctx.fillStyle = '#333333';
        ctx.textAlign = 'center';

        // Ürün Başlığı
        ctx.font = 'bold 70px Segoe UI, Arial';
        ctx.fillText(lastCalculation.productName.toUpperCase(), size / 2, 500);

        // Çizgi Çek
        ctx.beginPath();
        ctx.moveTo(200, 540);
        ctx.lineTo(880, 540);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 5;
        ctx.stroke();

        // M² Bilgisi
        ctx.fillStyle = '#666666';
        ctx.font = '50px Segoe UI, Arial';
        ctx.fillText(`Toplam Alan: ${lastCalculation.area} m²`, size / 2, 650);
        
        // Ölçü Detayı (İnce)
        ctx.font = 'italic 30px Segoe UI, Arial';
        ctx.fillText(lastCalculation.details, size / 2, 700);

        // FİYAT (En altta, Büyük ve Yeşil)
        ctx.fillStyle = '#28a745'; // Yeşil renk
        ctx.font = 'bold 110px Segoe UI, Arial';
        ctx.fillText(lastCalculation.totalPrice, size / 2, 900);

        // Tarih (En alt köşe, küçük)
        ctx.fillStyle = '#aaaaaa';
        ctx.font = '30px Segoe UI, Arial';
        const today = new Date().toLocaleDateString('tr-TR');
        ctx.fillText(today, size / 2, 1020);

        // 5. İndirme İşlemi
        const link = document.createElement('a');
        link.download = `Teklif-${lastCalculation.productName.replace(/ /g,"-")}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9); // %90 kalite JPG
        link.click();
    });

    // Silme Fonksiyonu
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