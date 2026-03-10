package com.xpay.core.exception;

import com.xpay.core.exception.custom.InsufficientBalanceException;
import com.xpay.core.exception.custom.InvalidTransactionException;
import com.xpay.core.exception.custom.ResourceNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============================================================
    // 404 — Không tìm thấy tài nguyên
    // ============================================================
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        log.warn("ResourceNotFound tại [{}]: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.NOT_FOUND, "NOT_FOUND", ex.getMessage(), request);
    }

    // ============================================================
    // 400 — Số dư không đủ
    // ============================================================
    @ExceptionHandler(InsufficientBalanceException.class)
    public ResponseEntity<ErrorResponse> handleInsufficientBalance(
            InsufficientBalanceException ex, HttpServletRequest request) {
        log.warn("InsufficientBalance tại [{}]: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "INSUFFICIENT_BALANCE", ex.getMessage(), request);
    }

    // ============================================================
    // 400 — Giao dịch không hợp lệ (tự chuyển tiền cho mình, v.v.)
    // ============================================================
    @ExceptionHandler(InvalidTransactionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransaction(
            InvalidTransactionException ex, HttpServletRequest request) {
        log.warn("InvalidTransaction tại [{}]: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "INVALID_TRANSACTION", ex.getMessage(), request);
    }

    // ============================================================
    // 400 — Dữ liệu đầu vào vi phạm @Valid (@NotNull, @DecimalMin, v.v.)
    // ============================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, String> errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        field -> field.getDefaultMessage() != null ? field.getDefaultMessage() : "Không hợp lệ",
                        (existing, duplicate) -> existing // Giữ lỗi đầu tiên nếu field bị lỗi nhiều lần
                ));
        log.warn("ValidationError tại [{}]: {}", request.getRequestURI(), errors);

        ErrorResponse body = ErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .error("VALIDATION_ERROR")
                .message("Dữ liệu đầu vào không hợp lệ")
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .validationErrors(errors)
                .build();

        return ResponseEntity.badRequest().body(body);
    }

    // ============================================================
    // 400 — Nghiệp vụ không hợp lệ chung (IllegalArgumentException)
    // ============================================================
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        log.warn("IllegalArgument tại [{}]: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.BAD_REQUEST, "BAD_REQUEST", ex.getMessage(), request);
    }

    // ============================================================
    // 401 — Sai username/password khi đăng nhập
    // ============================================================
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException ex, HttpServletRequest request) {
        log.warn("BadCredentials tại [{}]", request.getRequestURI());
        return build(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Sai tên đăng nhập hoặc mật khẩu", request);
    }

    // ============================================================
    // 403 — Không có quyền truy cập
    // ============================================================
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("AccessDenied tại [{}]: {}", request.getRequestURI(), ex.getMessage());
        return build(HttpStatus.FORBIDDEN, "FORBIDDEN", "Bạn không có quyền thực hiện hành động này", request);
    }

    // ============================================================
    // 500 — Mọi exception không mong đợi khác
    // ============================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(
            Exception ex, HttpServletRequest request) {
        log.error("UnhandledException tại [{}]: {}", request.getRequestURI(), ex.getMessage(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR", "Hệ thống gặp sự cố, vui lòng thử lại sau", request);
    }

    // ============================================================
    // Helper: Build ErrorResponse chuẩn
    // ============================================================
    private ResponseEntity<ErrorResponse> build(
            HttpStatus status, String error, String message, HttpServletRequest request) {
        ErrorResponse body = ErrorResponse.builder()
                .status(status.value())
                .error(error)
                .message(message)
                .path(request.getRequestURI())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
