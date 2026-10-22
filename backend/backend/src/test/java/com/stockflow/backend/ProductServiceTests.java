package com.stockflow.backend;
import com.stockflow.backend.product.Product;
import com.stockflow.backend.product.ProductRepository;
import com.stockflow.backend.product.ProductService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTests {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    @Test
    void getAllProductsReturnsProductsFromRepository() {
        Product product = new Product();
        product.setName("Wireless Mouse");
        product.setSku("TEST-SKU-001");
        product.setPrice(new java.math.BigDecimal("599.00"));
        product.setQuantity(10);
        product.setReorderLevel(5);

        when(productRepository.findAll()).thenReturn(List.of(product));

        List<Product> products = productService.getAllProducts();

        assertEquals(1, products.size());
        assertEquals("Wireless Mouse", products.get(0).getName());
        assertEquals("TEST-SKU-001", products.get(0).getSku());

        verify(productRepository).findAll();
    }
}

