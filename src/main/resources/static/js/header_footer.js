console.log("header.js loaded");
$(document).ready(function () {
    // Scroll Effect
    $(window).scroll(function () {
        if ($(this).scrollTop() > 20) {
            $('#header-wrapper').addClass('scrolled');
        } else {
            $('#header-wrapper').removeClass('scrolled');
        }
    });

    // Search Toggle
    $('#search-toggle').click(function (e) {
        e.preventDefault();
        $('#search-drawer').slideToggle(300, function () {
            // Focus input when opened
            if ($(this).is(':visible')) {
                $('#search-input').focus();
            }
        });
    });

    // Close search when clicking outside (optional UX improvement)
    $(document).mouseup(function (e) {
        var container = $("#search-drawer");
        var button = $("#search-toggle");

        // If the target of the click isn't the container nor a descendant of the container
        // And not the toggle button itself
        if (!container.is(e.target) && container.has(e.target).length === 0 &&
            !button.is(e.target) && button.has(e.target).length === 0) {
            if (container.is(':visible')) {
                container.slideUp(300);
            }
        }
    });
});

// C. 監聽上方「搜尋框」輸入 (按下 Enter)
$("#search-input").on("keyup", function (e) {
    if (e.key === 'Enter') {
        e.preventDefault(); // 防止 form submit
        currentKeyword = $(this).val();
        currentPage = 0; // 搜尋關鍵字時，重置為第一頁
        loadProducts();
        $("#search-drawer").slideUp(300);
    }
});

// D. 監聽上方「搜尋圖示」點擊
$("#search-icon").parent().on("click", function (e) {
    e.preventDefault();
    currentKeyword = $(".search-input").val();
    currentPage = 0; // 重置為第一頁
    loadProducts();
    $("#search-drawer").slideUp(300);
});