// src/components/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space, Modal, Input, Row, Col, Tooltip } from 'antd';
import { RocketOutlined, FileTextOutlined, CommentOutlined, AppstoreOutlined, GoogleOutlined } from '@ant-design/icons';
import { Player } from '@lottiefiles/react-lottie-player';
import lottieAnimation from '../animations/teamwork-and-stickers.json';
import SVGComponent from './SVGComponent';

function Home() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [template, setTemplate] = useState('standard');

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: roomName, template }),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать комнату');
      }

      const { roomId } = await response.json();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
    handleCreateRoom();
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleTemplateSelect = (value) => {
    setTemplate(value);
  };

  return (
    <div style={styles.container}>
      <div style={styles.logoWrapper}>
        <SVGComponent />
        <Typography.Paragraph style={styles.subtitle}>
          Анализируй опыт, улучшай результат.
        </Typography.Paragraph>
      </div>
      <Typography.Paragraph style={styles.tagline}>
        InsightLoop помогает вам анализировать и улучшать командную работу с помощью ретроспектив.
      </Typography.Paragraph>
      <Space direction="vertical" size="large" align="center">
        <div style={styles.lottieWrapper}>
          <Player autoplay loop src={lottieAnimation} style={{ height: '400px', width: '400px' }} />
        </div>
        <Space direction="horizontal" size="large">
          <Button
            type="primary"
            size="large"
            icon={<RocketOutlined />}
            style={styles.createButton}
            onClick={showModal}
          >
            Быстрое ретро
          </Button>
          <Tooltip title="В разработке">
            <Button
              type="default"
              size="large"
              icon={<GoogleOutlined />}
              disabled
              style={styles.googleButton}
            >
              Войти
            </Button>
          </Tooltip>
        </Space>
        <Modal
          title="Создать новую комнату"
          visible={isModalVisible}
          onOk={handleOk}
          onCancel={handleCancel}
          okText="Создать"
          cancelText="Отмена"
          centered
          bodyStyle={styles.modalBody}
          width={600} // Установим фиксированную ширину для модального окна
        >
          <Typography.Paragraph style={styles.modalDescription}>
            Пожалуйста, введите название комнаты и выберите шаблон для создания новой ретроспективы.
          </Typography.Paragraph>
          <Input
            placeholder="Введите название комнаты"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            style={{ marginBottom: '20px' }}
          />
          <Typography.Paragraph>
            Выберите шаблон:
          </Typography.Paragraph>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Button
                type={template === 'standard' ? 'primary' : 'default'}
                onClick={() => handleTemplateSelect('standard')}
                style={template === 'standard' ? styles.selectedTemplateButton : styles.templateButton}
              >
                <FileTextOutlined style={styles.iconStyle} />
                <Typography.Paragraph>Стандартный</Typography.Paragraph>
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type={template === 'template2' ? 'primary' : 'default'}
                onClick={() => handleTemplateSelect('template2')}
                style={template === 'template2' ? styles.selectedTemplateButton : styles.templateButton}
                disabled
              >
                <CommentOutlined style={styles.iconStyle} />
                <Typography.Paragraph>Шаблон 2</Typography.Paragraph>
              </Button>
            </Col>
            <Col span={8}>
              <Button
                type={template === 'template3' ? 'primary' : 'default'}
                onClick={() => handleTemplateSelect('template3')}
                style={template === 'template3' ? styles.selectedTemplateButton : styles.templateButton}
                disabled
              >
                <AppstoreOutlined style={styles.iconStyle} />
                <Typography.Paragraph>Шаблон 3</Typography.Paragraph>
              </Button>
            </Col>
          </Row>
        </Modal>
      </Space>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    backgroundColor: '#f0f2f5',
    overflow: 'hidden',
  },
  logoWrapper: {
    marginBottom: '20px',
    width: '300px', // Установим ширину контейнера для логотипа
    height: 'auto', // Установим высоту контейнера для логотипа
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(0, 0, 0, 0.45)',
    marginTop: '10px',
  },
  tagline: {
    maxWidth: '600px',
    fontSize: '16px',
    lineHeight: '1.5',
    marginBottom: '40px',
  },
  lottieWrapper: {
    width: '400px',
  },
  createButton: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    borderRadius: '8px',
    padding: '0 40px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#d9d9d9',
    borderRadius: '8px',
    padding: '0 40px',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px', // Добавляем отступ между логотипом и текстом
  },
  templateButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f2f5',
    border: '1px solid #d9d9d9',
    borderRadius: '8px',
    transition: '0.3s',
  },
  selectedTemplateButton: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#1890ff',
    border: '1px solid #1890ff',
    borderRadius: '8px',
    color: '#fff',
    transition: '0.3s',
    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)',
  },
  iconStyle: {
    fontSize: '48px',
    marginBottom: '10px',
  },
  modalBody: {
    maxHeight: '80vh',
    overflowY: 'auto',
    padding: '20px',
  },
  modalDescription: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
};

export default Home;