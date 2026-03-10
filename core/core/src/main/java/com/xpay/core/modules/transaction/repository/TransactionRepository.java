package com.xpay.core.modules.transaction.repository;

import com.xpay.core.modules.transaction.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    @Query("""
            SELECT t FROM Transaction t
            WHERE t.sourceWallet.id = :walletId
               OR t.destinationWallet.id = :walletId
            ORDER BY t.createdAt DESC
            """)
    Page<Transaction> findAllByWalletIdOrderByCreatedAtDesc(
            @Param("walletId") UUID walletId,
            Pageable pageable
    );
}
