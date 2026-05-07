let allServices = [];

async function loadDashboard() {
    const grid = document.getElementById('product-grid');
    const balanceText = document.getElementById('balance-text');

    // Ambil Saldo
    fetch(`/api/balance?t=${Date.now()}`)
        .then(res => res.json())
        .then(d => {
            balanceText.innerText = d.status ? `Rp ${parseInt(d.balance).toLocaleString('id-ID')}` : "Rp 0";
        }).catch(() => balanceText.innerText = "Offline");

    // Ambil Produk
    try {
        const res = await fetch(`/api/services?t=${Date.now()}`);
        const result = await res.json();

        if (result.status && result.data) {
            allServices = result.data;
            render(allServices);
        } else {
            grid.innerHTML = `<div class="loading-state"><p>⚠️ ${result.message}</p></div>`;
        }
    } catch (e) {
        grid.innerHTML = `<div class="loading-state"><p>❌ Gagal memuat data dari API</p></div>`;
    }
}

function render(data) {
    const grid = document.getElementById('product-grid');
    if(data.length === 0) return;

    grid.innerHTML = data.map(item => `
        <div class="card">
            <div>
                <span class="tag">${item.category}</span>
                <h4>${item.service}</h4>
            </div>
            <div class="price-row">
                <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
                <button class="btn-buy" onclick="alert('Layanan siap dipesan!')">Beli</button>
            </div>
        </div>
    `).join('');
}

function search() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allServices.filter(s => s.service.toLowerCase().includes(input));
    render(filtered);
}

window.onload = loadDashboard;
