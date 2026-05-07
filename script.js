/* =============================================
   SAWARGI PAY — script.js
   Auto order ke API, modal, filter, search
   ============================================= */

let allServices = [];
let activeCategory = 'Semua';
let currentOrder = {};

// =============================================
// INIT
// =============================================
async function initApp() {
    showLoading();
    try {
        const res = await fetch(`/api/services?t=${Date.now()}`);
        const result = await res.json();

        if (result.status && Array.isArray(result.data) && result.data.length > 0) {
            allServices = result.data;
            buildCategoryTabs(allServices);
            renderProducts(allServices);
            updateCounter(allServices.length);

            const totalEl = document.getElementById('stat-total');
            if (totalEl) totalEl.textContent = allServices.length.toLocaleString('id-ID');
        } else {
            showError(result.message || 'Produk tidak tersedia saat ini.');
        }
    } catch (err) {
        showError('Gagal terhubung ke server. Periksa koneksi internet kamu.');
    }
}

// =============================================
// LOADING & ERROR
// =============================================
function showLoading() {
    document.getElementById('product-grid').innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Memuat layanan...</p>
        </div>
    `;
}

function showError(msg) {
    document.getElementById('product-grid').innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">⚠️</div>
            <h3>Gagal Memuat</h3>
            <p>${msg}</p>
            <button class="btn-retry" onclick="initApp()">Coba Lagi</button>
        </div>
    `;
}

// =============================================
// CATEGORY TABS
// =============================================
function buildCategoryTabs(data) {
    const tabsEl = document.getElementById('category-tabs');
    if (!tabsEl) return;

    const categories = ['Semua', ...new Set(data.map(s => s.category).filter(Boolean))];

    tabsEl.innerHTML = categories.map(cat => `
        <button class="cat-tab ${cat === 'Semua' ? 'active' : ''}"
            onclick="filterByCategory('${cat}')"
            data-cat="${cat}">
            ${getCatIcon(cat)} ${cat}
        </button>
    `).join('');
}

function getCatIcon(cat) {
    const map = {
        instagram: '📸', tiktok: '🎵', facebook: '👥',
        youtube: '▶️', twitter: '🐦', telegram: '✈️',
        spotify: '🎧', google: '🔍', twitter_x: '𝕏',
        semua: '🌐', discord: '💬', linkedin: '💼',
        threads: '🧵', snapchat: '👻',
    };
    const key = cat.toLowerCase().replace(/\s+/g, '_');
    for (const [k, v] of Object.entries(map)) {
        if (key.includes(k)) return v;
    }
    return '⚡';
}

function filterByCategory(cat) {
    activeCategory = cat;
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });
    applyFilters();
}

// =============================================
// SEARCH
// =============================================
function searchService() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('searchClear');
    if (clearBtn) clearBtn.style.display = input.value ? 'flex' : 'none';
    applyFilters();
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    document.getElementById('searchClear').style.display = 'none';
    applyFilters();
}

function applyFilters() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    let filtered = allServices;

    if (activeCategory !== 'Semua') {
        filtered = filtered.filter(s => s.category === activeCategory);
    }

    if (query) {
        filtered = filtered.filter(s =>
            (s.name || '').toLowerCase().includes(query) ||
            (s.category || '').toLowerCase().includes(query)
        );
    }

    renderProducts(filtered);
    updateCounter(filtered.length);
}

function updateCounter(count) {
    const el = document.getElementById('result-count');
    if (el) el.textContent = `${count.toLocaleString('id-ID')} layanan ditemukan`;
}

// =============================================
// RENDER PRODUK
// =============================================
function renderProducts(data) {
    const grid = document.getElementById('product-grid');

    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>Tidak Ditemukan</h3>
                <p>Coba kata kunci lain atau pilih kategori berbeda.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = data.map((item, i) => `
        <div class="product-card" style="animation-delay:${Math.min(i * 25, 400)}ms" onclick="openModal('${item.id}')">
            <div class="card-top">
                <span class="cat-badge">${getCatIcon(item.category)} ${item.category}</span>
                <span class="product-id">#${item.id}</span>
            </div>
            <p class="product-name">${sanitize(item.name)}</p>
            <div class="product-meta">
                ${item.min ? `<span class="meta-chip">Min: ${Number(item.min).toLocaleString('id-ID')}</span>` : ''}
                ${item.max ? `<span class="meta-chip">Max: ${Number(item.max).toLocaleString('id-ID')}</span>` : ''}
                ${item.refill == 1 ? `<span class="meta-chip refill">🔄 Refill</span>` : ''}
            </div>
            <div class="card-footer">
                <div class="price-wrap">
                    <span class="price-label">Harga/1000</span>
                    <span class="price-value">Rp ${formatPrice(item.price)}</span>
                </div>
                <button class="btn-order" onclick="event.stopPropagation(); openModal('${item.id}')">
                    <i class="fa-solid fa-cart-shopping"></i> Order
                </button>
            </div>
        </div>
    `).join('');
}

// =============================================
// MODAL ORDER
// =============================================
function openModal(serviceId) {
    const item = allServices.find(s => String(s.id) === String(serviceId));
    if (!item) return;

    currentOrder = { ...item };

    document.getElementById('modal-title').textContent = item.name;
    document.getElementById('modal-category').textContent = `${getCatIcon(item.category)} ${item.category}`;
    document.getElementById('modal-price').textContent = `Rp ${formatPrice(item.price)}`;
    document.getElementById('modal-min').textContent = Number(item.min || 0).toLocaleString('id-ID');
    document.getElementById('modal-max').textContent = Number(item.max || 0).toLocaleString('id-ID');
    document.getElementById('qty-range').textContent = `(${Number(item.min||0).toLocaleString('id-ID')} - ${Number(item.max||0).toLocaleString('id-ID')})`;

    const qtyInput = document.getElementById('order-qty');
    qtyInput.value = '';
    qtyInput.min = item.min || 1;
    qtyInput.max = item.max || 999999;

    document.getElementById('order-link').value = '';
    document.getElementById('order-total').textContent = 'Rp 0';
    document.getElementById('order-status').style.display = 'none';
    document.getElementById('btn-submit').disabled = false;
    document.getElementById('btn-submit').innerHTML = '<i class="fa-solid fa-paper-plane"></i> Proses Order Sekarang';

    document.getElementById('order-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('order-modal').classList.remove('active');
    document.body.style.overflow = '';
}

function closeModalOutside(e) {
    if (e.target === document.getElementById('order-modal')) closeModal();
}

function calcTotal() {
    const qty = parseInt(document.getElementById('order-qty').value) || 0;
    const price = parseFloat(currentOrder.price) || 0;
    const total = (qty / 1000) * price;
    document.getElementById('order-total').textContent = `Rp ${formatPrice(Math.ceil(total))}`;
}

// =============================================
// SUBMIT ORDER KE API
// =============================================
async function submitOrder() {
    const link  = document.getElementById('order-link').value.trim();
    const qty   = parseInt(document.getElementById('order-qty').value);
    const min   = parseInt(currentOrder.min) || 1;
    const max   = parseInt(currentOrder.max) || 999999;

    if (!link) return showStatus('error', '⚠️ Masukkan link atau username target terlebih dahulu.');
    if (!qty || qty < min) return showStatus('error', `⚠️ Jumlah minimum order adalah ${min.toLocaleString('id-ID')}.`);
    if (qty > max) return showStatus('error', `⚠️ Jumlah maksimum order adalah ${max.toLocaleString('id-ID')}.`);

    const btn = document.getElementById('btn-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Memproses...';
    showStatus('loading', '⏳ Mengirim order ke sistem...');

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                service: currentOrder.id,
                link:    link,
                quantity: qty
            })
        });

        const result = await res.json();

        if (result.status || result.order || result.id) {
            const orderId = result.order || result.id || result.order_id || '—';
            showStatus('success', `✅ Order berhasil! ID Order: <strong>#${orderId}</strong><br>Pesananmu sedang diproses otomatis.`);
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Order Terkirim!';
        } else {
            const errMsg = result.error || result.message || 'Order gagal, coba lagi.';
            showStatus('error', `❌ ${errMsg}`);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Proses Order Sekarang';
        }
    } catch (err) {
        showStatus('error', '❌ Koneksi gagal. Periksa internet dan coba lagi.');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Proses Order Sekarang';
    }
}

function showStatus(type, html) {
    const el = document.getElementById('order-status');
    el.className = `order-status ${type}`;
    el.innerHTML = html;
    el.style.display = 'block';
}

// =============================================
// HELPER
// =============================================
function formatPrice(price) {
    const n = parseFloat(price);
    if (isNaN(n)) return '0';
    return n.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function sanitize(str) {
    return String(str || '').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Close modal on ESC
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

window.onload = initApp;
