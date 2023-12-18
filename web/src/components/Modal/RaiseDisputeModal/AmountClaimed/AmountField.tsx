import React from "react";
import { Field } from "@kleros/ui-components-library";
import styled from "styled-components";

const StyledField = styled(Field)`
  width: 100% !important;
`;

const AmountField: React.FC = () => {
  return <StyledField placeholder="0" />;
};
export default AmountField;
