package com.tw.shopping.service;

import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tw.shopping.entity.CategoryEntity;
import com.tw.shopping.repository.CategoryRepository;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryEntity> getSubCategoriesByMainCategory(String mainCategoryCode){
        // 找出大分類的 code
        CategoryEntity mainCategory = categoryRepository.findByCode(mainCategoryCode);

        // 如果找不到 ID 回傳空字串
        if (mainCategory == null) {
            return Collections.emptyList();
        }

        return categoryRepository.findByParentId(mainCategory.getCategoryId());

    }

    // 取得所有 parentId 是 null (大分類)的
    public List<CategoryEntity> getMainCategories() {
        return categoryRepository.findByParentId(null);
    }
}
