package com.xpay.core.modules.identity.service;

import com.xpay.core.common.utils.JwtUtils;
import com.xpay.core.modules.identity.dto.request.LoginRequest;
import com.xpay.core.modules.identity.dto.request.RegisterRequest;
import com.xpay.core.modules.identity.dto.response.AuthResponse;
import com.xpay.core.modules.identity.entity.KycStatus;
import com.xpay.core.modules.identity.entity.Role;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.entity.WalletStatus;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    //  các dependency cần thiết thông qua Constructor (do @RequiredArgsConstructor tạo ra)
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional // Đảm bảo nguyên tắc ACID: Lỗi tạo Ví thì sẽ Rollback lại User
    public void register(RegisterRequest request) {
        log.info("Bắt đầu xử lý đăng ký cho username: {}", request.getUsername());

        // 1. Kiểm tra dữ liệu trùng lặp
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username đã tồn tại trên hệ thống!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email đã được sử dụng!");
        }

        // 2. Chuyển DTO thành Entity và mã hóa mật khẩu
        User newUser = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .kycStatus(KycStatus.UNVERIFIED)
                .build();

        // Lưu User vào DB
        User savedUser = userRepository.save(newUser);
        log.info("Đã tạo User thành công với ID: {}", savedUser.getId());

        // 3. Tự động khởi tạo Ví rỗng cho User vừa đăng ký
        Wallet newWallet = Wallet.builder()
                .user(savedUser)
                .balance(BigDecimal.ZERO)
                .currency("VND")
                .status(WalletStatus.ACTIVE)
                .version(0L) // Version khởi điểm cho Optimistic Locking
                .build();

        walletRepository.save(newWallet);
        log.info("Đã khởi tạo Ví mặc định thành công cho User ID: {}", savedUser.getId());
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        log.info("Nhận yêu cầu đăng nhập từ username: {}", request.getUsername());

        // 1. Giao phó cho Spring Security kiểm tra tài khoản và mật khẩu
        // Nếu sai, nó sẽ tự ném ra BadCredentialsException
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );

        // 2. Lấy thông tin User sau khi xác thực thành công
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        // 3. Dùng JwtUtils tạo Token thật
        String jwtToken = jwtUtils.generateToken(userDetails);
        log.info("Đăng nhập thành công, cấp phát token cho username: {}", request.getUsername());

        // Lấy Role đầu tiên của User (ví dụ: ROLE_USER)
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        // 4. Trả về DTO
        return AuthResponse.builder()
                .accessToken(jwtToken)
                .tokenType("Bearer")
                .username(request.getUsername())
                .role(role)
                .build();
    }
}