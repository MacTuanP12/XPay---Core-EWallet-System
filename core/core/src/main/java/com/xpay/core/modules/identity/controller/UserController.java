package com.xpay.core.modules.identity.controller;

import com.xpay.core.common.dto.ApiResponse;
import com.xpay.core.modules.identity.dto.request.ChangePasswordRequest;
import com.xpay.core.modules.identity.dto.response.UserProfileResponse;
import com.xpay.core.modules.identity.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    // GET /api/v1/users/me
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin profile thành công", authService.getMyProfile())
        );
    }

    // POST /api/v1/users/change-password
    @PostMapping("/change-password")
    public ResponseEntity<Map<String, String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
    }
}
