package com.tw.shopping.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.tw.shopping.entity.CategoryEntity;
import com.tw.shopping.entity.ProductEntity;
import com.tw.shopping.repository.CategoryRepository;
import com.tw.shopping.repository.ProductRepository;

import jakarta.persistence.criteria.Predicate;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    // 用來查大分類的 ID
    @Autowired
    private CategoryRepository categoryRepository;

    public List<ProductEntity> searchProducts(String mainCategoryCode, String subCategoryCode, Integer minPrice, Integer maxPrice, String keyword){

        Specification<ProductEntity> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 當使用者選了小分類的篩選
            if (StringUtils.hasText(subCategoryCode)) {
                // 用 SQL 查詢把品項跟點選的Code相同的給拉出來 因為 code 在 category的表所以要先get到category在 get code
                predicates.add(cb.equal(root.get("category").get("code"), subCategoryCode));
            }

            // 使用者選擇大分類還沒選小分類
            else if (StringUtils.hasText(mainCategoryCode)) {
                // 用大分類的 code 找到他的 ID
                CategoryEntity mainCat = categoryRepository.findByCode(mainCategoryCode);

                // 找出所有 ID 等於所選的大分類的商品
                if (mainCat != null) {
                    predicates.add(cb.equal(root.get("category").get("parentId"), mainCat.getCategoryId()));
                }
            }

            // 價格範圍
            // 找出所有大於最小金額的商品
            if (minPrice != null){
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }
            // 找出所以小於最大金額的商品
            if (maxPrice != null){
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            // Keyword 搜尋
            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword + "%";
                Predicate nameLike = cb.like(root.get("pname"), likePattern);
                Predicate descLike = cb.like(root.get("description"), likePattern);
                predicates.add(cb.or(nameLike, descLike));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return productRepository.findAll(spec);
    }
}
