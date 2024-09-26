import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Typography, Skeleton } from 'antd';
import {
  PieChartOutlined,
  DesktopOutlined,
  UserOutlined,
  TeamOutlined,
  FileOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import './SidebarComponent.css';
import LogoMini from './logo-mini';
import LogoFull from './logo-full';

const { Sider } = Layout;
const { Text } = Typography;
const { SubMenu } = Menu;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'fixed',
  top: 0,
  bottom: 0,
  backgroundColor: '#001529',
  transition: 'all 0.3s ease',
};

const logoContainerStyle = {
  margin: '15px 10px 40px 10px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const items = [
  {
    key: '1',
    icon: <PieChartOutlined />,
    label: 'Option 1',
  },
  {
    key: '2',
    icon: <DesktopOutlined />,
    label: 'Option 2',
  },
  {
    key: 'sub1',
    icon: <UserOutlined />,
    label: 'User',
    items: [
      { key: '3', label: 'Tom' },
      { key: '4', label: 'Bill' },
      { key: '5', label: 'Alex' },
    ],
  },
  {
    key: 'sub2',
    icon: <TeamOutlined />,
    label: 'Team',
    items: [
      { key: '6', label: 'Team 1' },
      { key: '8', label: 'Team 2' },
    ],
  },
  {
    key: '9',
    icon: <FileOutlined />,
    label: 'Files',
  },
];

const SidebarComponent = ({ collapsed, setCollapsed, users }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (users.length > 0) {
      setLoading(false);
    }
  }, [users]);

  const handleCollapseToggle = () => {
    setCollapsed(!collapsed);
  };

  return (
    <Sider
      width={300}
      style={siderStyle}
      collapsedWidth={80}
      collapsible
      collapsed={collapsed}
      onCollapse={handleCollapseToggle}
      trigger={null}
    >
      <div style={logoContainerStyle}>
        {collapsed ? (
          <div className="logoContainer logoMiniContainer logoCollapse">
            <LogoMini style={{ height: '60px' }} />
          </div>
        ) : (
          <div className="logoContainer logoFullContainer logoExpand">
            <LogoFull style={{ height: '60px' }} />
          </div>
        )}
      </div>
      <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
        {items.map((item) =>
          item.items ? (
            <SubMenu key={item.key} icon={item.icon} title={item.label}>
              {item.items.map((subItem) => (
                <Menu.Item key={subItem.key}>{subItem.label}</Menu.Item>
              ))}
            </SubMenu>
          ) : (
            <Menu.Item key={item.key} icon={item.icon}>
              {item.label}
            </Menu.Item>
          )
        )}
        <SubMenu key="sub-users" icon={<UserOutlined />} title="Участники">
          {loading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <Menu.Item
                  key={`skeleton-${index}`}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <Skeleton.Avatar
                    active
                    size="small"
                    shape="circle"
                    style={{ marginRight: 8 }}
                  />
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                </Menu.Item>
              ))}
            </>
          ) : (
            users.map((user, index) => (
              <Menu.Item
                key={`user-${index}`}
                disabled
                className="participant-item"
              >
                <Avatar src={user.avatar} style={{ marginRight: 8 }} />
                <Text className="participant-name">{user.username}</Text>
              </Menu.Item>
            ))
          )}
        </SubMenu>
      </Menu>
      <div
        className="ant-layout-sider-trigger"
        onClick={handleCollapseToggle}
        style={{
          width: '100%',
          height: 48,
          position: 'absolute',
          bottom: 0,
          left: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {collapsed ? (
          <span className="anticon anticon-right">
            <RightOutlined style={{ color: 'white' }} />
          </span>
        ) : (
          <span className="anticon anticon-left">
            <LeftOutlined style={{ color: 'white' }} />
          </span>
        )}
      </div>
    </Sider>
  );
};

SidebarComponent.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  setCollapsed: PropTypes.func.isRequired,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default SidebarComponent;