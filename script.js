document.addEventListener('DOMContentLoaded', function() {
    // HTML Elementlerini Tanımla
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate'); // Kur Girişi
    const productSelect = document.getElementById('productSelect');
    const widthInput = document.getElementById('width');
    const heightInput = document.getElementById('height');
    const calculateBtn = document.getElementById('calculateBtn');
    const resultArea = document.getElementById('resultArea');
    const usdDetail = document.getElementById('usdDetail');

    const newProductName = document.getElementById('newProductName');
    const newProductPrice = document.getElementById('newProductPrice');
    const saveProductBtn = document.getElementById('saveProductBtn');
    const deleteSelect = document.getElementById('deleteSelect');
    const deleteProductBtn = document.getElementById('deleteProductBtn');

    // Başlangıç Yüklemeleri
    loadProducts();
    loadRate(); // Kayıtlı kuru getir

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

    // Kuru Hafızadan Yükle
    function loadRate() {
        const savedRate = localStorage.getItem('dollarRate');
        if (savedRate) {
            currentRateInput.value = savedRate;
        }
    }

    // Ürün Kaydetme
    saveProductBtn.addEventListener('click', () => {
        const name = newProductName.value.trim();
        const price = parseFloat(newProductPrice.value);

        if (!name || isNaN(price)) {
            alert("Lütfen geçerli bir isim ve Dolar fiyatı girin.");
            return;
        }

        let products = JSON.parse(localStorage.getItem('myProducts')) || {};
        products[name] = price;
        localStorage.setItem('myProducts', JSON.stringify(products));

        alert(`${name} kaydedildi! Fiyat: $${price}`);
        newProductName.value = '';
        newProductPrice.value = '';
        loadProducts();
    });

    // Listeleri Doldurma
    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('myProducts')) || {};
        
        productSelect.innerHTML = '<option value="">Seçiniz...</option>';
        deleteSelect.innerHTML = '<option value="">Seçiniz...</option>';

        for (let [name, price] of Object.entries(products)) {
            // Hesaplama menüsünde dolar fiyatı görünsün
            let option1 = document.createElement('option');
            option1.value = price;
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
        // 1. Değerleri al
        const rate = parseFloat(currentRateInput.value);
        const priceUSD = parseFloat(productSelect.value);
        const w = parseFloat(widthInput.value);
        const h = parseFloat(heightInput.value);

        // 2. Kontroller
        if (isNaN(rate) || rate <= 0) {
            alert("Lütfen geçerli bir Dolar Kuru girin.");
            return;
        }
        if (isNaN(priceUSD) || isNaN(w) || isNaN(h)) {
            resultArea.querySelector('.result-big').textContent = "---";
            alert("Lütfen ürün seçin ve ölçüleri girin.");
            return;
        }

        // 3. Kuru kaydet (bir dahaki sefere hatırlasın)
        localStorage.setItem('dollarRate', rate);

        // 4. Matematik İşlemi
        const area = (w * h) / 10000; // cm² -> m²
        const totalUSD = area * priceUSD; // Dolar bazında toplam
        const totalTL = totalUSD * rate;  // TL bazında toplam

        // 5. Sonuç Formatlama
        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' });
        const fmtUSD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

        // Ekrana Yazdırma
        resultArea.querySelector('.result-big').textContent = fmtTL.format(totalTL);
        usdDetail.innerHTML = `Alan: ${area.toFixed(2)} m² <br> Dolar Karşılığı: ${fmtUSD.format(totalUSD)}`;
    });

    // Ürün Silme
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