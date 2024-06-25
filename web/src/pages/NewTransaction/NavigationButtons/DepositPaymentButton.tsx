import React, { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { Button } from "@kleros/ui-components-library";
import {
  useEscrowUniversalCreateNativeTransaction,
  usePrepareEscrowUniversalCreateNativeTransaction,
  useEscrowUniversalCreateErc20Transaction,
  usePrepareEscrowUniversalCreateErc20Transaction,
  escrowUniversalAddress,
} from "hooks/contracts/generated";
import { erc20ABI, useNetwork } from "wagmi";
import { useNewTransactionContext } from "context/NewTransactionContext";
import {
  useAccount,
  useEnsAddress,
  usePublicClient,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from "wagmi";
import { parseEther, parseUnits } from "viem";
import { isUndefined } from "utils/index";
import { wrapWithToast } from "utils/wrapWithToast";
import { ethAddressPattern } from "utils/validateAddress";
import { useQueryRefetch } from "hooks/useQueryRefetch";
import { useNavigateAndScrollTop } from "hooks/useNavigateAndScrollTop";

const StyledButton = styled(Button)``;

const DepositPaymentButton: React.FC = () => {
  const {
    escrowTitle,
    deliverableText,
    transactionUri,
    extraDescriptionUri,
    sendingQuantity,
    sellerAddress,
    deadline,
    sendingToken,
    resetContext,
  } = useNewTransactionContext();

  const [finalRecipientAddress, setFinalRecipientAddress] = useState(sellerAddress);
  const publicClient = usePublicClient();
  const navigateAndScrollTop = useNavigateAndScrollTop();
  const refetchQuery = useQueryRefetch();
  const [isSending, setIsSending] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { address } = useAccount();
  const { chain } = useNetwork();
  const ensResult = useEnsAddress({ name: sellerAddress, chainId: 1 });
  const deadlineTimestamp = useMemo(() => BigInt(Math.floor(new Date(deadline).getTime() / 1000)), [deadline]);
  const isNativeTransaction = sendingToken?.address === "native";
  const transactionValue = useMemo(
    () => (isNativeTransaction ? parseEther(sendingQuantity) : parseUnits(sendingQuantity, 18)),
    [isNativeTransaction, sendingQuantity]
  );

  useEffect(() => {
    setFinalRecipientAddress(ensResult.data || sellerAddress);
  }, [sellerAddress, ensResult.data]);

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    enabled: !isNativeTransaction,
    address: sendingToken?.address,
    abi: erc20ABI,
    functionName: "allowance",
    args: [address, escrowUniversalAddress?.[chain?.id]],
  });

  useEffect(() => {
    if (!isUndefined(allowance)) {
      setIsApproved(allowance >= transactionValue);
    }
  }, [allowance, transactionValue]);

  const disputeTemplate = `{
    "$schema": "../NewDisputeTemplate.schema.json",
    "title": "Escrow dispute: {{escrowTitle}}", 
    "description": "{{deliverableText}}", 
    "question": "Which party abided by the terms of the contract?",
    "answers": [
      {
        "title": "Refund the Buyer",
        "description": "Select this to return the funds to the Buyer."
      },
      {
        "title": "Pay the Seller",
        "description": "Select this to release the funds to the Seller."
      }
    ],
    "policyURI": "/ipfs/XxxxxXXX/escrow-general-policy.pdf", 
    "attachment": { 
      "label": "Transaction Terms",
      "uri": "{{{extraDescriptionUri}}}"
    },
    "frontendUrl": "https://escrow-v2.kleros.builders/#/transactions/{{externalDisputeID}}", 
    "arbitrableChainID": "421614",
    "arbitrableAddress": "0xFromContext",
    "arbitratorChainID": "421614",
    "arbitratorAddress": "0xA54e7A16d7460e38a8F324eF46782FB520d58CE8", 
    "metadata": {
      "buyer": "{{buyer}}",
      "seller": "{{seller}}",
      "amount": "{{amount}}",
      "token": "{{token}}",
      "deadline": "{{deadline}}",
      "transactionUri": "{{{transactionUri}}}" 
    },
    "category": "Escrow",
    "specification": "KIPXXX",
    "aliases": {
      "Buyer": "{{buyer}}",
      "Seller": "{{seller}}"
    },
    "version": "1.0"
  }
  `;

  const dataMappings = `[
    {
      "type": "graphql",
      "endpoint": "https://gateway-arbitrum.network.thegraph.com/api/{{{graphApiKey}}}/subgraphs/id/3aZxYcZpZL5BuVhuUupqVrCV8VeNyZEvjmPXibyPHDFQ",
      "query": "query GetTransaction($transactionId: ID!) { escrow(id: $transactionId) { transactionUri buyer seller amount token deadline } }",
      "variables": {
        "transactionId": "{{externalDisputeID}}"
      },
      "seek": ["escrow.transactionUri", "escrow.buyer", "escrow.seller", "escrow.amount", "escrow.token", "escrow.deadline"],
      "populate": ["transactionUri", "buyer", "seller", "amount", "token", "deadline"]
    },
    {
      "type": "fetch/ipfs/json",
      "ipfsUri": "{{{transactionUri}}}",
      "seek": ["title", "description", "extraDescriptionUri"],
      "populate": ["escrowTitle", "deliverableText", "extraDescriptionUri"]
    }
  ]`;

  const { config: createNativeTransactionConfig } = usePrepareEscrowUniversalCreateNativeTransaction({
    enabled: isNativeTransaction && ethAddressPattern.test(finalRecipientAddress),
    args: [deadlineTimestamp, transactionUri, finalRecipientAddress, disputeTemplate, dataMappings],
    value: transactionValue,
  });

  const { config: createERC20TransactionConfig } = usePrepareEscrowUniversalCreateErc20Transaction({
    enabled:
      !isNativeTransaction &&
      !isUndefined(allowance) &&
      allowance >= transactionValue &&
      ethAddressPattern.test(finalRecipientAddress),
    args: [
      transactionValue,
      sendingToken?.address,
      deadlineTimestamp,
      transactionUri,
      finalRecipientAddress,
      disputeTemplate,
      dataMappings,
    ],
  });

  const { writeAsync: createNativeTransaction } =
    useEscrowUniversalCreateNativeTransaction(createNativeTransactionConfig);
  const { writeAsync: createERC20Transaction } = useEscrowUniversalCreateErc20Transaction(createERC20TransactionConfig);

  const { config: approveConfig } = usePrepareContractWrite({
    enabled: !isNativeTransaction,
    address: sendingToken?.address,
    abi: erc20ABI,
    functionName: "approve",
    args: [escrowUniversalAddress?.[chain?.id], transactionValue],
  });

  const { writeAsync: approve } = useContractWrite(approveConfig);

  const handleApproveToken = async () => {
    if (!isUndefined(approve)) {
      setIsSending(true);
      try {
        const wrapResult = await wrapWithToast(
          async () => await approve().then((response) => response.hash),
          publicClient
        );
        setIsApproved(wrapResult.status);
        await refetchAllowance();
      } catch (error) {
        console.error("Approval failed:", error);
        setIsApproved(false);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleCreateTransaction = async () => {
    const createTransaction = isNativeTransaction ? createNativeTransaction : createERC20Transaction;
    if (!isUndefined(createTransaction)) {
      setIsSending(true);
      try {
        const wrapResult = await wrapWithToast(
          async () => await createTransaction().then((response) => response.hash),
          publicClient
        );
        if (wrapResult.status) {
          refetchQuery([["refetchOnBlock", "useMyTransactionsQuery"], ["useUserQuery"]]);
          resetContext();
          navigateAndScrollTop("/transactions/display/1/desc/all");
        }
      } catch (error) {
        console.error("Transaction failed:", error);
      } finally {
        setIsSending(false);
      }
    }
  };

  return (
    <StyledButton
      isLoading={isSending}
      disabled={isSending}
      text={isNativeTransaction || isApproved ? "Deposit the Payment" : "Approve Token"}
      onClick={isNativeTransaction || isApproved ? handleCreateTransaction : handleApproveToken}
    />
  );
};

export default DepositPaymentButton;
