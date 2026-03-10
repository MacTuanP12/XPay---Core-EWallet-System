package com.xpay.core.modules.transaction.entity;

import com.xpay.core.common.entity.BaseEntity;
import com.xpay.core.modules.identity.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "wallets",
        indexes = {
                @Index(name = "idx_wallet_user_id", columnList = "user_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Wallet extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    private UUID id;

    // LAZY: Khi lấy Wallet ra, không tự động query kéo theo bảng User trừ khi gọi lệnh get.User()
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WalletStatus status;

    // Version dùng để bật Optimistic Locking - Yêu cầu bắt buộc của hệ thống tài chính
    @Version
    private Long version;
}