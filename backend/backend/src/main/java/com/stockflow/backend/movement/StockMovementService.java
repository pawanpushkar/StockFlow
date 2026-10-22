
package com.stockflow.backend.movement;

import com.stockflow.backend.product.Product;
import com.stockflow.backend.product.ProductNotFoundException;
import com.stockflow.backend.product.ProductRepository;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository movementRepository;
    private final ProductRepository productRepository;

    public StockMovementService(
            StockMovementRepository movementRepository,
            ProductRepository productRepository) {
        this.movementRepository = movementRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public StockMovement recordMovement(
            Long productId,
            MovementType type,
            Integer quantity,
            String note) {

        if (productId == null) {
            throw new IllegalArgumentException("Product ID is required.");
        }

        if (type == null) {
            throw new IllegalArgumentException("Movement type is required.");
        }

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Movement quantity must be greater than zero.");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(
                        "Product not found with ID: " + productId));

        int currentQuantity = product.getQuantity();

        if (type == MovementType.OUT && quantity > currentQuantity) {
            throw new IllegalArgumentException(
                    "Insufficient stock. Available quantity: "
                            + currentQuantity);
        }

        if (type == MovementType.IN) {
            product.setQuantity(Math.addExact(currentQuantity, quantity));
        } else {
            product.setQuantity(currentQuantity - quantity);
        }

        productRepository.save(product);

        StockMovement movement = new StockMovement();
        movement.setProduct(product);
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setNote(note == null || note.isBlank()
                ? null
                : note.trim());

        return movementRepository.save(movement);
    }

    @Transactional(readOnly = true)
    public List<StockMovement> getAllMovements() {
        return movementRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}

