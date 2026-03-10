package com.xpay.core.modules.identity.controller;

import com.xpay.core.modules.identity.dto.request.ForgotPasswordRequest;
import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.request.ResetPasswordRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // POST /api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterRequest request) {
        log.info("API Đăng ký được gọi với email: {}", request.getEmail());
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Đăng ký tài khoản và khởi tạo Ví thành công!"));
    }

    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("API Đăng nhập được gọi với username: {}", request.getUsername());
        return ResponseEntity.ok(authService.login(request));
    }

    // POST /api/v1/auth/forgot-password
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        log.info("API Quên mật khẩu được gọi với email: {}", request.getEmail());
        String token = authService.forgotPassword(request);
        // Demo: trả token thẳng. Production sẽ gửi qua email.
        return ResponseEntity.ok(Map.of(
                "message", "Yêu cầu thành công! Token có hiệu lực 15 phút.",
                "resetToken", token
        ));
    }

    // POST /api/v1/auth/reset-password
    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        log.info("API Đặt lại mật khẩu được gọi");
        authService.resetPassword(request);
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại."));
    }
}