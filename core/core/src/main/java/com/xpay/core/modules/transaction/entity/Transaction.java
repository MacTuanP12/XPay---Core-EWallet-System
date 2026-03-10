package com.xpay.core.modules.transaction.entity;

import com.xpay.core.common.entity.BaseEntity;
import com.xpay.core.modules.wallet.entity.Wallet;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(
        name = "transactions",
        indexes = {
                @Index(name = "idx_tx_idempotency_key", columnList = "idempotency_key", unique = true),
                @Index(name = "idx_tx_source_wallet", columnList = "source_wallet_id"),
                @Index(name = "idx_tx_dest_wallet", columnList = "destination_wallet_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false, nullable = false)
    private UUID id;

    // Ví nguồn: Có thể null nếu là giao dịch DEPOSIT (nạp từ ngân hàng ngoài vào)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_wallet_id")
    private Wallet sourceWallet;

    // Ví đích: Bắt buộc phải có
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "destination_wallet_id", nullable = false)
    private Wallet destinationWallet;

    @Column(nullable = false, precision = 19, scale = 4)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransactionStatus status;

    // Khóa chống lặp giao dịch do mạng lag/user bấm 2 lần
    @Column(name = "idempotency_key", unique = true, length = 100)
    private String idempotencyKey;

    @Column(name = "reference_note", length = 255)
    private String referenceNote;
}