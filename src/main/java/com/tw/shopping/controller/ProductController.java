package com.tw.shopping.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tw.shopping.entity.ProductEntity;
import com.tw.shopping.service.ProductService;


@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {
    @Autowired
    private ProductService productService;

    // 網址範例: /api/products/search?mainCategory=kitchen&minPrice=100&keyword=刀
    @GetMapping("/search")
    public Page<ProductEntity> search(
        // required = false 代表這些參數是可選的，沒傳就是 null
        // 大分類
        @RequestParam(required = false) String mainCategory,
        // 小分類
        @RequestParam(required = false) String subCategory,
        // 最大金額
        @RequestParam(required = false) Integer maxPrice,
        // 最小金額
        @RequestParam(required = false) Integer minPrice,
        // 搜尋關鍵字
        @RequestParam(required = false) String keyword,
        // 預設頁碼 : 從 0 開始
        @RequestParam(defaultValue = "0") Integer page,
        //  預設每頁顯示的商品數量
        @RequestParam(defaultValue = "12") Integer size,
        // 排序
        @RequestParam(defaultValue = "default") String sort
    ) {
        return productService.searchProducts(mainCategory, subCategory, maxPrice, minPrice, keyword, page, size, sort);
    }
}
