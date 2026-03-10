package com.xpay.core.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Không trả field null về client
public class ErrorResponse {

    private int status;
    private String error;        // Tên loại lỗi, ví dụ: "NOT_FOUND"
    private String message;      // Mô tả lỗi dễ đọc
    private String path;         // Endpoint bị lỗi
    private LocalDateTime timestamp;
    private Map<String, String> validationErrors; // Chỉ có khi lỗi validation
}
