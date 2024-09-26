import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useTimer } from 'react-timer-hook';
import { Button, Typography, Tooltip } from 'antd';
import {
  ClockCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import './TimerWidget.css';

const { Title } = Typography;

const TimerWidget = ({ socket, roomId }) => {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const modalRef = useRef(null);
  const widgetRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [initialTime, setInitialTime] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const expiryTimestamp = new Date();
  const [showProgressAfterExpiration, setShowProgressAfterExpiration] = useState(false);
  const [showCompletedProgressBar, setShowCompletedProgressBar] = useState(false);
  const [, setElapsedTime] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [completed, setCompleted] = useState(false);

  const { seconds, minutes, restart } = useTimer({
    expiryTimestamp,
    autoStart: false,
    onExpire: () => {
        setIsRunning(false);
        setCompleted(true);
        setShowProgressAfterExpiration(true);
        setShowCompletedProgressBar(true);
        console.log('Timer ended');
        if (audioEnabled) {
            const audio = new Audio('/sounds/sound.mp3');
            audio.play().catch((error) => console.error('Error playing sound:', error));
        }
        setTimeout(() => {
            setShowCompletedProgressBar(false);
            setTimeout(() => {
                setShowProgressAfterExpiration(false);
                setCompleted(false);
                setRemainingTime(0);
                setInitialTime(0);
                setElapsedTime(0);
                setProgressPercent(0);
            }, 3000); // 3 секунды на исчезание
        }, 3000); // 3 секунды для полного заполнения
    },
});

// Listen to timer updates
useEffect(() => {
    const handleTimerUpdate = ({
        isRunning: updatedIsRunning,
        remainingTime: updatedRemainingTime,
        initialTime: updatedInitialTime,
        elapsedTime: updatedElapsedTime,
        progressPercent: updatedProgressPercent,
        eventType,
    }) => {
        setInitialTime(Number(updatedInitialTime));
        setRemainingTime(Number(updatedRemainingTime));
        setElapsedTime(Number(updatedElapsedTime));
        setProgressPercent(Number(updatedProgressPercent));
        setIsRunning(updatedIsRunning);

        if (eventType === 'done') {
            setCompleted(true);
            setShowProgressAfterExpiration(true);
            setShowCompletedProgressBar(true);
            if (audioEnabled) {
                const audio = new Audio('/sounds/sound.mp3');
                audio.play().catch((error) => console.error('Error playing sound:', error));
            }
            setTimeout(() => {
                setShowCompletedProgressBar(false);
                setTimeout(() => {
                    setShowProgressAfterExpiration(false);
                    setCompleted(false);
                }, 3000); // 3 секунды на исчезание
            }, 3000); // 3 секунды для полного заполнения
        }

        const newExpiryTimestamp = new Date(Date.now() + (updatedRemainingTime || 0) * 1000);
        if (eventType === 'reset') {
            restart(new Date(), false);
        } else {
            restart(newExpiryTimestamp, updatedIsRunning);
        }
    };

    socket.on('timerUpdate', handleTimerUpdate);

    return () => {
        socket.off('timerUpdate', handleTimerUpdate);
    };
}, [socket, restart, audioEnabled]);

const toggleStartStop = () => {
    if ((remainingTime === 0 && initialTime === 0) || (minutes === 0 && seconds === 0)) {
        console.warn('Cannot start timer with 00:00.');
        return;
    }

    if (socket && isRunning) {
        // Pause the timer
        const currentRemainingTime = minutes * 60 + seconds;
        setRemainingTime(currentRemainingTime);
        setIsRunning(false);
        socket.emit('pauseTimer', { roomId, remainingTime: currentRemainingTime });
        restart(new Date(), false); // Stop the local timer
    } else {
        // Start the timer
        const duration = remainingTime > 0 ? remainingTime : initialTime;

        // Если initialTime не установлен, устанавливаем его
        if (initialTime === 0) {
            setInitialTime(duration);
            socket.emit('startTimer', { roomId, duration, initialTime: duration });
        } else {
            socket.emit('startTimer', { roomId, duration });
        }

        setIsRunning(true);
        const newExpiryTimestamp = new Date(Date.now() + duration * 1000);
        restart(newExpiryTimestamp, true);
    }
};

const handleReset = () => {
    if (socket) {
        socket.emit('resetTimer', { roomId });
        restart(new Date(), false);
        setIsRunning(false);
        setRemainingTime(0);
        setInitialTime(0);
        setElapsedTime(0);
        setProgressPercent(0);
    }
};

const incrementTime = (additionalSeconds) => {
    if (socket) {
        const currentRemainingTime = isRunning ? minutes * 60 + seconds : remainingTime;
        const updatedRemainingTime = (remainingTime === 0 ? 0 : currentRemainingTime) + additionalSeconds;
        const updatedInitialTime = (remainingTime === 0 ? 0 : initialTime) + additionalSeconds;

        setRemainingTime(updatedRemainingTime);
        setInitialTime(updatedInitialTime);

        socket.emit('addTime', { roomId, time: additionalSeconds });

        if (!isRunning) {
            socket.emit('updateTimer', { roomId, remainingTime: updatedRemainingTime, initialTime: updatedInitialTime });
        }

        if (isRunning) {
            const newExpiryTimestamp = new Date(Date.now() + updatedRemainingTime * 1000);
            restart(newExpiryTimestamp, isRunning);
        }
    }
};

const enableAudio = () => setAudioEnabled(true);

useEffect(() => {
    const handleOutsideClick = (event) => {
        if (
            widgetOpen &&
            widgetRef.current &&
            !widgetRef.current.contains(event.target) &&
            modalRef.current &&
            !modalRef.current.contains(event.target)
        ) {
            setWidgetOpen(false);
        }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
        document.removeEventListener('mousedown', handleOutsideClick);
    };
}, [widgetOpen]);


  return (
    <div ref={widgetRef} className="timer-widget">
      <Tooltip
        title={
          isRunning || remainingTime > 0
            ? `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
            : 'Таймер остановлен'
        }
        placement="top"
        overlayInnerStyle={{ fontSize: '16px', padding: '8px 12px' }}
      >
        <div
          onClick={() => setWidgetOpen(!widgetOpen)}
          className={`widget ${isRunning || remainingTime > 0 ? 'active' : ''}`}
          onMouseDown={enableAudio}
        >
          <div className="timer-icon-wrapper">
            <div className="timer-icon-background">
              <ClockCircleOutlined
                className="timer-icon"
              />
            </div>
            {(isRunning || remainingTime > 0 || showProgressAfterExpiration) && initialTime > 0 && (
              <div className="progress-circle-wrapper">
                <svg className="progress-circle" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#108ee9" />
                      <stop offset="100%" stopColor="#87d068" />
                    </linearGradient>
                  </defs>
                  <path
                    className="progress-circle-trail"
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="progress-circle-path"
                    strokeDasharray={`${completed ? 100 : progressPercent}, 100`}
                    d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </Tooltip>
      <div className={`modal ${widgetOpen ? 'open' : ''}`} ref={modalRef}>
        <Title level={4} className="title">
          Таймер
        </Title>
        <Title level={2} className="timer">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Title>
        <div className="progress-container">
          {(isRunning || remainingTime > 0 || showProgressAfterExpiration || completed) && initialTime > 0 && (
            <div className="progress-bar-wrapper">
              <div
                className={`progress-bar ${showCompletedProgressBar ? '' : (showProgressAfterExpiration ? 'fade-out' : 'fade-in')}`}
                style={{
                  width: `${completed ? 100 : progressPercent}%`,
                  transition: showCompletedProgressBar ? 'none' : (showProgressAfterExpiration ? 'opacity 3s' : 'width 0.5s'),
                  opacity: showCompletedProgressBar ? 1 : (showProgressAfterExpiration ? 0 : 1),
                }}
              />
            </div>
          )}
        </div>
        <div style={{ marginTop: '20px' }}>
          <Button
            type="primary"
            shape="circle"
            icon={isRunning ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={toggleStartStop}
            size="large"
            style={{ marginRight: '10px' }}
          />
          <Button
            type="default"
            shape="circle"
            icon={<ReloadOutlined />}
            onClick={handleReset}
            size="large"
          />
        </div>
        <div className="button-container">

          <Button
            type="default"
            onClick={() => incrementTime(30)}
            disabled={isRunning}
          >
            +00:30
          </Button>
          <Button
            type="default"
            onClick={() => incrementTime(60)}
            disabled={isRunning}
          >
            +01:00
          </Button>
          <Button
            type="default"
            onClick={() => incrementTime(300)}
            disabled={isRunning}
          >
            +05:00
          </Button>
          <Button
            type="default"
            onClick={() => incrementTime(600)}
            disabled={isRunning}
          >
            +10:00
          </Button>
        </div>
      </div>
    </div>
  );
};
TimerWidget.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
};

export default TimerWidget;