package com.xpay.core.modules.identity.service;

import com.xpay.core.modules.identity.dto.request.ChangePasswordRequest;
import com.xpay.core.modules.identity.dto.request.ForgotPasswordRequest;
import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.request.ResetPasswordRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.dto.response.UserProfileResponse;

public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserProfileResponse getMyProfile();
    String forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(ChangePasswordRequest request);
}
