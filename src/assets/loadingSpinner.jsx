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
  background-color: transparent; /* Semi-transparent background */
 /* Ensure spinner is above all content */
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.3); /* Light background */
  border-top: 4px solid #203B4D; /* Dark blue color */
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  z-index: 999;
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingScreen = () => (
  <SpinnerWrapper>
    <Spinner />
  </SpinnerWrapper>
);

export default LoadingScreen;
