import React from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { Periods } from "consts/periods";
import { useIsList } from "context/IsListProvider";
import CalendarIcon from "svgs/icons/calendar.svg";
import PileCoinsIcon from "svgs/icons/pile-coins.svg";
import UserIcon from "svgs/icons/user.svg";
import Field from "./Field";
import { responsiveSize } from "utils/responsiveSize";

const Container = styled.div<{ isList: boolean; isPreview?: boolean }>`
  display: flex;
  width: 100%;
  gap: 8px;
  flex-direction: column;
  justify-content: flex-end;

  ${({ isList }) =>
    isList &&
    css`
      ${landscapeStyle(
        () => css`
          gap: 0;
          height: 100%;
        `
      )}
    `};
`;

const RestOfFieldsContainer = styled.div<{ isList?: boolean; isPreview?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;

  ${({ isList }) =>
    isList &&
    css`
      ${landscapeStyle(
        () => css`
          flex-direction: row;
          gap: ${responsiveSize(4, 24, 300, 900)};
          justify-content: space-around;
        `
      )}
    `};
  ${({ isPreview }) =>
    isPreview &&
    css`
      gap: 32px;
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: flex-start;
    `};
`;

const getPeriodPhrase = (period: Periods): string => {
  switch (period) {
    case Periods.evidence:
      return "Voting Starts";
    case Periods.appeal:
      return "Appeal Deadline";
    case Periods.execution:
      return "Final Decision";
    default:
      return "Delivery Deadline";
  }
};

export interface ITransactionInfo {
  amount?: string;
  deadline?: Date;
  token?: string;
  period?: Periods;
  overrideIsList?: boolean;
  isPreview?: boolean;
  receiver?: string;
}

const TransactionInfo: React.FC<ITransactionInfo> = ({
  amount,
  token,
  deadline,
  period,
  receiver,
  overrideIsList,
  isPreview,
}) => {
  const { isList } = useIsList();
  const displayAsList = isList && !overrideIsList;

  return (
    <Container isList={displayAsList} isPreview={isPreview}>
      <RestOfFieldsContainer isPreview={isPreview} isList={displayAsList}>
        {amount && token ? (
          <Field
            icon={PileCoinsIcon}
            name="Amount"
            value={`${amount} ${token}`}
            displayAsList={displayAsList}
            isPreview={isPreview}
          />
        ) : null}
        {receiver ? (
          <Field icon={UserIcon} name="Receiver" value={receiver} displayAsList={displayAsList} isPreview={isPreview} />
        ) : null}
        {deadline ? (
          <Field
            icon={CalendarIcon}
            name={getPeriodPhrase(period)}
            value={new Date(deadline).toLocaleString()}
            displayAsList={displayAsList}
            isPreview={isPreview}
          />
        ) : null}
      </RestOfFieldsContainer>
    </Container>
  );
};
export default TransactionInfo;
