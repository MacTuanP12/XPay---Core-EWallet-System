package com.xpay.core.modules.identity.service;

import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.dto.response.UserProfileResponse;

public interface  AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getMyProfile();
}
