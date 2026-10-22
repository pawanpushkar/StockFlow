package com.stockflow.backend.product;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ProductNotFoundException(
                                "Product not found with ID: " + id));
    }

    public Product createProduct(Product product) {
        if (productRepository.existsBySku(product.getSku())) {
            throw new IllegalArgumentException(
                    "A product with this SKU already exists");
        }

        return productRepository.save(product);
    }

public Product updateProduct(Long id, Product updatedProduct) {
    Product existing = getProductById(id);

    productRepository.findBySku(updatedProduct.getSku())
            .filter(product -> !product.getId().equals(id))
            .ifPresent(product -> {
                throw new IllegalArgumentException(
                        "A product with this SKU already exists");
            });

    existing.setName(updatedProduct.getName());
    existing.setSku(updatedProduct.getSku());
    existing.setPrice(updatedProduct.getPrice());
    existing.setQuantity(updatedProduct.getQuantity());
    existing.setReorderLevel(updatedProduct.getReorderLevel());

    return productRepository.save(existing);
}



    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }
}