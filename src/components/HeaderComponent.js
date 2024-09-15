import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Layout, Typography, Menu, Space, Button, Drawer, Grid, List, Avatar,
  ConfigProvider
} from 'antd';
import {
  UserOutlined, HomeOutlined, MenuOutlined, FileTextOutlined,
  ShareAltOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import moment from 'moment';
import 'moment/locale/ru';

moment.locale('ru');

const { Header } = Layout;
const { useBreakpoint } = Grid;

const HeaderComponent = ({ users }) => {
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [menuDrawerOpen, setMenuDrawerOpen] = useState(false);
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [shareDrawerOpen, setShareDrawerOpen] = useState(false);
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

  const closeDrawer = (setDrawerOpen) => {
    setDrawerOpen(false);
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
        showDrawer(setShareDrawerOpen);
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
        {/* Логотип и название */}
        <Space>
       
          <Typography.Title level={4} style={{ margin: 0 }}>
          <img
            src="/logo.png" // Убедитесь, что логотип находится по этому пути
            alt="Logo"
            style={{ width: 150}}
          />
          </Typography.Title>
        </Space>

        {/* Меню и информация о комнате */}
        {screens.md ? (
          <Space align="center">
            <Menu
              mode="horizontal"
              theme="light"
              items={menuItems}
              style={{ borderBottom: 'none' }}
              selectedKeys={getSelectedKeys()} // Устанавливаем выделенные ключи
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

      {/* Выдвижное меню для мобильных устройств */}
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
          selectedKeys={getSelectedKeys()} // Устанавливаем выделенные ключи
        />
      </Drawer>

      {/* Отступ для фиксированного хедера */}
      <div style={{ height: 64 }} />

      {/* Drawer для участников */}
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
                {user.username ? user.username[0].toUpperCase() : '?'}
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

      {/* Drawer для "Заметок" */}
      <Drawer
        title="Заметки"
        placement="right"
        onClose={() => closeDrawer(setNotesDrawerOpen)}
        open={notesDrawerOpen}
        width={400}
      >
        <Typography.Title level={5}>
          В разработке
        </Typography.Title>
        <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
      </Drawer>

      {/* Drawer для "Поделиться" */}
      <Drawer
        title="Поделиться"
        placement="right"
        onClose={() => closeDrawer(setShareDrawerOpen)}
        open={shareDrawerOpen}
        width={300}
      >
        <Typography.Title level={5}>
          В разработке
        </Typography.Title>
        <ExclamationCircleOutlined style={{ fontSize: '32px', color: '#1890ff' }} />
      </Drawer>
    </ConfigProvider>
  );
};

HeaderComponent.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      
    })
  ),
};

HeaderComponent.defaultProps = {
  initialUsers: [],
};

export default HeaderComponent;