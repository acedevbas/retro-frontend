import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Layout, Typography, Menu, Space, Button, Drawer, Grid, List, Avatar,
  ConfigProvider, Modal, Input, message
} from 'antd';
import {
  UserOutlined, HomeOutlined, MenuOutlined, FileTextOutlined,
  ShareAltOutlined, CopyOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ru';
import NotesDrawerContent from './header/NotesDrawerContent';
moment.locale('ru');

const { Header } = Layout;
const { useBreakpoint } = Grid;

const HeaderComponent = ({ roomId, users, socket }) => {
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const screens = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const getSelectedKeys = () => {
    const { pathname } = location;
    if (pathname === '/') return ['home'];
    return [];
  };

  const showDrawer = (setDrawerOpen) => {
    setDrawerOpen(true);
  };

  const closeDrawer = (setDrawerOpen) => setDrawerOpen(false);

  const showModal = () => {
    setShareModalVisible(true);
  };

  const handleOk = () => {
    setShareModalVisible(false);
  };

  const handleCancel = () => {
    setShareModalVisible(false);
  };

  const copyToClipboard = () => {
    const url = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(url).then(() => {
      message.success('Ссылка скопирована в буфер обмена!');
    }).catch(() => {
      message.error('Не удалось скопировать ссылку.');
    });
  };

  const menuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => {
        navigate('/');
        if (!screens.md) {
          closeDrawer(setMenuDrawerOpen);
        }
      },
    },
    {
      key: 'participants',
      icon: <UserOutlined />,
      label: 'Участники',
      onClick: () => {
        showDrawer(setParticipantsDrawerOpen);
        if (!screens.md) {
          closeDrawer(setMenuDrawerOpen);
        }
      },
    },
    {
      key: 'notes',
      icon: <FileTextOutlined />,
      label: 'Заметки',
      onClick: () => {
        showDrawer(setNotesDrawerOpen);
        if (!screens.md) {
          closeDrawer(setMenuDrawerOpen);
        }
      },
    },
    {
      key: 'share',
      icon: <ShareAltOutlined />,
      label: 'Поделиться',
      onClick: () => {
        showModal();
        if (!screens.md) {
          closeDrawer(setMenuDrawerOpen);
        }
      },
    },
  ];

  return (
    <ConfigProvider locale={{ locale: 'ru', DatePicker: { locale: moment.locale('ru') } }}>
      <Header
        style={{
          backgroundColor: '#fff',
          padding: '0 50px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          position: 'fixed',
          width: '100%',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Typography.Title level={4} style={{ margin: 0 }}>
            <img
              src="/logo.png" // Убедитесь, что логотип находится по этому пути
              alt="Logo"
              style={{ width: 150 }}
            />
          </Typography.Title>
        </Space>

        {screens.md ? (
          <Space align="center">
            <Menu
              mode="horizontal"
              theme="light"
              items={menuItems}
              style={{ borderBottom: 'none' }}
              selectedKeys={getSelectedKeys()}
            />
          </Space>
        ) : (
          <Space align="center">
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              onClick={() => showDrawer(setMenuDrawerOpen)}
            />
          </Space>
        )}
      </Header>

      <Drawer
        title="Меню"
        placement="right"
        onClose={() => closeDrawer(setMenuDrawerOpen)}
        open={menuDrawerOpen}
      >
        <Menu
          mode="vertical"
          items={menuItems}
          onClick={() => closeDrawer(setMenuDrawerOpen)}
          selectedKeys={getSelectedKeys()}
        />
      </Drawer>

      <div style={{ height: 64 }} />

      <Drawer
        title="Участники комнаты"
        placement="right"
        onClose={() => closeDrawer(setParticipantsDrawerOpen)}
        open={participantsDrawerOpen}
        width={300}
      >
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={user => (
            <List.Item key={user.userId}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{
                      backgroundColor: user.avatarColor || '#6ac185',
                      color: '#fff'
                    }}
                  >
                    {user.username }
                  </Avatar>
                }
                title={
                  <Typography.Text strong>
                    {user.username}
                  </Typography.Text>
                }
                description={user.email}
              />
            </List.Item>
          )}
        />
      </Drawer>

      <Drawer
        title="Заметки"
        placement="right"
        onClose={() => closeDrawer(setNotesDrawerOpen)}
        open={notesDrawerOpen}
        width={400}
      >
        <NotesDrawerContent closeDrawer={() => closeDrawer(setNotesDrawerOpen)} socket={socket} roomId={roomId} users={users} />
      </Drawer>

      <Modal
        title="Пригласить в комнату"
        visible={shareModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Отмена
          </Button>,
          <Button key="copy" type="primary" icon={<CopyOutlined />} onClick={copyToClipboard}>
            Копировать ссылку
          </Button>,
        ]}
      >
        <Typography.Paragraph>
          Поделитесь этой ссылкой с другими, чтобы пригласить их в комнату:
        </Typography.Paragraph>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 32px)' }}
            value={`${window.location.origin}/room/${roomId}`}
            readOnly
          />
          <Button icon={<CopyOutlined />} onClick={copyToClipboard} />
        </Input.Group>
      </Modal>
    </ConfigProvider>
  );
};

HeaderComponent.propTypes = {
  roomId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string,
      avatarColor: PropTypes.string,
    })
  ),
};

HeaderComponent.defaultProps = {
  users: [],
};

export default HeaderComponent;