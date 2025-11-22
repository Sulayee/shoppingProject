package com.tw.shopping.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tw.shopping.entity.ProductEntity;
import com.tw.shopping.service.ProductService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/products")
public class ProductController {
    @Autowired
    private ProductService productService;

    @GetMapping("/search")
    public List<ProductEntity> search(
        // required = false 代表這些參數是可選的，沒傳就是 null
        @RequestParam(required = false) String mainCategory,
        @RequestParam(required = false) String subCategory,
        @RequestParam(required = false) Integer maxPrice,
        @RequestParam(required = false) Integer minPrice,
        @RequestParam(required = false) String keyword
    ) {
        return productService.searchProducts(mainCategory, subCategory, minPrice, maxPrice, keyword);
    }
}
