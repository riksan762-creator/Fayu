let services = [];

async function loadDashboard() {
    // 1. Ambil Saldo
    const resBal = await fetch('/api/balance');
    const dataBal = await resBal.json();
    if(dataBal.status) {
        document.getElementById('balance-text').innerText = `Rp ${dataBal.data.balance.toLocaleString('id-ID')}`;
    }

    // 2. Ambil Layanan
    const resServ = await fetch('/api/services');
    const dataServ = await resServ.json();
    if(dataServ.status) {
        services = dataServ.data;
        render(services.slice(0, 50));
    }
}

function render(data) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = data.map(item => `
        <div class="glass-card card">
            <span class="tag">${item.category}</span>
            <h4>${item.service}</h4>
            <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
            <button class="btn-buy">Pesan</button>
        </div>
    `).join('');
}

window.onload = loadDashboard;
