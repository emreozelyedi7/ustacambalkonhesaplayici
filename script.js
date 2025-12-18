// --- VARSAYILAN ÜRÜN LİSTESİ ---
const defaultProductsData = {
    "Progold 8mm Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { 
        price: 140, 
        img: "1", 
        video: "https://www.instagram.com/reel/CzlHEq1qQLY/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==" 
    },
    "Progold Isıcamlı Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { 
        price: 165, 
        img: "2",
        video: "https://www.instagram.com/reel/Cj7YXuLK2aD/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Progold Isıcamlı Jaluzili Kollu Kasetli Contalı Sistem Katlanır Cam Balkon": { 
        price: 200, 
        img: "4",
        video: "https://www.instagram.com/reel/DOI_7MvCNjO/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Temizlenebilir Giyotin": { 
        price: 240, 
        img: "3",
        video: "https://www.instagram.com/reel/DSFKfGxCAWg/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    },
    "Isıcamlı Sürme Sistem Cam Balkon": { 
        price: 165, 
        img: "5",
        video: "https://www.instagram.com/reel/CbJE-S_q2F2/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA=="
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // ELEMENTLER
    const navCalc = document.getElementById('nav-calc');
    const navSettings = document.getElementById('nav-settings');
    const calcSection = document.getElementById('calc-section');
    const settingsSection = document.getElementById('settings-section');
    
    const currentRateInput = document.getElementById('currentRate');
    const customerNameInput = document.getElementById('customerName'); // YENİ
    const productSelect = document.getElementById('productSelect');
    
    const widthContainer = document.getElementById('width-container');
    const addWidthBtn = document.getElementById('addWidthBtn');
    const resetInputsBtn = document.getElementById('resetInputsBtn'); 
    
    const heightInput = document.getElementById('height');
    
    const calculateBtn = document.getElementById('calculateBtn');
    const downloadBtn = document.getElementById('downloadBtn'); 
    const shareBtn = document.getElementById('shareBtn');
    const shareVideoBtn = document.getElementById('shareVideoBtn');
    
    // RAPOR BUTONLARI
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
            customerNameInput.value = ''; // İsim de silinsin
            resultArea.querySelector('.result-big').textContent = '0.00 ₺';
            detailInfo.innerHTML = '';
            downloadBtn.style.display = 'none';
            shareBtn.style.display = 'none';
            shareVideoBtn.style.display = 'none'; 
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

    function smartRound(amount) {
        let integerPart = Math.floor(amount);
        let thousands = Math.floor(integerPart / 1000) * 1000;
        let remainder = integerPart % 1000;
        if (remainder === 0) { return integerPart; } 
        else if (remainder <= 500) { return thousands + 500; } 
        else { return thousands + 1000; }
    }

    function checkAndLoadDefaults() {
        if (!localStorage.getItem('myProductsV4')) {
            localStorage.setItem('myProductsV4', JSON.stringify(defaultProductsData));
        }
        loadProducts();
    }

    window.resetDefaultProducts = function() {
        if(confirm("Tüm listeniz silinecek ve varsayılan ürünler (Linkli) yüklenecek. Onaylıyor musunuz?")) {
            localStorage.setItem('myProductsV4', JSON.stringify(defaultProductsData));
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

        let products = JSON.parse(localStorage.getItem('myProductsV4')) || {};
        products[name] = { price: price, img: imgName, video: videoLink };
        localStorage.setItem('myProductsV4', JSON.stringify(products));

        alert(`${name} kaydedildi!`);
        newProductName.value = ''; newProductImage.value = ''; newProductVideo.value = ''; newProductPrice.value = '';
        loadProducts();
    });

    function loadProducts() {
        let products = JSON.parse(localStorage.getItem('myProductsV4')) || {};
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

    // --- RAPORLAMA FONKSİYONLARI ---
    function addToReport(customer, product, area, price) {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        const newReport = {
            date: new Date().toLocaleString('tr-TR'),
            customer: customer || "İsimsiz Müşteri",
            product: product,
            area: area,
            price: price
        };
        reports.push(newReport);
        localStorage.setItem('dailyReports', JSON.stringify(reports));
    }

    downloadReportBtn.addEventListener('click', () => {
        let reports = JSON.parse(localStorage.getItem('dailyReports')) || [];
        if (reports.length === 0) {
            alert("Henüz kayıtlı bir rapor yok.");
            return;
        }

        // CSV Başlıkları
        let csvContent = "Tarih,Musteri Adi,Urun,m2,Fiyat\n";

        reports.forEach(row => {
            // CSV'de virgül karışıklığı olmasın diye verileri tırnak içine alıyoruz
            let rowString = `"${row.date}","${row.customer}","${row.product}","${row.area}","${row.price}"`;
            csvContent += rowString + "\n";
        });

        // Türkçe Karakter Sorunu İçin BOM ekliyoruz (\uFEFF)
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


    // --- HESAPLAMA ---
    calculateBtn.addEventListener('click', () => {
        const rate = parseFloat(currentRateInput.value);
        let selectedData = productSelect.value ? JSON.parse(productSelect.value) : null;
        const custName = customerNameInput.value.trim(); // Müşteri Adı
        
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

        let realArea = (totalWidth * h) / 10000; 
        let pricingHeight = h;
        let pricingArea = realArea;
        const productName = selectedData.name.toLowerCase();

        if (productName.includes("cam balkon")) {
            if (h < 180) {
                pricingHeight = 180;
                pricingArea = (totalWidth * pricingHeight) / 10000;
            }
            if (pricingArea < 5) pricingArea = 5;
        }
        else if (productName.includes("giyotin")) {
            if (pricingArea < 7) pricingArea = 7;
        }

        const rawTotalTL = (pricingArea * selectedData.price) * rate; 
        const roundedTotalTL = smartRound(rawTotalTL);

        const fmtTL = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0, maximumFractionDigits: 0 });
        const formattedPrice = fmtTL.format(roundedTotalTL);
        const formattedArea = realArea.toFixed(2);

        resultArea.querySelector('.result-big').textContent = formattedPrice;
        detailInfo.innerHTML = `Hesaplanan Alan: ${formattedArea} m² <br> Ham Tutar: ${new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(rawTotalTL)}`;

        if(downloadBtn) downloadBtn.style.display = 'block';
        if(shareBtn) shareBtn.style.display = 'block';
        if(shareVideoBtn) shareVideoBtn.style.display = 'block'; 

        // --- RAPORA EKLE ---
        addToReport(custName, selectedData.name, formattedArea, formattedPrice);

        lastCalculation = {
            productName: selectedData.name,
            productImg: selectedData.img, 
            productVideo: selectedData.video || "",
            area: formattedArea,
            totalPrice: formattedPrice, 
            details: `(En: ${totalWidth}cm x Boy: ${h}cm)`
        };
    });

    // --- LİNK PAYLAŞMA ---
    if(shareVideoBtn) {
        shareVideoBtn.addEventListener('click', async () => {
            if (!lastCalculation || !lastCalculation.productVideo) {
                alert("Bu ürün için video linki yok.");
                return;
            }
            const videoUrl = lastCalculation.productVideo;
            const shareData = {
                title: lastCalculation.productName,
                text: `${lastCalculation.productName} Tanıtım Videosu:\n${videoUrl}`
            };

            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (err) { console.log("İptal"); }
            } else {
                navigator.clipboard.writeText(`${lastCalculation.productName} Video: ${videoUrl}`);
                alert("Link kopyalandı.");
            }
        });
    }

    // --- A4 GÖRSEL OLUŞTURUCU (DEĞİŞMEDİ) ---
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

        let textY = 320; 
        ctx.fillStyle = '#333333';
        const fontSize = 40; 
        ctx.font = `bold ${fontSize}px Segoe UI, Arial`;
        
        const productName = lastCalculation.productName;
        const maxWidth = 950;
        const lineHeight = 50;

        const words = productName.split(' ');
        let line = '';
        for(let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
                ctx.fillText(line, width / 2, textY);
                line = words[n] + ' ';
                textY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, width / 2, textY);

        const boxY = 450;
        const boxWidth = 900;
        const boxHeight = 600; 
        const boxX = (width - boxWidth) / 2;

        const imgName = lastCalculation.productImg;
        const productImgObj = new Image();
        productImgObj.src = imgName + ".jpg"; 

        await new Promise((resolve) => {
            productImgObj.onload = resolve;
            productImgObj.onerror = resolve; 
        });

        if (productImgObj.complete && productImgObj.naturalWidth !== 0) {
            const hRatio = boxWidth / productImgObj.naturalWidth;
            const vRatio = boxHeight / productImgObj.naturalHeight;
            const ratio = Math.min(hRatio, vRatio);
            
            const newImgWidth = productImgObj.naturalWidth * ratio;
            const newImgHeight = productImgObj.naturalHeight * ratio;

            const centerShift_x = (boxWidth - newImgWidth) / 2;
            const centerShift_y = (boxHeight - newImgHeight) / 2;
            
            ctx.drawImage(productImgObj, 
                0, 0, productImgObj.naturalWidth, productImgObj.naturalHeight,
                boxX + centerShift_x, boxY + centerShift_y, newImgWidth, newImgHeight);
        }

        let detailsY = 1100;
        ctx.beginPath();
        ctx.moveTo(200, detailsY);
        ctx.lineTo(880, detailsY);
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 5;
        ctx.stroke();

        detailsY += 60;
        ctx.fillStyle = '#666666';
        ctx.font = '50px Segoe UI, Arial';
        ctx.fillText(`Toplam Alan: ${lastCalculation.area} m²`, width / 2, detailsY);
        
        detailsY += 50;
        ctx.font = 'italic 30px Segoe UI, Arial';
        ctx.fillText(lastCalculation.details, width / 2, detailsY);

        detailsY += 100; 
        ctx.fillStyle = '#28a745'; 
        ctx.font = 'bold 120px Segoe UI, Arial';
        ctx.fillText(lastCalculation.totalPrice, width / 2, detailsY);

        const footerHeight = 200;
        const footerY = height - footerHeight;
        ctx.fillStyle = '#F37021'; 
        ctx.fillRect(0, footerY, width, footerHeight);

        ctx.fillStyle = '#ffffff'; 
        ctx.font = 'bold 40px Segoe UI, Arial';
        ctx.fillText("SİSTEMLERİMİZ 5 YIL GARANTİLİDİR", width / 2, footerY + 80);

        ctx.font = '32px Segoe UI, Arial';
        ctx.fillText("Tüm kartlara peşin fiyatına 5 taksit fırsatı", width / 2, footerY + 140);

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
            let products = JSON.parse(localStorage.getItem('myProductsV4')) || {};
            delete products[nameToDelete];
            localStorage.setItem('myProductsV4', JSON.stringify(products));
            loadProducts();
        }
    });
});