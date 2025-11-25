
// ==========================================
// 1. 全域設定與變數
// ==========================================
// 追蹤當前頁碼 (從 0 開始)
let currentPage = 0;
// 預設每頁顯示筆數 12
const pageSize = 12;
// 從後端取得總頁數
let totalPages = 0;

const API_BASE = "http://localhost:8080/api"; // 後端 API 位置

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}
// 紀錄目前的搜尋狀態
let currentMainCategory = ''; // 從網址抓大分類 code
let currentSubCategory = '';
let currentKeyword = '';

// ==========================================
// 2. 頁面初始化 (Entry Point)
// ==========================================
$(document).ready(function () {
    // 從網址列讀取初始大分類，例如 search.html?mainCategory=kitchen
    currentMainCategory = getUrlParameter('mainCategory') || '';

    // 介面初始化：如果有大分類，就載入對應側邊欄
    if (currentMainCategory) {
        loadSidebar(currentMainCategory);
        // 這裡可以設一個暫時的標題，之後可優化成顯示中文名稱
        $("#category-title").text(currentMainCategory.toUpperCase());
    }
    // 初始化價格拉桿 (Ion Range Slider)
    $("#priceRangeSlider").ionRangeSlider({
        type: "double",
        min: 0,
        max: 10000,
        from: 0,
        to: 10000,
        step: 100,
        prefix: "NT$",
        skin: "round"
    });

    // 載入上方大分類的導覽列的函式
    loadMainNavigation();

    // 預設載入第一次商品列表
    loadProducts();

    // 綁定所有按鈕與互動事件
    bindEvents();

    // 左側選單收合動畫 (原有的程式碼)
    $("#collapse").on("click", function () {
        $("#filter").toggleClass("active");
        $(".bi-arrow-bar-left").toggleClass("bi-arrow-bar-right");
        $("#collapse").toggleClass("active");
    });
});

/*
* 載入上方大分類導覽列
*/
function loadMainNavigation() {
    $.ajax({
        url: `${API_BASE}/categories/main`, // 呼叫後端 API
        method: 'GET',
        success: function (categories) {
            let html = '';

            // 選項：全部商品 (讓使用者可以點回首頁或清空篩選)
            html += `
                <li class="category-item ${currentMainCategory === '' ? 'active' : ''}">
                    <a href="search.html">全部商品</a>
                </li>`;

            // 迴圈跑後端回傳的所有大分類
            categories.forEach(cat => {
                // 判斷是否為當前選中的分類 (為了加 highlight 樣式)
                let isActive = (cat.code === currentMainCategory) ? 'active' : '';

                html += `
                <li class="category-item ${isActive}">
                    <a href="search.html?mainCategory=${cat.code}">${cat.cname}</a>
                </li>`;
            });

            $("#main-nav-list").html(html);
        },
        error: function (err) {
            console.error("無法載入主分類導覽", err);
        }
    });
}

// ==========================================
// 3. 功能函式：載入資料
// ==========================================
/*
* 載入側邊欄小分類
* API: /api/categories/main/{code}/sub
*/
function loadSidebar(mainCategoryCode) {
    $.ajax({
        url: `${API_BASE
            }/categories/main/${mainCategoryCode
            }/sub`,
        method: 'GET',
        success: function (subCategories) {
            let html = '';

            // 選項：全部 (不篩選小分類)
            html += `
                    <div class="form-check">
                        <input class="form-check-input category-radio" type="radio" name="subCategory" id="cat-all" value="" checked>
                        <label class="form-check-label" for="cat-all">全部顯示</label>
                    </div>`;

            // 選項：後端回傳的子分類
            subCategories.forEach(cat => {
                // value 帶入 code (例如 'spoon')
                html += `
                        <div class="form-check">
                            <input class="form-check-input category-radio" type="radio" name="subCategory" id="cat-${cat.code}" value="${cat.code}">
                            <label class="form-check-label" for="cat-${cat.code}">${cat.cname}</label>
                        </div>`;
            });

            $("#category-filter").html(html);
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
    // 1. 取得價格範圍
    let slider = $("#priceRangeSlider").data("ionRangeSlider");
    let minPrice = slider ? slider.result.from : null;
    let maxPrice = slider ? slider.result.to : null;

    // 2. 準備參數
    let requestData = {
        mainCategory: currentMainCategory,
        subCategory: currentSubCategory,
        minPrice: minPrice,
        maxPrice: maxPrice,
        keyword: currentKeyword,
        page: currentPage,
        size: pageSize
    };

    // 3. 顯示 Loading 狀態
    $("#product-list").html('<div class="col-12 text-center p-5"><div class="spinner-border text-primary" role="status"></div></div>');

    // 4. 發送 AJAX
    $.ajax({
        url: `${API_BASE
            }/products/search?`,
        method: 'GET',
        data: requestData,
        success: function (response) {
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
                                <h3>${product.pname
            }</h3>
                            </div>
                            <div class="product-price">
                                NT$<span>${product.price
            }</span>
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

    currentPage = pageIndex;
    loadProducts();

    // 回到列表頂端
    $('html, body').animate({
        scrollTop: $("#product-list").offset().top - 100
    },
        300);
}
// 上一頁 / 下一頁
function changePage(delta) {
    let newPage = currentPage + delta;
    goToPage(newPage);
}

// ==========================================
// 4. 事件綁定 (Event Listeners)
// ==========================================
function bindEvents() {
    // A. 監聽「側邊欄分類」點擊 (動態生成元素需用 delegate)
    $(document).on('change', '.category-radio', function () {
        currentSubCategory = $(this).val(); // 取得 value (spoon, pot...)
        currentPage = 0; // 換分類時，重置為第一頁
        loadProducts(); // 重新搜尋
    });

    // B. 監聽「價格確定」按鈕
    // 注意：這裡假設你的 form 按鈕是 submit 類型，我們要阻擋它跳頁
    $("form").on("submit", function (e) {
        e.preventDefault();
        currentPage = 0; // 篩選價格時，重置為第一頁
        loadProducts();
    });

    // C. 監聽上方「搜尋框」輸入 (按下 Enter)
    $(".search-input").on("keyup", function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // 防止 form submit
            currentKeyword = $(this).val();
            currentPage = 0; // 搜尋關鍵字時，重置為第一頁
            loadProducts();
        }
    });

    // D. 監聽上方「搜尋圖示」點擊
    $("#search-icon").parent().on("click", function (e) {
        e.preventDefault();
        currentKeyword = $(".search-input").val();
        currentPage = 0; // 重置為第一頁
        loadProducts();
    });
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