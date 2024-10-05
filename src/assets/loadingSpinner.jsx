import React from 'react';
import styled from 'styled-components';

const SpinnerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: black; /* Semi-transparent background */
  z-index: 999; /* Ensure spinner is above all content */
`;

const FontAwesomeSpinner = styled.i`
  font-size: 40px; /* Adjust the size of the spinner */
  color: #205e78; /* Your company color */
  z-index: 1000;
`;

const LoadingScreen = () => (
  <SpinnerWrapper>
    <FontAwesomeSpinner className="fa fa-spinner fa-spin" />
  </SpinnerWrapper>
);

export default LoadingScreen;
