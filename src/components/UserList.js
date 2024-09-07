import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Avatar, Typography } from 'antd';

const UserList = ({ users = [] }) => {
  // Вывод сообщения, если список пользователей пуст
  if (users.length === 0) {
    return (
      <Typography.Text type="secondary" style={{ padding: '16px', display: 'block' }}>
        Нет доступных пользователей.
      </Typography.Text>
    );
  }

  return (
    <Menu theme="dark" mode="inline">
      {users.map(user => (
        <Menu.Item key={user.id || user.username}>
          <Avatar style={{ backgroundColor: '#87d068', marginRight: '8px' }}>
            {user.username ? user.username.charAt(0).toUpperCase() : '?'}
          </Avatar>
          {user.username || 'Unknown User'}
        </Menu.Item>
      ))}
    </Menu>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // если id может быть строкой или числом
      username: PropTypes.string.isRequired,
    })
  ),
};

export default UserList;
