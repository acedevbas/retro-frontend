import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import useUser from '../hooks/useUser';



const AvatarOrAnonymous = ({ author, currentPhaseId }) => {
  const phasesToShowAuthor = [ 'Discussion', 'Finish'];
  const isAnonymous = !phasesToShowAuthor.includes(currentPhaseId);
  const {user,  loading, error } = useUser(author);
  
  if (isAnonymous) {
    return (
      <Tooltip title="Анонимный пользователь">
        <Avatar icon={<UserOutlined />} />
      </Tooltip>
    );
  }

  if (loading) {
    return (
      <Tooltip title="Загрузка...">
        <Avatar icon={<UserOutlined />} />
      </Tooltip>
    );
  }

  if (error) {
    return (
      <Tooltip title={`Ошибка: ${error}`}>
        <Avatar icon={<UserOutlined />} />
      </Tooltip>
    );
  }


  return (
    <Tooltip title={user.username || 'Неизвестно'}>
      <Avatar
        style={{ marginRight: '8px' }}
        src={user?.avatar}
        icon={!user?.avatar && <UserOutlined />}
      />
    </Tooltip>
  );
};

AvatarOrAnonymous.propTypes = {
  authorName: PropTypes.string,
  author: PropTypes.string,
  currentPhaseId: PropTypes.string.isRequired,
};

export default AvatarOrAnonymous;