package com.xpay.core.config;

import com.xpay.core.modules.identity.entity.KycStatus;
import com.xpay.core.modules.identity.entity.Role;
import com.xpay.core.modules.identity.entity.User;
import com.xpay.core.modules.identity.repository.UserRepository;
import com.xpay.core.modules.wallet.entity.Wallet;
import com.xpay.core.modules.wallet.entity.WalletStatus;
import com.xpay.core.modules.wallet.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.findByUsername("admin").isEmpty()) {

            // Tạo user admin — field tên "password" map cột "password_hash"
            User admin = User.builder()
                    .username("admin")
                    .email("admin@xpay.vn")
                    .password(passwordEncoder.encode("Admin@123"))  // field: password → cột: password_hash
                    .role(Role.ROLE_ADMIN)                          // Enum: ROLE_ADMIN (đã có prefix ROLE_)
                    .kycStatus(KycStatus.VERIFIED)
                    .build();

            User savedAdmin = userRepository.save(admin);

            // Tạo ví cho admin
            Wallet adminWallet = Wallet.builder()
                    .user(savedAdmin)
                    .balance(BigDecimal.ZERO)
                    .currency("VND")
                    .status(WalletStatus.ACTIVE)
                    .version(0L)
                    .build();

            walletRepository.save(adminWallet);
            log.info("✅ Đã khởi tạo tài khoản Admin mặc định — username: admin / password: Admin@123");
        } else {
            log.info("ℹ️  Tài khoản admin đã tồn tại, bỏ qua khởi tạo.");
        }
    }
}

