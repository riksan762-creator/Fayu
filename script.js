let allServices = [];

async function loadDashboard() {
    const grid = document.getElementById('product-grid');
    const balanceText = document.getElementById('balance-text');

    // Load Saldo secara mandiri
    fetch('/api/balance')
        .then(res => res.json())
        .then(data => {
            if(data.status) {
                balanceText.innerText = `Rp ${parseInt(data.data.balance).toLocaleString('id-ID')}`;
            } else { balanceText.innerText = "Error Saldo"; }
        }).catch(() => balanceText.innerText = "Offline");

    // Load Produk
    grid.innerHTML = '<div class="loading">Menghubungkan ke SawargiPay...</div>';
    
    try {
        const res = await fetch('/api/services');
        const result = await res.json();

        if (result.status) {
            allServices = result.data;
            render(allServices);
        } else {
            grid.innerHTML = `<div class="error-card">⚠️ ${result.message}</div>`;
        }
    } catch (e) {
        grid.innerHTML = `<div class="error-card">❌ Gagal terhubung ke API Vercel</div>`;
    }
}

function render(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = data.map(item => `
        <div class="glass-card card">
            <span class="tag">${item.category}</span>
            <h4>${item.service}</h4>
            <div class="price-row">
                <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
                <button class="btn-buy" onclick="alert('Layanan ID ${item.id} Siap Dipesan!')">Beli</button>
            </div>
        </div>
    `).join('');
}

function search() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allServices.filter(i => i.service.toLowerCase().includes(input));
    render(filtered);
}

window.onload = loadDashboard;
