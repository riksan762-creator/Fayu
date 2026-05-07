let allServices = [];

async function loadDashboard() {
    const balanceText = document.getElementById('balance-text');
    const grid = document.getElementById('product-grid');

    // 1. Ambil Saldo
    try {
        const res = await fetch('/api/balance');
        const d = await res.json();
        balanceText.innerText = d.status ? `Rp ${parseInt(d.balance).toLocaleString('id-ID')}` : "Rp 0";
    } catch { balanceText.innerText = "Error"; }

    // 2. Ambil Produk
    try {
        const res = await fetch('/api/services');
        const result = await res.json();
        if(result.status && result.data) {
            allServices = result.data;
            render(allServices);
        } else {
            grid.innerHTML = `<p style="color:white; text-align:center;">${result.message || "Data belum tersedia"}</p>`;
        }
    } catch { grid.innerHTML = "Gagal koneksi backend"; }
}

function render(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = data.map(item => `
        <div class="glass-card card">
            <span class="tag">${item.category}</span>
            <h4 style="margin:10px 0; font-size:14px;">${item.service}</h4>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <b style="color:#0ea5e9;">Rp ${item.price.toLocaleString('id-ID')}</b>
                <button class="btn-buy" style="padding:4px 10px; cursor:pointer;">Beli</button>
            </div>
        </div>
    `).join('');
}

function search() {
    const val = document.getElementById('searchInput').value.toLowerCase();
    render(allServices.filter(s => s.service.toLowerCase().includes(val)));
}

window.onload = loadDashboard;
