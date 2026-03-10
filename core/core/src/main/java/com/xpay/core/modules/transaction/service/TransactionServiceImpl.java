package com.xpay.core.modules.transaction.service;

import com.xpay.core.modules.transaction.dto.request.RecordTransactionRequest;
import com.xpay.core.modules.transaction.entity.Transaction;
import com.xpay.core.modules.transaction.entity.TransactionStatus;
import com.xpay.core.modules.transaction.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public Transaction record(RecordTransactionRequest request) {
        Transaction transaction = Transaction.builder()
                .sourceWallet(request.getSourceWallet())
                .destinationWallet(request.getDestinationWallet())
                .amount(request.getAmount())
                .type(request.getType())
                .status(TransactionStatus.SUCCESS)
                .referenceNote(request.getReferenceNote())
                .build();

        Transaction saved = transactionRepository.save(transaction);
        log.info("Đã ghi lịch sử [{}] thành công, txId: {}", request.getType(), saved.getId());
        return saved;
    }
}

