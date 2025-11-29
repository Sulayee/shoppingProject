
// ==========================================
// 1. 全域設定與變數
// ==========================================

let searchState = {
    // 紀錄目前的搜尋狀態
    mainCategory: '', // 大分類 
    subCategory: '', // 小分類
    maxPrice: null, // 最大金額
    minPrice: null, // 最小金額
    keyword: '', // 搜索欄關鍵字
    page: 0, // 追蹤當前頁碼 (從 0 開始)
    size: 12, // 預設每頁顯示筆數 12    
    sort: 'default' // 排序
};

let totalPages = 0; // 總頁數
const API_BASE = "/api"; // 後端 API 位置


// ==========================================
// 2. 頁面初始化 (Entry Point)
// ==========================================
$(document).ready(function () {
    // 從 URL 讀取並初始化 searchState
    initStateFromURL();

    // 介面初始化 確保價格拉桿使用 searchState 的值
    initPriceSlider()

    // 載入上方大分類的導覽列的函式
    loadMainNavigation();

    // 介面初始化：如果有大分類，就載入對應側邊欄
    if (searchState.mainCategory) {
        loadSidebar(searchState.mainCategory);
        // 這裡可以設一個暫時的標題，之後可優化成顯示中文名稱
        $("#category-title").text(searchState.mainCategory.toUpperCase());
    }

    // 預設載入第一次商品列表
    loadProducts();

    // 綁定所有按鈕與互動事件
    bindEvents();

    // 左側選單收合動畫 (原有的程式碼)
    $("#collapse").on("click", function () {
        $("#filter").toggleClass("active");
        $(".bi-arrow-bar-right").toggleClass("bi-arrow-bar-left");
        $("#collapse").toggleClass("active");
    });
});

/**
 * 從 URL 讀取參數到 searchState
 */
function initStateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);

    // 把網址上的值填入我們的狀態物件，如果沒有就維持預設值
    searchState.mainCategory = urlParams.get('mainCategory') || searchState.mainCategory;
    searchState.subCategory = urlParams.get('subCategory') || searchState.subCategory;
    searchState.maxPrice = urlParams.get('maxPrice') ? parseInt(urlParams.get('maxPricee')) : searchState.maxPrice;
    searchState.minPrice = urlParams.get('minPrice') ? parseInt(urlParams.get('minPricee')) : searchState.minPrice;
    searchState.keyword = urlParams.get("keyword") || searchState.keyword;
    searchState.page = urlParams.get('page') ? parseInt(urlParams.get('page')) : searchState.page;
    searchState.size = urlParams.get('size') ? parseInt(urlParams.get('size')) : searchState.size;
    searchState.sort = urlParams.get('sort') || searchState.sort;

    console.log("URL初始化狀態:", searchState);
}

/*
 * 將 searchState 寫回 URL (不刷新頁面)
 * 實現 URL 同步的關鍵
 */
function updateUrl() {
    const params = new URLSearchParams();

    // 只有當值非空、非預設值時，才寫入 URL (保持網址乾淨)
    if (searchState.mainCategory) params.set('mainCategory', searchState.mainCategory);
    if (searchState.subCategory) params.set('subCategory', searchState.subCategory);
    if (searchState.maxPrice) params.set('maxPrice', searchState.maxPrice);
    if (searchState.minPrice) params.set('minPrice', searchState.minPrice);
    if (searchState.keyword) params.set('keyword', searchState.keyword);
    if (searchState.page) params.set('page', searchState.page);
    if (searchState.sort) params.set('sort', searchState.sort);

    const newUrl = `${window.location.pathname}?${params.toString()}`;

    // 使用 pushState 更新瀏覽器網址列
    window.history.pushState(searchState, '', newUrl);

    // 重新載入商品
    loadProducts();
}

/*
* 載入上方大分類導覽列
*/
function loadMainNavigation() {
    $.ajax({
        url: `${API_BASE}/categories/main`, // 呼叫後端 API
        method: 'GET',
        success: function (categories) {
            let html = '';
            const currentCode = searchState.mainCategory; // <-- 使用 searchState.mainCategory


            // 選項：全部商品 (讓使用者可以點回首頁或清空篩選)
            html += `
                <li class="category-item ${currentCode === '' ? 'active' : ''}">
                    <a href="#" data-code="" class="main-category-link">全部商品</a>
                </li>`;

            // 迴圈跑後端回傳的所有大分類
            categories.forEach(cat => {
                // 判斷是否為當前選中的分類 (為了加 highlight 樣式)
                let isActive = (cat.code === currentCode) ? 'active' : '';

                // 注意：這裡改用 onclick 函數和 data-code 來處理，不再使用直接的 href
                html += `
                <li class="category-item ${isActive}">
                    <a href="#" data-code="${cat.code}" class="main-category-link">${cat.cname}</a>
                </li>`;
            });

            $("#main-nav-list").html(html);

            // 綁定主分類的點擊事件 (需在生成 HTML 後進行)
            $(".main-category-link").on('click', function (e) {
                e.preventDefault();
                const newMainCat = $(this).data('code');
                onMainCategoryClick(newMainCat);
            });
        },
        error: function (err) {
            console.error("無法載入主分類導覽", err);
        }
    });
}

/*
 * 初始化價格拉桿
 */
function initPriceSlider() {
    // 確保價格從 URL 讀取到，如果沒有就用預設的最大最小值
    const toVal = searchState.maxPrice !== null ? searchState.maxPrice : 10000;
    const fromVal = searchState.minPrice !== null ? searchState.minPrice : 0;

    $("#priceRangeSlider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 10000,
        from: fromVal,
        to: toVal,
        step: 100,
        prefix: "NT$",
        skin: "round",
        // 價格變動完成，更新 URL 和搜尋
        onFinish: function (data) {
            // 點擊後，更新 searchState
            searchState.minPrice = data.from;
            searchState.maxPrice = data.to;
            searchState.page = 0; // 重設頁碼
            updateUrl(); // 更新 URL 並重新搜尋
        }
    });

    // 如果從 URL 讀取了價格，需要讓排序下拉選單同步顯示
    if (searchState.sort && searchState.sort !== 'default') {
        $("#sortSelect").val(searchState.sort);
    }
}

// ==========================================
// 3. 功能函式：載入資料
// ==========================================
/*
* 載入側邊欄小分類
* API: /api/categories/main/{code}/sub
*/
function loadSidebar(subCategoryCode) {
    $.ajax({
        url: `${API_BASE}/categories/main/${subCategoryCode}/sub`,
        method: 'GET',
        success: function (subCategories) {
            let html = '';
            const currentSubCode = searchState.subCategory; // <-- 使用 searchState.subCategory

            // 選項：全部 (不篩選小分類)
            let isAllActive = currentSubCode === '' ? 'checked' : '';
            html += `
                    <div class="form-check">
                        <input class="form-check-input category-radio" type="radio" name="subCategory" id="cat-all" value="" ${isAllActive}>
                        <label class="form-check-label" for="cat-all">全部顯示</label>
                    </div>`;

            // 選項：後端回傳的子分類
            subCategories.forEach(cat => {
                let isActive = (cat.code === currentSubCode) ? 'checked' : '';
                // value 帶入 code (例如 'spoon')
                html += `
                        <div class="form-check">
                            <input class="form-check-input category-radio" type="radio" name="subCategory" id="cat-${cat.code}" value="${cat.code}" ${isActive}>
                            <label class="form-check-label" for="cat-${cat.code}">${cat.cname}</label>
                        </div>`;
            });

            $("#category-filter").html(html);

            $("#category-filter").off('change', '.category-radio').on('change', '.category-radio', onSubCategoryChange);
        },
        error: function (err) {
            console.error("載入側邊欄失敗", err);
            $("#category-filter").html('<div class="text-danger">無法載入分類</div>');
        }
    });
}
/**
* 載入商品列表 (核心搜尋功能)
* API: /api/products/search
*/
function loadProducts() {
    // 準備參數
    let requestData = {
        mainCategory: searchState.mainCategory,
        subCategory: searchState.subCategory,
        maxPrice: searchState.maxPrice,
        minPrice: searchState.minPrice,
        keyword: searchState.keyword,
        page: searchState.page,
        size: searchState.size,
        sort: searchState.sort
    };

    // 顯示 Loading 狀態
    $("#product-list").html('<div class="col-12 text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>');

    // 發送 AJAX
    $.ajax({
        url: `${API_BASE}/products/search?`,
        method: 'GET',
        data: requestData,
        success: function (response) {

            console.log("後端回傳 response =", response);

            // 改成 response 是因為後端改成了 Page 物件
            // 更新全域總頁數
            totalPages = response.totalPages;

            // 渲染商品
            renderProductCards(response.content);

            // 渲染分頁按鈕 (傳入: 當前頁碼, 總頁數)
            renderPagination(response.number, response.totalPages);


        },
        error: function (err) {
            console.error("搜尋商品失敗", err);
            $("#product-list").html('<div class="col-12 text-center text-danger">載入商品發生錯誤，請稍後再試。</div>');
            // 隱藏分頁
            $("#pagination-nav").hide;
        }
    });
}

/*
* 渲染 HTML：把 JSON 資料轉成商品卡片
*/

function renderProductCards(products) {
    let container = $("#product-list");
    container.empty(); // 清空 loading

    if (!products || products.length === 0) {
        container.html('<div class="col-12 text-center mt-5"><h4 class="text-muted">沒有找到符合條件的商品</h4></div>');
        return;
    }

    products.forEach(product => {
        // 處理圖片 (如果沒有圖片，顯示預設圖)
        let imgUrl = product.productImage ? product.productImage : 'https: //dummyimage.com/400x400/dee2e6/6c757d.jpg&text=No+Image';

        let cardHtml = `
                <div class="col-lg-4 col-md-4 mb-4">
                    <div class="product-box">
                        <div class="product-inner-box position-relative">
                            <div class="icons position-absolute">
                                <a href="#" class="text-decoration-none text-dark"><i class="bi bi-suit-heart"></i></a>
                                <a href="#" class="text-decoration-none text-dark"><i class="bi bi-eye"></i></a>
                            </div>
                            <img src="${imgUrl}" alt="${product.pname}" class="img-fluid" style="height: 250px; width:100%; object-fit: cover;">
                            
                            <div class="cart-btn">
                                <button class="btn bg-white shadow-sm rounded-pill" onclick="addToCart(${product.productId})">
                                    <i class="bi bi-cart-plus"></i> 加入購物車
                                </button>
                            </div>
                        </div> 
                        <div class="product-info mt-3">
                            <div class="product-name">
                                <h3>${product.pname}</h3>
                            </div>
                            <p>${product.description}</p>
                            <div class="product-price">
                                NT$<span>${product.price}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        container.append(cardHtml);
    });

    // 重新綁定 hover 特效 (因為元素是新長出來的)
    bindHoverEffects();
}
// 分頁邏輯

function renderPagination(current, totalPages) {
    const $nav = $("#pagination-nav");
    const $pageNumbers = $("#pageNumbers");
    const $prevBtn = $("#prevPageItem");
    const $nextBtn = $("#nextPageItem");

    // 如果只有 1 頁或沒資料，不顯示分頁條
    if (totalPages <= 1) {
        $nav.hide();
        return;
    }
    $nav.show();

    // 清空舊頁碼
    $pageNumbers.empty();

    // 設定上一頁按鈕狀態 (如果當前是第0頁，就 disabled)
    if (current === 0) {
        $prevBtn.addClass("disabled");
    } else {
        $prevBtn.removeClass("disabled");
    }
    // 設定下一頁按鈕狀態
    if (current === totalPages - 1) {
        $nextBtn.addClass("disabled");
    } else {
        $nextBtn.removeClass("disabled");
    }
    // 計算要顯示哪些頁碼 (最多顯示 5 個數字)
    const maxPagesToShow = 5;
    let startPage = Math.max(0, current - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow && totalPages >= maxPagesToShow) {
        startPage = Math.max(0, endPage - maxPagesToShow + 1);
    }
    // 產生頁碼 HTML
    for (let i = startPage; i <= endPage; i++) {
        // i + 1 是因為顯示給使用者看要從 1 開始，但程式邏輯是 0
        let activeClass = (i === current) ? 'active' : '';
        let pageHtml = `
                    <li class="page-item ${activeClass}">
                        <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i + 1
            }</a>
                    </li>
                `;
        $pageNumbers.append(pageHtml);
    }
}
// 跳轉到指定頁面
function goToPage(pageIndex) {
    // 防止超出範圍
    if (pageIndex < 0 || pageIndex >= totalPages) return;

    searchState.page = pageIndex;

    updateUrl();

    // 回到列表頂端
    $('html, body').animate({
        scrollTop: $("#product-list").offset().top - 100
    }, 300);
}
// 上一頁 / 下一頁
function changePage(delta) {
    let newPage = searchState.page + delta;
    goToPage(newPage);
}

// ==========================================
// 4. 事件綁定 (Event Listeners)
// ==========================================

// 點擊主分類的事件處理 (新函式)
function onMainCategoryClick(newMainCat) {
    // 1. 更新狀態
    searchState.mainCategory = newMainCat;
    searchState.subCategory = ''; // 切換主分類通常要清空次分類
    searchState.page = 0; // 重設頁碼

    // 2. 更新 URL 並搜尋
    updateUrl();

    // 3. 重新載入上方導覽列
    loadMainNavigation();

    // 4. 重新載入介面 (側邊欄)
    if (searchState.mainCategory) {
        loadSidebar(searchState.mainCategory);
        $("#category-title").text(searchState.mainCategory.toUpperCase());
    } else {
        $("#category-title").text("所有商品");
        $("#category-filter").empty(); // 清空側邊欄
    }
}

// 點擊次分類的事件處理 (新函式，專門給 delegate 用)
function onSubCategoryChange() {
    // 1. 更新狀態
    // 從被點擊的 radio 取得 value
    searchState.subCategory = $(this).val();
    searchState.page = 0; // 換分類通常要回到第一頁

    // 2. 更新 URL 並搜尋 (關鍵：將次分類條件寫入網址)
    updateUrl();
}

// 點擊排序的事件處理
function onSortChange() {
    // 1. 更新狀態
    searchState.sort = $(this).val();
    searchState.page = 0; // 排序變了，重設頁碼

    // 2. 更新 URL 並搜尋
    updateUrl();
}

function bindEvents() {
    // 監聽「側邊欄分類」點擊 (動態生成元素需用 delegate)
    // 這裡我們需要把事件綁定移到 loadSidebar 的 success 裡面，
    // 這樣可以確保 UI 正確地使用 searchState 的初始值，然後再綁定。
    // 這裡先保留綁定，但請注意，如果 subCategory 是動態載入的，建議用 bindSubCategoryEvents
    // 監聽「價格確定」按鈕 (如果 form 內沒有 button，建議用獨立按鈕監聽)
    // 這裡我們把價格的更新邏輯移到 initPriceSlider 的 onFinish 裡面了，這裡的 submit 可以刪除或改成關鍵字搜索。

    // 假設你的 form 是用來做關鍵字搜索
    $("form").on("submit", function (e) {
        e.preventDefault();
        // 1. 從輸入框取得關鍵字 (假設輸入框 ID 是 #keywordInput)
        const keywordInput = $("#keywordInput").val(); // 你可能需要確認這個 ID

        // 2. 更新狀態
        searchState.keyword = keywordInput;
        searchState.page = 0; // 重新搜尋時，重設頁碼

        // 3. 更新 URL 並搜尋
        updateUrl();
    });

    // 監聽「排序」按鈕
    $("#sortSelect").on('change', onSortChange);
}

// 獨立綁定子分類事件 (在 loadSidebar 成功後呼叫)
function bindSubCategoryEvents() {
    $(document).on('change', '.category-radio', onSubCategoryChange);
}

// 綁定 CSS Hover 效果
function bindHoverEffects() {
    $('.product-box').hover(
        function () {
            $(this).addClass('is-hover');
        },
        function () {
            $(this).removeClass('is-hover');
        }
    );
}
// 購物車功能 (預留)
function addToCart(productId) {
    alert("已加入購物車 ID: " + productId);
    // 這裡之後可以寫 AJAX 呼叫後端加入購物車 API
}