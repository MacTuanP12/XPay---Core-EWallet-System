package com.xpay.core.modules.identity.controller;

import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;


    //  POST http://localhost:8080/api/v1/auth/register
    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        log.info("API Đăng ký được gọi với email: {}", request.getEmail());

        authService.register(request);

        // Trả về mã 201 Created (Báo hiệu đã tạo tài nguyên thành công)
        return ResponseEntity.status(HttpStatus.CREATED).body("Đăng ký tài khoản và khởi tạo Ví thành công!");
    }


    //  POST http://localhost:8080/api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("API Đăng nhập được gọi với username: {}", request.getUsername());

        AuthResponse response = authService.login(request);

        // Trả về mã 200 OK kèm theo Token
        return ResponseEntity.ok(response);
    }
}