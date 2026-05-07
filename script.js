let allServices = [];
let activeCategory = 'Semua';
let isLoading = false;

// =============================================
// INISIALISASI APLIKASI
// =============================================
async function initApp() {
    showLoadingState();

    try {
        const response = await fetch(`/api/services?t=${Date.now()}`);
        const result = await response.json();

        if (result.status && result.data) {
            allServices = result.data;
            buildCategoryTabs(allServices);
            renderProducts(allServices);
            updateCounter(allServices.length);
        } else {
            showError(result.message || 'Data tidak tersedia.');
        }
    } catch (error) {
        showError('Gagal terhubung ke server. Coba refresh halaman.');
    }
}

// =============================================
// LOADING & ERROR STATE
// =============================================
function showLoadingState() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat layanan...</p>
        </div>
    `;
}

function showError(msg) {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Oops!</h3>
            <p>${msg}</p>
            <button class="btn-retry" onclick="initApp()">Coba Lagi</button>
        </div>
    `;
}

// =============================================
// CATEGORY TABS (auto-generate dari data)
// =============================================
function buildCategoryTabs(data) {
    const categories = ['Semua', ...new Set(data.map(s => s.category))];
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) return;

    tabsContainer.innerHTML = categories.map(cat => `
        <button 
            class="cat-tab ${cat === 'Semua' ? 'active' : ''}" 
            onclick="filterByCategory('${cat}')"
            data-cat="${cat}">
            ${getCategoryIcon(cat)} ${cat}
        </button>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        'Semua': '🌐',
        'Instagram': '📸',
        'TikTok': '🎵',
        'Facebook': '👥',
        'YouTube': '▶️',
        'Twitter': '🐦',
        'Telegram': '✈️',
        'Spotify': '🎧',
        'Google': '🔍',
    };
    // cek partial match
    for (const [key, icon] of Object.entries(icons)) {
        if (category.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return '⚡';
}

function filterByCategory(cat) {
    activeCategory = cat;

    // Update active tab
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });

    const query = document.getElementById('searchInput')?.value.toLowerCase() || '';
    applyFilters(cat, query);
}

// =============================================
// PENCARIAN
// =============================================
function searchService() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    applyFilters(activeCategory, query);
}

function applyFilters(category, query) {
    let filtered = allServices;

    if (category !== 'Semua') {
        filtered = filtered.filter(s => s.category === category);
    }

    if (query) {
        filtered = filtered.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.category.toLowerCase().includes(query)
        );
    }

    renderProducts(filtered);
    updateCounter(filtered.length);
}

function updateCounter(count) {
    const el = document.getElementById('result-count');
    if (el) el.textContent = `${count} layanan ditemukan`;
}

// =============================================
// RENDER PRODUK
// =============================================
function renderProducts(data) {
    const grid = document.getElementById('product-grid');

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Tidak Ditemukan</h3>
                <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map((item, index) => `
        <div class="product-card" style="animation-delay:${index * 30}ms">
            <div class="card-header">
                <span class="cat-badge">${getCategoryIcon(item.category)} ${item.category}</span>
                <span class="product-id">#${item.id}</span>
            </div>
            <div class="card-body">
                <h3 class="product-name">${item.name}</h3>
                ${item.description ? `<p class="product-desc">${formatDesc(item.description)}</p>` : ''}
            </div>
            <div class="card-meta">
                ${item.min ? `<span class="meta-item">📦 Min: ${Number(item.min).toLocaleString('id-ID')}</span>` : ''}
                ${item.max ? `<span class="meta-item">📦 Max: ${Number(item.max).toLocaleString('id-ID')}</span>` : ''}
                ${item.refill == 1 ? `<span class="meta-item refill">🔄 Refill</span>` : ''}
            </div>
            <div class="card-footer">
                <div class="product-price">
                    <span class="price-label">Harga</span>
                    <span class="price-value">Rp ${formatPrice(item.price)}</span>
                </div>
                <button class="btn-buy" onclick="handleOrder('${item.id}', \`${escapeForAttr(item.name)}\`, ${item.price})">
                    <i class="fa-solid fa-cart-shopping"></i> Pesan
                </button>
            </div>
        </div>
    `).join('');
}

// =============================================
// HELPER FORMAT
// =============================================
function formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return price;
    return num.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDesc(desc) {
    // Bersihkan "- " list jadi lebih rapi
    return desc
        .replace(/\\r\\n/g, '\n')
        .replace(/\r\n/g, '\n')
        .split('\n')
        .filter(line => line.trim())
        .slice(0, 3) // Max 3 baris
        .map(line => `<span>${line.trim()}</span>`)
        .join('');
}

function escapeForAttr(str) {
    return str.replace(/`/g, '\\`').replace(/\$/g, '\\$');
}

// =============================================
// ORDER VIA WHATSAPP
// =============================================
function handleOrder(id, name, price) {
    const adminWA = "628123456789"; // GANTI NOMOR WA ADMIN
    const priceFormatted = parseFloat(price).toLocaleString('id-ID');

    const text =
        `Halo Admin SawargiPay! 👋\n\n` +
        `Saya ingin memesan layanan:\n` +
        `━━━━━━━━━━━━━━━━━━\n` +
        `📦 *Layanan:* ${name}\n` +
        `🆔 *ID Produk:* ${id}\n` +
        `💵 *Harga:* Rp ${priceFormatted}\n` +
        `━━━━━━━━━━━━━━━━━━\n\n` +
        `Mohon info selanjutnya untuk pembayaran. Terima kasih!`;

    window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(text)}`, '_blank');
}

// =============================================
// JALANKAN
// =============================================
window.onload = initApp;
