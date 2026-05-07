// Global variable untuk pencarian
let allServices = [];

// Fungsi Utama Load Data
async function loadDashboard() {
    console.log("Memulai sinkronisasi SawargiPay...");
    const grid = document.getElementById('product-grid');
    const balanceText = document.getElementById('balance-text');

    // 1. Ambil Saldo
    try {
        const resBal = await fetch('/api/balance');
        const dataBal = await resBal.json();
        
        if (dataBal.status && dataBal.data) {
            balanceText.innerText = `Rp ${parseInt(dataBal.data.balance).toLocaleString('id-ID')}`;
            console.log("Saldo berhasil dimuat.");
        } else {
            balanceText.innerText = "Gagal Load";
            console.error("API Saldo Error:", dataBal.message);
        }
    } catch (err) {
        balanceText.innerText = "Koneksi Error";
        console.error("Fetch Saldo Gagal:", err);
    }

    // 2. Ambil Layanan SMM
    grid.innerHTML = '<div class="loading">Sedang mengambil ribuan produk...</div>';
    
    try {
        const resServ = await fetch('/api/services');
        
        // Cek jika response server tidak 200
        if (!resServ.ok) {
            throw new Error(`Server Vercel Error: ${resServ.status}`);
        }

        const dataServ = await resServ.json();

        if (dataServ.status && Array.isArray(dataServ.data)) {
            allServices = dataServ.data;
            render(allServices);
            console.log(`Berhasil memuat ${allServices.length} layanan.`);
        } else {
            grid.innerHTML = `<div class="error-msg">❌ Gagal: ${dataServ.message || "Data Kosong"}</div>`;
            console.error("API Services Error:", dataServ);
        }
    } catch (err) {
        grid.innerHTML = `<div class="error-msg">❌ Gangguan Koneksi: ${err.message}</div>`;
        console.error("Fetch Services Gagal:", err);
    }
}

// Fungsi Menampilkan Produk ke HTML
function render(data) {
    const grid = document.getElementById('product-grid');
    
    if (data.length === 0) {
        grid.innerHTML = '<p style="text-align:center">Layanan tidak ditemukan.</p>';
        return;
    }

    // Menggunakan fragment agar render ribuan data lebih cepat & tidak lag
    const html = data.map(item => `
        <div class="glass-card card">
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span class="tag">${item.category}</span>
                <span style="font-size:10px; opacity:0.5;">ID: ${item.id}</span>
            </div>
            <h4 style="font-size:14px; margin:10px 0;">${item.service}</h4>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:15px;">
                <p class="price" style="font-weight:bold; color:#0ea5e9;">Rp ${parseInt(item.price).toLocaleString('id-ID')}</p>
                <button class="btn-buy" style="padding:5px 15px; border-radius:8px; cursor:pointer;" onclick="order('${item.id}')">Beli</button>
            </div>
        </div>
    `).join('');
    
    grid.innerHTML = html;
}

// Fungsi Search
function search() {
    const input = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allServices.filter(item => 
        item.service.toLowerCase().includes(input) || 
        item.category.toLowerCase().includes(input)
    );
    render(filtered);
}

// Fungsi Klik Beli
function order(id) {
    alert("Proses Pemesanan ID: " + id + "\nFitur ini sedang dikoneksikan ke Database SawargiPay!");
}

// Jalankan otomatis
window.onload = loadDashboard;
