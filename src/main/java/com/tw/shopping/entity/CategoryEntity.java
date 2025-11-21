package com.tw.shopping.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "category")
@Data
public class CategoryEntity {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "categoryid")
	private Integer categoryId;
	
	@Column(name = "cname")
	private String cname;
	
	@Column(name = "code")
	private String code;
	
	@Column(name = "parentid")
	private String parentId;
	
//	-------------------------
	
	@OneToMany(mappedBy = "category")
	private List<ProductEntity> products;
	
}
