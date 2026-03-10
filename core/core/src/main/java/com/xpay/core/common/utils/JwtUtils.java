package com.xpay.core.common.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;


@Slf4j
@Component
public class JwtUtils {


    @Value("${application.security.jwt.secret-key}")
    private String secretKey;


    @Value("${application.security.jwt.expiration}")
    private long jwtExpiration;

    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                // Ký bằng con dấu bí mật.
                .signWith(getSignInKey())
                .compact();
    }

    // Hàm tạo mã khóa an toàn (SecretKey) từ chuỗi text thô
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    // Hàm 1: Đọc tên khách hàng (username) từ trên Thẻ
    public String extractUsername(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Đưa con dấu bí mật vào để đối chiếu chữ ký
                .build()
                .parseSignedClaims(token) // Bóc tách Token
                .getPayload()
                .getSubject(); // Lấy ra subject (chính là username ta nhét vào lúc trước)
    }

    // Hàm 2: Kiểm tra thẻ có hợp lệ không
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getSignInKey()).build().parseSignedClaims(token);
            return true; // Nếu parse thành công mà không nổ Exception -> Thẻ chuẩn
        } catch (Exception e) {
            log.error("Token không hợp lệ hoặc đã hết hạn: {}", e.getMessage());
            return false; // Thẻ giả hoặc đã hết hạn
        }
    }
}