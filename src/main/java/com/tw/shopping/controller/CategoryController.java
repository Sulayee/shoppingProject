package com.tw.shopping.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tw.shopping.entity.CategoryEntity;
import com.tw.shopping.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @GetMapping("/main")
    public List<CategoryEntity> getMainCateGories() {
        return categoryService.getMainCategories();
    }
    
    @GetMapping("/main/{code}/sub")
    public List<CategoryEntity> getSubCategories(@PathVariable("code") String code) {
        return categoryService.getSubCategoriesByMainCategory(code);
    }
    
}
