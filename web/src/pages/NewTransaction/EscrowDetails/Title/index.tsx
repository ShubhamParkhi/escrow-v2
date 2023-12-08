import React from "react";
import Header from "../../../../components/Header";
import styled from "styled-components";
import TextField from "./TextField";
import NavigationButtons from "../../NavigationButtons";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title: React.FC = () => {
  return (
    <Container>
      <Header text="Title" />
      <TextField />
      <NavigationButtons prevRoute="/newTransaction/typeOfEscrow" nextRoute="/newTransaction/deliverable" />
    </Container>
  );
};
export default Title;
