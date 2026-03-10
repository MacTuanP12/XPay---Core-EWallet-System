package com.xpay.core.modules.identity.repository;

import com.xpay.core.modules.identity.entity.KycStatus;
import com.xpay.core.modules.identity.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);


    Page<User> findAll(Pageable pageable);
    long countByKycStatus(KycStatus kycStatus);
    List<User> findByKycStatus(KycStatus kycStatus);
}
