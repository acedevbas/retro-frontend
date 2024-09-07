import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTimer } from 'react-timer-hook';
import { Button, Typography, Tooltip } from 'antd';
import { ClockCircleOutlined, PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const TimerWidget = ({ socket, roomId, onTimeLeftUpdate, setShowProgressBar }) => {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const modalRef = useRef(null);
  const widgetRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const [audioEnabled, setAudioEnabled] = useState(false);

  const expiryTimestamp = new Date();

  const { seconds, minutes, restart } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      setIsRunning(false);
      setShowProgressBar(false);
      console.log('Timer ended');
      if (audioEnabled) {
        const audio = new Audio('/sounds/sound.mp3');
        audio.play().catch(error => console.error('Error playing sound:', error));
      }
    }
  });

  const initializeTimerState = useRef();

  initializeTimerState.current = () => {
    socket.emit('getTimerState', { roomId }, (response) => {
      if (response && response.success) {
        const { isRunning, remainingTime } = response.timerData;

        if (remainingTime > 0) {
          restart(new Date(Date.now() + remainingTime * 1000), isRunning);
        } else {
          restart(new Date(), false);
          setShowProgressBar(false);
        }

        setIsRunning(isRunning);
        setRemainingTime(remainingTime || 0);

        onTimeLeftUpdate(remainingTime || 0);
        setShowProgressBar(remainingTime > 0);

        console.log('Initialized timer state from server:', response.timerData);
      } else {
        console.error('Failed to initialize timer state:', response.message);
      }
    });
  };

  useEffect(() => {
    initializeTimerState.current();
  }, [socket, roomId]);

useEffect(() => {
  // Ensure the timer is initialized correctly
  const handleTimerUpdate = ({ isRunning, remainingTime, initialTime, eventType }) => {


    setIsRunning(isRunning);

    // Use initialTime if remainingTime is undefined
    const timeToUse = remainingTime !== undefined ? remainingTime : initialTime;

    setRemainingTime(timeToUse);

    const newExpiryTimestamp = new Date(Date.now() + (timeToUse || 0) * 1000);

    if (eventType === 'reset' || eventType === 'update') {
      restart(newExpiryTimestamp, isRunning);
    } else if (timeToUse > 0) {
      restart(newExpiryTimestamp, isRunning);
    } else {
      console.error("Both remainingTime and initialTime are 0 or undefined.");
    }
  };

  socket.on('timerUpdate', handleTimerUpdate);

  return () => {
    socket.off('timerUpdate', handleTimerUpdate);
  };
}, [socket]);



  const toggleStartStop = () => {
    const currentRemainingTime = minutes * 60 + seconds;
    if (socket && isRunning) {
      socket.emit('pauseTimer', { roomId });
    } else {
      socket.emit('startTimer', { roomId, duration: remainingTime || currentRemainingTime });
    }
  };

  const handleReset = () => {
    if (socket) {
      socket.emit('resetTimer', { roomId });
      restart(new Date(), false);
      setIsRunning(false);
      setRemainingTime(0);
      setShowProgressBar(false);
      console.log('Timer reset');
    }
  };

  const incrementTime = (additionalSeconds) => {
    socket.emit('addTime', { roomId, time: additionalSeconds });

    const newRemainingTime = remainingTime + additionalSeconds;
    setRemainingTime(newRemainingTime);
    restart(new Date(Date.now() + newRemainingTime * 1000), isRunning);
    if (socket && isRunning) {
      socket.emit('startTimer', { roomId, duration: newRemainingTime });
    }
    console.log(`Added ${additionalSeconds} seconds to the timer.`);
  };

  const enableAudio = () => setAudioEnabled(true);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (widgetOpen && widgetRef.current && !widgetRef.current.contains(event.target)) {
        setWidgetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [widgetOpen]);

  return (
    <div ref={widgetRef}>
      <Tooltip
        title={isRunning ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : 'Таймер остановлен'}
        placement="top"
        overlayInnerStyle={{ fontSize: '16px', padding: '8px 12px' }}
      >
        <div onClick={() => setWidgetOpen(!widgetOpen)} style={widgetStyle} onMouseDown={enableAudio}>
          <ClockCircleOutlined style={{ fontSize: '24px', cursor: 'pointer', color: '#fff' }} />
        </div>
      </Tooltip>
      <div
        style={{
          ...modalStyle,
          transform: widgetOpen ? 'translateY(0)' : 'translateY(100%)',
          opacity: widgetOpen ? 1 : 0
        }}
        ref={modalRef}
      >
        <Title level={4} style={{ margin: '10px 0', color: '#333' }}>Таймер</Title>
        <Title level={5} style={timerStyle}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Title>
        <div style={{ marginTop: '20px' }}>
          <Button type="primary" shape="circle" icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />} onClick={toggleStartStop} />
          <Button type="default" shape="circle" icon={<ReloadOutlined />} onClick={handleReset} style={{ marginLeft: '10px' }} />
          <div style={{ marginTop: '10px' }}>
            <Button type="default" onClick={() => incrementTime(30)}>+30 сек</Button>
            <Button type="default" onClick={() => incrementTime(60)} style={{ marginLeft: '5px' }}>+1 мин</Button>
            <Button type="default" onClick={() => incrementTime(300)} style={{ marginLeft: '5px' }}>+5 мин</Button>
            <Button type="default" onClick={() => incrementTime(600)} style={{ marginLeft: '5px', marginTop: '5px' }}>+10 мин</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

TimerWidget.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  onTimeLeftUpdate: PropTypes.func.isRequired,
  setShowProgressBar: PropTypes.func.isRequired,
};

const widgetStyle = {
  position: 'fixed',
  bottom: '70px',
  right: '70px',
  zIndex: 1000,
  backgroundColor: '#4a90e2',
  borderRadius: '50%',
  padding: '12px',
  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.1)',
  cursor: 'pointer',
};

const modalStyle = {
  position: 'fixed',
  bottom: '0px',
  right: '20px',
  zIndex: 1000,
  backgroundColor: '#fff',
  borderRadius: '12px 12px 0 0',
  padding: '25px',
  width: '320px',
  boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
  textAlign: 'center',
  transition: 'transform 0.4s ease-out, opacity 0.4s ease-out', // Добавляем плавный переход
};

const timerStyle = {
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '2px',
  color: '#555',
  margin: '15px 0',
};

export default TimerWidget;
