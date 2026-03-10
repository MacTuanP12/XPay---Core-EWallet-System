package com.xpay.core.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Wrapper chuẩn cho mọi response có phân trang.
 * Dùng chung cho tất cả module cần pagination.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PageResponse<T> {

    private List<T> content;        // Danh sách dữ liệu trang hiện tại
    private int page;               // Trang hiện tại (bắt đầu từ 0)
    private int size;               // Số phần tử mỗi trang
    private long totalElements;     // Tổng số phần tử
    private int totalPages;         // Tổng số trang
    private boolean isFirst;        // Có phải trang đầu không
    private boolean isLast;         // Có phải trang cuối không


    public static <T> PageResponse<T> of(Page<T> springPage) {
        return PageResponse.<T>builder()
                .content(springPage.getContent())
                .page(springPage.getNumber())
                .size(springPage.getSize())
                .totalElements(springPage.getTotalElements())
                .totalPages(springPage.getTotalPages())
                .isFirst(springPage.isFirst())
                .isLast(springPage.isLast())
                .build();
    }
}
