package com.stockflow.backend.movement;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock-movements")
public class StockMovementController {

    private final StockMovementService movementService;

    public StockMovementController(
            StockMovementService movementService) {
        this.movementService = movementService;
    }

    public record MovementRequest(
            @NotNull Long productId,
            @NotNull MovementType type,
            @NotNull @Positive Integer quantity,
            @Size(max = 500) String note) {
    }

    @GetMapping
    public List<StockMovement> getAllMovements() {
        return movementService.getAllMovements();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovement createMovement(
            @Valid @RequestBody MovementRequest request) {

        return movementService.recordMovement(
                request.productId(),
                request.type(),
                request.quantity(),
                request.note());
    }
}

