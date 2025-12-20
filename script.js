/* REALCAMBALKON HESAPLAMA MOTORU - V19 GÜNCEL
   - Yükseklik sınırı 3.70 (370cm) olarak güncellendi.
   - 8 metre (800cm) üzeri genişliklerde sistem 3 parçaya bölünüyor.
*/

document.addEventListener('DOMContentLoaded', function() {
    const hesaplaBtn = document.getElementById('hesaplaBtn');
    if (hesaplaBtn) {
        hesaplaBtn.addEventListener('click', hesapla);
    }
});

// ÜRÜN BİRİM FİYATLARI VE MOTOR MALİYETLERİ
const URUNLER = {
    'giyotin_8mm': { ad: 'Giyotin 8mm (Tek Cam)', fiyat: 4500 },
    'giyotin_isi': { ad: 'Giyotin Isıcamlı', fiyat: 5500 },
    'surme_isi':   { ad: 'Isıcamlı Sürme', fiyat: 4200 },
    'katlanir_std':{ ad: 'Katlanır Cam (Standart)', fiyat: 3200 },
    'katlanir_isi':{ ad: 'Katlanır Cam (Isıcamlı)', fiyat: 3800 }
};

// SABİT GİDERLER
const MOTOR_UCRETI = 3500; // Adet başı motor fiyatı
const KUMANDA_UCRETI = 500; // Sistem başı kumanda

function hesapla() {
    // 1. GİRDİLERİ AL (Virgüllü girişi noktaya çevirip sayıya dönüştürür)
    let genislikStr = document.getElementById('genislik').value.replace(',', '.');
    let yukseklikStr = document.getElementById('yukseklik').value.replace(',', '.');
    let urunTipi = document.getElementById('urunTipi').value;

    let genislik = parseFloat(genislikStr);
    let yukseklik = parseFloat(yukseklikStr);

    // HATA KONTROLÜ
    if (isNaN(genislik) || isNaN(yukseklik) || genislik <= 0 || yukseklik <= 0) {
        alert("Lütfen geçerli bir Genişlik ve Yükseklik değeri giriniz.");
        return;
    }

    // --- GÜNCELLEME 1: YÜKSEKLİK SINIRI 3.70 (370 CM) ---
    // Kullanıcı cm giriyorsa 370, metre giriyorsa 3.70 kontrolü
    let limitYukseklik = 370; 
    
    // Eğer kullanıcı yanlışlıkla metre girdiyse (örn: 3.5) bunu cm olarak algılatmayalım, 
    // ama genelde cam balkon sektöründe cm kullanılır. Biz yine de 370 cm üstü için uyarı verelim.
    if (yukseklik > limitYukseklik) {
        alert("DİKKAT: Yükseklik 370 cm (3.70m) üzerindedir! Bu ölçü garanti kapsamı dışına çıkabilir.");
        // İşlemi durdurmak istersen buraya 'return;' yazabilirsin.
    }

    // --- GÜNCELLEME 2: PARÇA SAYISI VE BÖLÜMLEME ---
    let parcaSayisi = 1;

    // Eğer Genişlik 800 cm (8 metre) üzerindeyse -> 3 Parça
    if (genislik > 800) {
        parcaSayisi = 3;
    }
    // Eğer Genişlik 450 cm (4.5 metre) üzerindeyse (ve 800'den küçükse) -> 2 Parça
    else if (genislik > 450) {
        parcaSayisi = 2;
    }
    // 450 cm altı -> 1 Parça (Standart)
    else {
        parcaSayisi = 1;
    }

    // 2. ALAN VE FİYAT HESAPLAMA
    // Genişlik ve Yükseklik CM cinsinden ise m2'ye çeviriyoruz: (En x Boy) / 10.000
    let metrekare = (genislik * yukseklik) / 10000;

    // Seçilen ürünün m2 fiyatını al
    let secilenUrun = URUNLER[urunTipi];
    if (!secilenUrun) {
        alert("Lütfen bir ürün seçiniz.");
        return;
    }

    let camBalkonFiyati = metrekare * secilenUrun.fiyat;
    let toplamMotorTutar = 0;
    let kumandaTutar = 0;

    // Eğer Giyotin sistemse Motor ve Kumanda ekle
    if (urunTipi.includes('giyotin')) {
        toplamMotorTutar = parcaSayisi * MOTOR_UCRETI;
        kumandaTutar = KUMANDA_UCRETI; // Tek kumanda yeterli mi yoksa parça başı mı? Genelde tek.
    }

    // GENEL TOPLAM
    let genelToplam = camBalkonFiyati + toplamMotorTutar + kumandaTutar;

    // 3. SONUCU EKRANA YAZDIR
    const sonucDiv = document.getElementById('sonucAlani');
    
    sonucDiv.innerHTML = `
        <div class="hesap-ozeti" style="background:#f9f9f9; padding:15px; border-radius:8px; border:1px solid #ddd;">
            <h3 style="margin-top:0; color:#2c3e50;">Hesaplama Sonucu</h3>
            <p><strong>Ürün:</strong> ${secilenUrun.ad}</p>
            <p><strong>Ölçüler:</strong> ${genislik} x ${yukseklik} cm = <strong>${metrekare.toFixed(2)} m²</strong></p>
            <p><strong>Sistem Bölümleme:</strong> ${parcaSayisi} Parça 
               ${parcaSayisi > 1 ? `(Ortalama ${(genislik/parcaSayisi).toFixed(0)} cm)` : ''}
            </p>
            <hr>
            <p>Cam/Profil Tutarı: ${camBalkonFiyati.toLocaleString('tr-TR')} TL</p>
            ${urunTipi.includes('giyotin') ? `<p>Motor Tutarı (${parcaSayisi} Adet): ${toplamMotorTutar.toLocaleString('tr-TR')} TL</p>` : ''}
            <h2 style="color:#d35400; margin-bottom:0;">TOPLAM: ${genelToplam.toLocaleString('tr-TR', {maximumFractionDigits: 0})} TL</h2>
        </div>
    `;
    
    sonucDiv.style.display = 'block';
}