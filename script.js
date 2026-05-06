// Variable global untuk menyimpan data agar pencarian (search) lancar
let allServices = [];

async function loadDashboard() {
    const grid = document.getElementById('product-grid');
    const balanceText = document.getElementById('balance-text');

    try {
        // 1. Ambil Saldo Server secara paralel
        fetch('/api/balance')
            .then(res => res.json())
            .then(data => {
                if(data.status && data.data) {
                    balanceText.innerText = `Rp ${data.data.balance.toLocaleString('id-ID')}`;
                } else {
                    balanceText.innerText = "Error API";
                }
            })
            .catch(() => balanceText.innerText = "Koneksi Gagal");

        // 2. Ambil Daftar Layanan SMM
        grid.innerHTML = '<p class="loading">Sedang menyinkronkan data pusat...</p>';
        
        const response = await fetch('/api/services');
        const result = await response.json();

        if (result.status && result.data) {
            allServices = result.data;
            render(allServices); // Tampilkan produk
        } else {
            // Menampilkan pesan error spesifik dari backend jika ada (misal: IP Blocked)
            grid.innerHTML = `
                <div class="glass-card error-box">
                    <p>❌ Produk Tidak Muncul</p>
                    <small>${result.message || "Pastikan Whitelist IP di Dashboard Pusat sudah dikosongkan."}</small>
                </div>`;
        }
    } catch (error) {
        grid.innerHTML = '<p class="error-box">Gagal terhubung ke server backend Vercel.</p>';
    }
}

// Fungsi untuk menampilkan produk ke dalam HTML
function render(data) {
    const grid = document.getElementById('product-grid');
    
    if (data.length === 0) {
        grid.innerHTML = '<p class="error-box">Layanan tidak ditemukan.</p>';
        return;
    }

    grid.innerHTML = data.map(item => `
        <div class="glass-card card">
            <div class="card-header">
                <span class="tag">${item.category}</span>
                <span class="id-service">ID: ${item.id}</span>
            </div>
            <h4>${item.service}</h4>
            <div class="card-footer">
                <p class="price">Rp ${parseInt(item.price).toLocaleString('id-ID')}</p>
                <button class="btn-buy" onclick="pesanLayanan('${item.id}', '${item.service}')">Pesan</button>
            </div>
        </div>
    `).join('');
}

// Fungsi Pencarian (Search) Otomatis
function search() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allServices.filter(item => 
        item.service.toLowerCase().includes(keyword) || 
        item.category.toLowerCase().includes(keyword)
    );
    render(filtered);
}

// Fungsi Placeholder untuk Tombol Pesan
function pesanLayanan(id, name) {
    alert(`Layanan: ${name}\nID: ${id}\n\nFitur pemesanan langsung sedang disinkronkan dengan saldo SawargiPay Anda!`);
}

// Jalankan saat halaman dibuka
window.onload = loadDashboard;
