import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Steps, Tooltip, Typography, Skeleton, notification } from 'antd';
import { QuestionCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';
import './RoomStepper.css';

const { Step } = Steps;
const { Link } = Typography;

const API_URL = process.env.REACT_APP_API_URL;

function RoomStepper({ roomId, socket }) {
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const stepsRef = useRef();
  stepsRef.current = steps;

  useEffect(() => {
    if (!roomId || !socket) return;

    const fetchController = new AbortController();

    const fetchSteps = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms/${roomId}/steps`, {
          signal: fetchController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch steps data');
        }

        const data = await response.json();

        const phases = data.phasesList.map((phase) => ({
          id: phase.id || phase._id || phase.key || phase.name,
          key: phase.key || phase.id || phase._id || phase.name,
          name: phase.name,
          description: phase.description,
        }));

        const currentPhaseIndex = phases.findIndex(
          (phase) => phase.name === data.currentPhase
        );

        setSteps(phases);
        setActiveStep(currentPhaseIndex !== -1 ? currentPhaseIndex : 0);

        setLoading(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching steps:', error);
          notification.error({
            message: 'Ошибка загрузки данных',
            description: 'Ошибка загрузки этапов. Попробуйте позже.',
            duration: 5,
          });
        }
      }
    };

    fetchSteps();

    const handlePhaseChange = (data) => {
      const newIndex = stepsRef.current.findIndex(
        (step) => step.name === data.phase
      );
      if (newIndex !== -1) {
        setActiveStep(newIndex);
      } else {
        console.warn('Phase not found in steps:', data);
      }
    };

    socket.on('phaseChanged', handlePhaseChange);

    return () => {
      socket.off('phaseChanged', handlePhaseChange);
      fetchController.abort();
    };
  }, [roomId, socket]);

  const handlePhaseChangeRequest = (direction) => {
    if (socket) {
      socket.emit('changePhase', { roomId, direction });
    }
  };

  return (
    <div className="room-stepper-container">
      <div className="room-stepper-content">
        
        <Steps current={loading ? -1 : activeStep} size="small" className="room-stepper-steps">
          {loading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Step
                  key={index}
                  title={<Skeleton.Input style={{ width: 100 }} active={loading} />}
                  icon={<Skeleton.Avatar active={loading} shape="circle" size="small" />}
                />
              ))
            : steps.map((step, index) => (
                <Step
                  key={step.id}
                  title={
                    <span className="room-stepper-step-title">
                      {/* Если это предыдущий шаг, делаем его ссылкой */}
                      {index === activeStep - 1 ? (
                        <Link
                          onClick={() => handlePhaseChangeRequest('prev')}
                          style={{
                            color: '#1890ff',
                          }}
                        >
                          {step.name}
                        </Link>
                      ) : (
                        <span>{step.name}</span>
                      )}
                      <Tooltip
                        title={
                          <span style={{ whiteSpace: 'pre-line' }}>
                            {step.description}
                          </span>
                        }
                        placement="top"
                      >
                        <QuestionCircleOutlined
                          style={{ marginLeft: '8px', color: '#1890ff' }}
                        />
                      </Tooltip>
                    </span>
                  }
                  icon={
                    index === activeStep ? (
                      <span className="step-icon-current">{index + 1}</span>
                    ) : (
                      <span className="step-icon">{index + 1}</span>
                    )
                  }
                />
              ))}
        </Steps>
        <div className="room-stepper-button-container">
          <div
            className={`room-stepper-button ${
              loading || activeStep === steps.length - 1 ? 'disabled' : ''
            }`}
            onClick={() => {
              if (!loading && activeStep < steps.length - 1) {
                handlePhaseChangeRequest('next');
              }
            }}
          >
            <ArrowRightOutlined className="room-stepper-button-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

RoomStepper.propTypes = {
  roomId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
};

export default RoomStepper;