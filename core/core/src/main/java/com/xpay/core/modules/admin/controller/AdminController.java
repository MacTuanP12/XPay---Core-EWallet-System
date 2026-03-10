package com.xpay.core.modules.admin.controller;

import com.xpay.core.common.dto.ApiResponse;
import com.xpay.core.common.dto.PageResponse;
import com.xpay.core.modules.admin.dto.response.AdminDashboardStats;
import com.xpay.core.modules.admin.dto.response.AdminTransactionResponse;
import com.xpay.core.modules.admin.dto.response.AdminUserResponse;
import com.xpay.core.modules.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // GET /api/v1/admin/stats
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminDashboardStats>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success("Lấy thống kê thành công", adminService.getDashboardStats())
        );
    }

    // GET /api/v1/admin/users?page=0&size=10
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PageResponse<AdminUserResponse>>> getUsers(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(
                ApiResponse.success("Lấy danh sách user thành công", adminService.getAllUsers(pageable))
        );
    }

    // PATCH /api/v1/admin/users/{userId}/kyc/approve
    @PatchMapping("/users/{userId}/kyc/approve")
    public ResponseEntity<ApiResponse<AdminUserResponse>> approveKyc(@PathVariable String userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Phê duyệt KYC thành công", adminService.approveKyc(userId))
        );
    }

    // PATCH /api/v1/admin/users/{userId}/kyc/reject
    @PatchMapping("/users/{userId}/kyc/reject")
    public ResponseEntity<ApiResponse<AdminUserResponse>> rejectKyc(@PathVariable String userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Từ chối KYC thành công", adminService.rejectKyc(userId))
        );
    }

    // PATCH /api/v1/admin/users/{userId}/wallet/toggle-lock
    @PatchMapping("/users/{userId}/wallet/toggle-lock")
    public ResponseEntity<ApiResponse<AdminUserResponse>> toggleWalletLock(@PathVariable String userId) {
        return ResponseEntity.ok(
                ApiResponse.success("Cập nhật trạng thái ví thành công", adminService.toggleWalletLock(userId))
        );
    }

    // GET /api/v1/admin/transactions?page=0&size=20
    @GetMapping("/transactions")
    public ResponseEntity<ApiResponse<PageResponse<AdminTransactionResponse>>> getAllTransactions(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                ApiResponse.success("Lấy lịch sử giao dịch thành công", adminService.getAllTransactions(pageable))
        );
    }
}

