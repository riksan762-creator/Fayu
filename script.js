let allServices = [];

// FORMAT HARGA
function formatPrice(price) {
    return Number(price || 0).toLocaleString("id-ID");
}

// LOAD DATA
async function initApp() {

    const grid =
        document.getElementById("product-grid");

    grid.innerHTML = `
        <div class="loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>Loading Services...</span>
        </div>
    `;

    try {

        const response =
            await fetch(`/api/services?t=${Date.now()}`);

        const result =
            await response.json();

        console.log(result);

        // AMBIL ARRAY YANG BENAR
        let services =
            result.data || result.services || [];

        if (!Array.isArray(services)) {
            services = [];
        }

        // SORT CATEGORY + NAME
        services.sort((a, b) => {

            const catA =
                (a.category || "").toLowerCase();

            const catB =
                (b.category || "").toLowerCase();

            if (catA < catB) return -1;
            if (catA > catB) return 1;

            return (a.name || "")
                .localeCompare(b.name || "");
        });

        allServices = services;

        renderProducts(allServices);

    } catch (err) {

        console.error(err);

        grid.innerHTML = `
            <div class="error-box">
                Gagal mengambil layanan
            </div>
        `;
    }
}

// RENDER PRODUK
function renderProducts(data) {

    const grid =
        document.getElementById("product-grid");

    if (!data.length) {

        grid.innerHTML = `
            <div class="error-box">
                Produk tidak ditemukan
            </div>
        `;

        return;
    }

    grid.innerHTML = data.map(item => {

        return `
            <div class="product-card">

                <div class="card-header">

                    <span class="category">
                        ${item.category || "General"}
                    </span>

                    <h3>
                        ${item.name || "No Name"}
                    </h3>

                </div>

                <div class="card-body">

                    <div class="info-grid">

                        <div class="info-item">
                            <small>Min</small>
                            <strong>${formatPrice(item.min)}</strong>
                        </div>

                        <div class="info-item">
                            <small>Max</small>
                            <strong>${formatPrice(item.max)}</strong>
                        </div>

                    </div>

                    <div class="price">
                        Rp ${formatPrice(item.price)}
                    </div>

                    <input
                        type="text"
                        class="input"
                        placeholder="Username / Link"
                    >

                    <input
                        type="number"
                        class="input"
                        placeholder="Jumlah Pesanan"
                        min="${item.min || 0}"
                        max="${item.max || 999999}"
                    >

                    <button class="btn-order">
                        <i class="fa-solid fa-cart-shopping"></i>
                        Order Sekarang
                    </button>

                </div>

            </div>
        `;

    }).join("");
}

// SEARCH
function searchService() {

    const query =
        document.getElementById("searchInput")
        .value
        .toLowerCase();

    const filtered =
        allServices.filter(item => {

            return (
                (item.name || "")
                .toLowerCase()
                .includes(query)

                ||

                (item.category || "")
                .toLowerCase()
                .includes(query)
            );
        });

    renderProducts(filtered);
}

// START
window.onload = initApp;
