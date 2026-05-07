let servicesCache = [];

async function initSawargiPay() {
    const grid = document.getElementById('product-grid');
    
    // Tampilkan Skeleton (Loading Animasi) agar profesional
    grid.innerHTML = Array(6).fill('<div class="loading-card"></div>').join('');

    // 1. Ambil Saldo
    fetch(`/api/balance?t=${Date.now()}`)
        .then(r => r.json())
        .then(d => {
            if(d.status) document.getElementById('balance-text').innerText = `Rp ${parseInt(d.balance).toLocaleString('id-ID')}`;
        });

    // 2. Ambil Produk
    try {
        const res = await fetch(`/api/services?t=${Date.now()}`);
        const result = await res.json();

        if (result.status) {
            servicesCache = result.data;
            render(servicesCache);
        } else {
            grid.innerHTML = `<p style="text-align:center;grid-column:1/-1">⚠️ ${result.message}</p>`;
        }
    } catch {
        grid.innerHTML = `<p style="text-align:center;grid-column:1/-1">❌ Error koneksi API.</p>`;
    }
}

function render(data) {
    const grid = document.getElementById('product-grid');
    if (data.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1">Produk tidak ditemukan...</p>';
        return;
    }

    grid.innerHTML = data.map(item => `
        <div class="card">
            <span class="tag">${item.category}</span>
            <h4>${item.name}</h4>
            <p class="price-tag">Rp ${item.price.toLocaleString('id-ID')}</p>
            <button class="btn-buy" onclick="checkout('${item.id}', '${item.name}')">
                <i class="fa-solid fa-cart-shopping"></i> Beli Sekarang
            </button>
        </div>
    `).join('');
}

function search() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = servicesCache.filter(s => 
        s.name.toLowerCase().includes(query) || 
        s.category.toLowerCase().includes(query)
    );
    render(filtered);
}

function checkout(id, name) {
    const msg = `Halo SawargiPay, saya ingin memesan:\nLayanan: ${name}\nID: ${id}\n\nMohon diproses, terima kasih.`;
    window.location.href = `https://wa.me/628XXXXXXXXXX?text=${encodeURIComponent(msg)}`;
}

window.onload = initSawargiPay;
