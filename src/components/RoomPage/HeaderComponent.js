import React, { useEffect, useRef, useState, useContext } from 'react';
import { Layout, Mentions, Typography, Button, Avatar, Tooltip, Dropdown, Menu } from 'antd';
import { ShareAltOutlined, SettingOutlined, AppstoreOutlined, FileTextOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import { TabContext } from './RoomPage';

const { Header } = Layout;

const HeaderComponent = ({
  roomName,
  user,
  isEditingName,
  newRoomName,
  setNewRoomName,
  handleNameChange,
  setIsEditingName,
  buttonStyle,
  colorBgContainer,
  onShareButtonClick,
}) => {
  const [mentionsWidth, setMentionsWidth] = useState(0);
  const textRef = useRef(null);
  const placeholderText = 'Название комнаты';
  const [minWidth, setMinWidth] = useState(0);

  const { activeTab, setActiveTab } = useContext(TabContext);

  useEffect(() => {
    if (newRoomName.length > 50) {
      setNewRoomName(newRoomName.slice(0, 50));
    }
  }, [newRoomName, setNewRoomName]);

  useEffect(() => {
    // Обновляем ширину компонента Mentions в зависимости от ширины текста
    if (textRef.current) {
      setMentionsWidth(textRef.current.offsetWidth + 35); // Добавляем дополнительные пиксели к ширине
    }
  }, [roomName, newRoomName]);

  useEffect(() => {
    // Вычисляем минимальную ширину на основе текста-заглушки
    const tempDiv = document.createElement('span');
    tempDiv.style.visibility = 'hidden';
    tempDiv.style.whiteSpace = 'nowrap';
    tempDiv.style.fontSize = '24px';
    tempDiv.style.lineHeight = '32px';
    tempDiv.style.padding = '0 4px';
    tempDiv.textContent = placeholderText;
    document.body.appendChild(tempDiv);
    setMinWidth(tempDiv.offsetWidth + 35);
    document.body.removeChild(tempDiv);
  }, []);

  const activeButtonStyle = {
    backgroundColor: '#1890ff',
    color: 'white',
  };

  // Меню для Dropdown пользователя
  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Профиль
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Настройки
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        Выйти
      </Menu.Item>
    </Menu>
  );

  return (
    <Header
      style={{
        padding: '0 16px',
        background: colorBgContainer,
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        height: '64px',
        justifyContent: 'space-between',
        position: 'relative',
      }}
    >
      {/* Левая часть с кнопками */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title="Дашборд">
          <Button
            type="text"
            icon={<AppstoreOutlined style={{ fontSize: '16px' }} />}
            onClick={() => setActiveTab('main')}
            style={{
              ...buttonStyle,
              marginRight: '4px',
              ...(activeTab === 'main' ? activeButtonStyle : {}),
            }}
          />
        </Tooltip>
        <Tooltip title="Заметки">
          <Button
            type="text"
            icon={<FileTextOutlined style={{ fontSize: '16px' }} />}
            onClick={() => setActiveTab('notes')}
            style={{
              ...buttonStyle,
              marginRight: '4px',
              ...(activeTab === 'notes' ? activeButtonStyle : {}),
            }}
          />
        </Tooltip>
        <Button
          type="text"
          icon={<ShareAltOutlined style={{ fontSize: '16px' }} />}
          onClick={onShareButtonClick}
          style={{ ...buttonStyle, marginRight: '4px' }}
        />
        <Button
          type="text"
          icon={<SettingOutlined style={{ fontSize: '16px' }} />}
          style={buttonStyle}
        />
      </div>

      {/* Центральная часть с названием комнаты */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        <span
          ref={textRef}
          style={{
            position: 'absolute',
            visibility: 'hidden',
            whiteSpace: 'nowrap',
            fontSize: '24px',
            lineHeight: '32px',
            padding: '0 4px',
          }}
        >
          {isEditingName ? newRoomName : roomName}
        </span>
        <Mentions
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%) translateX(-80px)', // Center and shift 80px to the left
            margin: 0,
            display: 'inline-block',
            fontSize: '24px',
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '32px',
            lineHeight: '22px', // Ensures vertical centering
            padding: '0 4px', // Add some padding to ensure text fits well
            background: 'transparent', // Ensure background is transparent
            border: 'none', // Remove border to make it look like plain text
            width: `${Math.max(mentionsWidth, minWidth)}px`, // Set width based on text width plus 5 pixels or minWidth
          }}
          value={isEditingName ? newRoomName : roomName}
          onChange={(value) => {
            if (isEditingName) {
              setNewRoomName(value.slice(0, 50));
            }
          }}
          onPressEnter={handleNameChange}
          onBlur={handleNameChange}
          readOnly={!isEditingName}
          onClick={() => setIsEditingName(true)}
          autoSize={{ minRows: 1, maxRows: 1 }}
          variant="borderless"
          placeholder={placeholderText}
        />
  
      </div>

      {/* Правая часть с аватаром пользователя и именем */}
      <div style={{ display: 'flex', alignItems: 'center', marginRight: '24px' /* Добавили отступ справа */ }}>
        <Dropdown overlay={userMenu} trigger={['click']}>
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <Tooltip title="Профиль пользователя">
              <Avatar
                size={40}
                style={{ marginRight: '8px', backgroundColor: '#87d068' }}
                src={user?.avatar}
                alt={user?.username}
              />
            </Tooltip>
            <Typography.Text strong>{user?.username}</Typography.Text>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

HeaderComponent.propTypes = {
  roomName: PropTypes.string.isRequired,
  user: PropTypes.object,
  isEditingName: PropTypes.bool.isRequired,
  newRoomName: PropTypes.string.isRequired,
  setNewRoomName: PropTypes.func.isRequired,
  handleNameChange: PropTypes.func.isRequired,
  setIsEditingName: PropTypes.func.isRequired,
  buttonStyle: PropTypes.object.isRequired,
  colorBgContainer: PropTypes.string.isRequired,
  onShareButtonClick: PropTypes.func.isRequired,
};

export default HeaderComponent;