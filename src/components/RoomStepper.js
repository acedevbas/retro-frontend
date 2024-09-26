import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { Steps, Tooltip, Skeleton, notification, Button, Progress } from 'antd';
import {
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import './RoomStepper.css';

const { Step } = Steps;

const API_URL = process.env.REACT_APP_API_URL;

function RoomStepper({ roomId, socket }) {
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [initialPhase, setInitialPhase] = useState(null);
  const [initialPhaseSet, setInitialPhaseSet] = useState(false);

  const stepsRef = useRef();
  stepsRef.current = steps;

  useEffect(() => {
    if (!roomId || !socket) return;

    // Проверка мобильного устройства
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Инициализация
    window.addEventListener('resize', handleResize);

    const fetchController = new AbortController();

    const fetchSteps = async () => {
      console.log('Fetching steps...');
      try {
        const response = await fetch(`${API_URL}/rooms/${roomId}/steps`, {
          signal: fetchController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch steps data');
        }

        const data = await response.json();
        console.log('Steps fetched:', data);

        const phases = data.phasesList.map((phase) => ({
          id: phase.id || phase._id || phase.key || phase.name,
          key: phase.key || phase.id || phase._id || phase.name,
          name: phase.name,
          description: phase.description,
        }));

        setSteps(phases);
        setLoading(false);

        if (initialPhase && !initialPhaseSet) {
          const currentPhaseIndex = phases.findIndex(
            (phase) => phase.name === initialPhase
          );
          setActiveStep(currentPhaseIndex !== -1 ? currentPhaseIndex : 0);
          setInitialPhaseSet(true);
          setInitialPhase(null);
          console.log('Initial phase set, updating active step');
        }
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

    const handlePhaseChange = (data) => {
      console.log('Phase changed:', data);
      const newIndex = stepsRef.current.findIndex(
        (step) => step.name === data.phase
      );
      if (newIndex !== -1) {
        console.log('Updating active step to:', newIndex);
        setActiveStep(newIndex);
      } else {
        console.warn('Phase not found in steps:', data);
      }
    };

    socket.on('phaseChanged', handlePhaseChange);
    socket.emit('getCurrentPhase', { roomId });

    socket.on('currentPhase', (data) => {
      console.log('Current phase received:', data);
      if (stepsRef.current.length > 0) {
        const newIndex = stepsRef.current.findIndex(
          (step) => step.name === data.phase
        );
        if (newIndex !== -1) {
          console.log('Updating active step to:', newIndex);
          setActiveStep(newIndex);
        } else {
          console.warn('Phase not found in steps:', data);
        }
      } else if (!initialPhaseSet) {
        // Устанавливаем начальную фазу только если она еще не установлена
        console.log('Setting initial phase:', data.phase);
        setInitialPhase(data.phase);
      }
    });

    fetchSteps();

    return () => {
      window.removeEventListener('resize', handleResize);
      socket.off('phaseChanged', handlePhaseChange);
      socket.off('currentPhase');
      fetchController.abort();
    };
  }, [roomId, socket, initialPhaseSet]);

  // Use effect to update active step after steps are fetched
  useEffect(() => {
    if (initialPhase && steps.length > 0 && !initialPhaseSet) {
      const currentPhaseIndex = steps.findIndex(
        (phase) => phase.name === initialPhase
      );
      setActiveStep(currentPhaseIndex !== -1 ? currentPhaseIndex : 0);
      setInitialPhaseSet(true);
      setInitialPhase(null);
      console.log('Initial phase set, updating active step');
    }
  }, [initialPhase, steps, initialPhaseSet]);

  const handlePhaseChangeRequest = (direction) => {
    console.log(`Requesting phase change to ${direction}`);
    if (socket) {
      socket.emit('changePhase', { roomId, direction });
    }
  };

  return (
    <div className="room-stepper-container">
      {/* Прогресс-бар */}
      {!loading && steps.length > 0 && (
        <Progress
          percent={((activeStep + 1) / steps.length) * 100}
          showInfo={false}
          strokeColor="#1890ff"
          style={{ marginBottom: '16px' }}
        />
      )}
      <div className="room-stepper-header">
        <Button
          type="default"
          onClick={() => handlePhaseChangeRequest('prev')}
          disabled={loading || activeStep === 0}
          className="room-stepper-nav-button"
        >
          <ArrowLeftOutlined /> Назад
        </Button>
        <Steps
          current={loading ? -1 : activeStep}
          size="small"
          className="room-stepper-steps"
          direction={isMobile ? 'vertical' : 'horizontal'}
        >
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
                    <Tooltip title={step.description} placement="top">
                      <span
                        className={`room-stepper-step-title ${
                          index === activeStep ? 'active' : ''
                        }`}
                      >
                        {step.name}
                      </span>
                    </Tooltip>
                  }
                  icon={
                    index < activeStep ? (
                      <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    ) : index === activeStep ? (
                      <LoadingOutlined style={{ color: '#1890ff' }} />
                    ) : (
                      <div className="step-icon">
                        <span>{index + 1}</span>
                      </div>
                    )
                  }
                  status={
                    index < activeStep
                      ? 'finish'
                      : index === activeStep
                      ? 'process'
                      : 'wait'
                  }
                />
              ))}
        </Steps>
        <Button
          type="default"
          onClick={() => handlePhaseChangeRequest('next')}
          disabled={loading || activeStep === steps.length - 1}
          className="room-stepper-nav-button"
        >
          Вперед <ArrowRightOutlined />
        </Button>
      </div>
    </div>
  );
}

RoomStepper.propTypes = {
  roomId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
};

export default RoomStepper;