import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card } from "@kleros/ui-components-library";
import Header from "./Header";
import TransactionInfo from "components/TransactionInfo";
import Terms from "./Terms";
import EscrowTimeline from "./EscrowTimeline";
import PreviewCardButtons from "pages/MyTransactions/TransactionDetails/PreviewCardButtons";
import { DisputeRequest, HasToPayFee, Payment, SettlementProposal, TransactionResolved } from "src/graphql/graphql";

export const StyledCard = styled(Card)<{ isPreview?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 16px 16px;
  width: 100%;
  height: auto;

  ${({ isPreview }) =>
    isPreview &&
    css`
      padding-bottom: 36px;
    `}

  ${landscapeStyle(
    () => css`
      padding: 32px;
      gap: 24px;
    `
  )}
`;

export const Divider = styled.hr`
  display: flex;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;

const TransactionInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

interface IPreviewCard {
  escrowType: string;
  escrowTitle: string;
  deliverableText: string;
  receivingQuantity: string;
  transactionCreationTimestamp: string;
  status: string;
  transactionHash: string;
  buyerAddress: string;
  sendingQuantity: string;
  sellerAddress: string;
  deadline: number;
  assetSymbol: string;
  overrideIsList: boolean;
  extraDescriptionUri: string;
  isPreview: boolean;
  payments: Payment[];
  settlementProposals?: SettlementProposal[];
  hasToPayFees?: HasToPayFee[];
  disputeRequest?: DisputeRequest;
  resolvedEvents?: TransactionResolved[];
  feeTimeout: number;
  settlementTimeout: number;
  arbitrationCost: bigint;
}

const PreviewCard: React.FC<IPreviewCard> = ({
  escrowType,
  escrowTitle,
  deliverableText,
  receivingQuantity,
  transactionCreationTimestamp,
  status,
  transactionHash,
  buyerAddress,
  sendingQuantity,
  sellerAddress,
  deadline,
  assetSymbol,
  overrideIsList,
  extraDescriptionUri,
  isPreview,
  payments,
  settlementProposals,
  hasToPayFees,
  disputeRequest,
  resolvedEvents,
  feeTimeout,
  settlementTimeout,
  arbitrationCost,
}) => (
  <StyledCard {...{ isPreview }}>
    <Header {...{ escrowType, escrowTitle, status, transactionHash, isCard: false }} />
    <TransactionInfoContainer>
      <Divider />
      <TransactionInfo
        amount={sendingQuantity}
        isPreview={true}
        {...{ overrideIsList, deadline, sellerAddress, buyerAddress, assetSymbol }}
      />
      <Divider />
    </TransactionInfoContainer>
    <Terms
      {...{
        escrowType,
        deliverableText,
        receivingQuantity,
        buyerAddress,
        sendingQuantity,
        sellerAddress,
        deadline,
        assetSymbol,
        extraDescriptionUri,
      }}
    />
    <Divider />
    <EscrowTimeline
      {...{
        isPreview,
        status,
        assetSymbol,
        transactionCreationTimestamp,
        buyerAddress,
        sellerAddress,
        payments,
        settlementProposals,
        hasToPayFees,
        disputeRequest,
        resolvedEvents,
        feeTimeout,
        settlementTimeout,
      }}
    />
    {!isPreview ? <PreviewCardButtons {...{ feeTimeout, settlementTimeout, arbitrationCost }} /> : null}
  </StyledCard>
);

export default PreviewCard;
