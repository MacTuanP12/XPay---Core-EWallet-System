package com.xpay.core.modules.identity.service;

import com.xpay.core.common.utils.JwtUtils;
import com.xpay.core.exception.custom.ResourceNotFoundException;
import com.xpay.core.modules.identity.dto.request.ChangePasswordRequest;
import com.xpay.core.modules.identity.dto.request.ForgotPasswordRequest;
import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.request.ResetPasswordRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.dto.response.UserProfileResponse;
import com.xpay.core.modules.identity.entity.KycStatus;
import com.xpay.core.modules.identity.entity.PasswordResetToken;
import com.xpay.core.modules.identity.entity.Role;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.PasswordResetTokenRepository;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.entity.WalletStatus;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public void register(RegisterRequest request) {
        log.info("Bắt đầu xử lý đăng ký cho username: {}", request.getUsername());

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại trên hệ thống!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng!");
        }

        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .kycStatus(KycStatus.UNVERIFIED)
                .build();

        User savedUser = userRepository.save(newUser);
        log.info("Đã tạo User thành công với ID: {}", savedUser.getId());

        Wallet newWallet = Wallet.builder()
                .user(savedUser)
                .balance(BigDecimal.ZERO)
                .currency("VND")
                .status(WalletStatus.ACTIVE)
                .version(0L)
                .build();

        walletRepository.save(newWallet);
        log.info("Đã khởi tạo Ví mặc định thành công cho User ID: {}", savedUser.getId());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Nhận yêu cầu đăng nhập từ username: {}", request.getUsername());

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtUtils.generateToken(userDetails);
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .username(request.getUsername())
                .role(role)
                .build();
    }

    @Override
    public UserProfileResponse getMyProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        return UserProfileResponse.builder()
                .username(user.getUsername())
                .email(user.getEmail())
                .kycStatus(user.getKycStatus())
                .createdAt(user.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")))
                .build();
    }

    // ─── Forgot Password ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Không tìm thấy tài khoản với email: " + request.getEmail()));

        // Xoá token cũ (nếu có)
        resetTokenRepository.deleteByUserId(user.getId());

        // Tạo token ngẫu nhiên 32 bytes → base64url
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .used(false)
                .build();

        resetTokenRepository.save(resetToken);
        log.info("[ForgotPassword] Token tạo cho user: {} | token: {}", user.getUsername(), token);

        // Trong môi trường demo: trả thẳng token về response
        // Production: gửi qua email
        return token;
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ResourceNotFoundException("Token không hợp lệ hoặc đã hết hạn"));

        if (resetToken.isUsed()) {
            throw new IllegalArgumentException("Token này đã được sử dụng!");
        }
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("Token đã hết hạn! Vui lòng yêu cầu lại.");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        resetTokenRepository.save(resetToken);

        log.info("[ResetPassword] Đặt lại mật khẩu thành công cho user: {}", user.getUsername());
    }

    // ─── Change Password (authenticated) ─────────────────────────────────────

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp!");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu hiện tại không đúng!");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("[ChangePassword] Đổi mật khẩu thành công cho user: {}", username);
    }
}


