package com.stockflow.backend;

import com.stockflow.backend.movement.MovementType;
import com.stockflow.backend.movement.StockMovement;
import com.stockflow.backend.movement.StockMovementRepository;
import com.stockflow.backend.movement.StockMovementService;
import com.stockflow.backend.product.Product;
import com.stockflow.backend.product.ProductNotFoundException;
import com.stockflow.backend.product.ProductRepository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockMovementServiceTests {

    @Mock
    private StockMovementRepository movementRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private StockMovementService stockMovementService;

    private Product product;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setName("Wireless Mouse");
        product.setSku("TEST-SKU-001");
        product.setPrice(new BigDecimal("599.00"));
        product.setQuantity(40);
        product.setReorderLevel(10);
    }

    @Test
    void stockInIncreasesProductQuantity() {
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(movementRepository.save(any(StockMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StockMovement movement = stockMovementService.recordMovement(
                1L, MovementType.IN, 10, "Supplier delivery");

        assertEquals(50, product.getQuantity());
        assertEquals(MovementType.IN, movement.getType());
        assertEquals(10, movement.getQuantity());

        verify(productRepository).save(product);
        verify(movementRepository).save(any(StockMovement.class));
    }

    @Test
    void stockOutDecreasesProductQuantity() {
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        when(movementRepository.save(any(StockMovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        StockMovement movement = stockMovementService.recordMovement(
                1L, MovementType.OUT, 5, "Customer order");

        assertEquals(35, product.getQuantity());
        assertEquals(MovementType.OUT, movement.getType());
        assertEquals(5, movement.getQuantity());
    }

    @Test
    void stockOutRejectsInsufficientQuantity() {
        when(productRepository.findById(1L))
                .thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.recordMovement(
                        1L, MovementType.OUT, 50, "Large order"));

        assertTrue(exception.getMessage().contains("Insufficient stock"));
        assertEquals(40, product.getQuantity());

        verify(productRepository, never()).save(any(Product.class));
        verify(movementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    void movementRejectsZeroQuantity() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.recordMovement(
                        1L, MovementType.IN, 0, "Invalid quantity"));

        assertTrue(exception.getMessage().contains("greater than zero"));

        verify(productRepository, never()).findById(anyLong());
        verify(movementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    void movementRejectsMissingProduct() {
        when(productRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(
                ProductNotFoundException.class,
                () -> stockMovementService.recordMovement(
                        99L, MovementType.IN, 5, "Test"));

        verify(movementRepository, never()).save(any(StockMovement.class));
    }

    @Test
    void movementRejectsMissingMovementType() {
        assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.recordMovement(
                        1L, null, 5, "Test"));

        verify(productRepository, never()).findById(anyLong());
    }

    @Test
    void movementRejectsMissingProductId() {
        assertThrows(
                IllegalArgumentException.class,
                () -> stockMovementService.recordMovement(
                        null, MovementType.IN, 5, "Test"));

        verify(productRepository, never()).findById(anyLong());
    }
}

