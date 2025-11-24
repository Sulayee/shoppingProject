package com.tw.shopping.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tw.shopping.entity.CategoryEntity;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Integer>{
    // 用code 去找大分類
    CategoryEntity findByCode(String code);

    // 用 parentId 找子分類列表 (找出所有屬於該大分類的小項目)
    List<CategoryEntity> findByParentId(Integer parentId); 
}