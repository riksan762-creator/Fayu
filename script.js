let allServices = [];

// Fungsi Muat Data
async function initApp() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '<div class="loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Menyiapkan Layanan Terbaik...</div>';

    try {
        // Panggil API Backend Anda
        const response = await fetch(`/api/services?t=${Date.now()}`);
        const result = await response.json();

        if (result.status && result.data) {
            allServices = result.data;
            renderProducts(allServices);
        } else {
            grid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">⚠️ ${result.message}</p>`;
        }
    } catch (error) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">❌ Gagal terhubung ke server.</p>';
    }
}

// Fungsi Render Kartu
function renderProducts(data) {
    const grid = document.getElementById('product-grid');
    
    if (data.length === 0) {
        grid.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Produk tidak ditemukan.</p>';
        return;
    }

    grid.innerHTML = data.map(item => `
        <div class="product-card">
            <div>
                <div class="cat-badge">${item.category}</div>
                <h3>${item.name}</h3>
            </div>
            <div>
                <div class="product-price">Rp ${item.price.toLocaleString('id-ID')}</div>
                <button class="btn-buy" onclick="handleOrder('${item.id}', '${item.name}', ${item.price})">
                    <i class="fa-solid fa-cart-shopping"></i> Beli Sekarang
                </button>
            </div>
        </div>
    `).join('');
}

// Fungsi Order WhatsApp
function handleOrder(id, name, price) {
    const adminWA = "628123456789"; // GANTI DENGAN NOMOR WA ANDA
    const text = `Halo Admin SawargiPay,\n\nSaya ingin memesan layanan berikut:\n` +
                 `━━━━━━━━━━━━━━━━━━\n` +
                 `📦 *Layanan:* ${name}\n` +
                 `🆔 *ID Produk:* ${id}\n` +
                 `💵 *Harga:* Rp ${price.toLocaleString('id-ID')}\n` +
                 `━━━━━━━━━━━━━━━━━━\n\n` +
                 `Mohon instruksi selanjutnya untuk pembayaran.`;
    
    const url = `https://wa.me/${adminWA}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// Fungsi Pencarian
function searchService() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allServices.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.category.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}

// Jalankan saat halaman dibuka
window.onload = initApp;
