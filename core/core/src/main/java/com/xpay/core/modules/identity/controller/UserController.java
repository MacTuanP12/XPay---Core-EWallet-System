package com.xpay.core.modules.identity.controller;

import com.xpay.core.common.dto.ApiResponse;
import com.xpay.core.modules.identity.dto.response.UserProfileResponse;
import com.xpay.core.modules.identity.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getMyProfile() {
        UserProfileResponse profile = authService.getMyProfile();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin profile thành công", profile));
    }
}
