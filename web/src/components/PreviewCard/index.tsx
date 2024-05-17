import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Card } from "@kleros/ui-components-library";
import { responsiveSize } from "styles/responsiveSize";
import Header from "./Header";
import TransactionInfo from "components/TransactionInfo";
import Terms from "./Terms";
import EscrowTimeline from "./EscrowTimeline";
import Buttons from "pages/MyTransactions/TransactionDetails/PreviewCardButtons";
import { DisputeRequest, HasToPayFee, Payment, SettlementProposal, TransactionResolved } from "src/graphql/graphql";

export const StyledCard = styled(Card)<{ isPreview?: boolean }>`
  height: auto;
  min-height: 100px;
  width: 86vw;
  align-self: center;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: ${responsiveSize(24, 32)};

  ${({ isPreview }) =>
    isPreview &&
    css`
      padding-bottom: 36px;
    `}

  ${landscapeStyle(
    () => css`
      max-width: 100%;
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
  gap: 32px;
`;

interface IPreviewCard {
  escrowType: string;
  escrowTitle: string;
  deliverableText: string;
  receivingQuantity: string;
  transactionCreationTimestamp: string;
  status: string;
  token: string;
  buyerAddress: string;
  sendingQuantity: string;
  sellerAddress: string;
  deadlineDate: string;
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
  token,
  buyerAddress,
  sendingQuantity,
  sellerAddress,
  deadlineDate,
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
    <Header {...{ escrowType, escrowTitle, status, isCard: false }} />
    <TransactionInfoContainer>
      <Divider />
      <TransactionInfo
        amount={sendingQuantity}
        assetSymbol={assetSymbol}
        isPreview={true}
        {...{ overrideIsList, deadlineDate, sellerAddress, buyerAddress }}
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
        deadlineDate,
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
    {!isPreview ? <Buttons {...{ feeTimeout, settlementTimeout, arbitrationCost }} /> : null}
  </StyledCard>
);

export default PreviewCard;
