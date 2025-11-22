package com.tw.shopping.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "product")
@Data
public class ProductEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "productid")
	private Integer productId;
	
	private String pname;
	
	private String description;
	
	private Integer price;
	
	@Column(name = "product_image")
	private String productImage;
	
	private String color;
	
	private String specification;
	
	private Integer rating;
	
	private String stock;
	
	@CreationTimestamp
	@Column(name = "createdat", updatable = false)
	private LocalDateTime createdAt;
	
	@UpdateTimestamp
	@Column(name = "updatedat")
	private LocalDateTime updatedAt;
	
//	---------------------------------------------
	
	@ManyToOne
	@JoinColumn(name = "categoryid")
	@JsonBackReference
	private CategoryEntity category;
}
