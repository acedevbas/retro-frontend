import React from 'react';
import PropTypes from 'prop-types';
import { Steps } from 'antd';

const { Step } = Steps;

const steps = ['Preparation', 'Create Cards', 'Prepare Vote', 'Vote', 'Discussion'];

function RoomStepper({ activeStep = 0 }) {
  return (
    <Steps current={activeStep} style={{ marginBottom: '16px' }}>
      {steps.map((label, index) => (
        <Step key={index} title={label} />
      ))}
    </Steps>
  );
}

RoomStepper.propTypes = {
  activeStep: PropTypes.number, // Ожидается, что activeStep будет числом
};

export default RoomStepper;
