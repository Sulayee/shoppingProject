package com.tw.shopping.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tw.shopping.entity.CategoryEntity;
import com.tw.shopping.service.CategoryService;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    // 取得所有大分類 (nav上面的那排)
    @GetMapping("/main")
    public List<CategoryEntity> getMainCateGories() {
        return categoryService.getMainCategories();
    }
    
    // 使用者點選大分類之後取得其底下的小分類
    @GetMapping("/main/{code}/sub")
    public List<CategoryEntity> getSubCategories(@PathVariable("code") String code) {
        return categoryService.getSubCategoriesByMainCategory(code);
    }
}
