import React from 'react';
import { Avatar, Tooltip } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const AvatarOrAnonymous = ({ authorName, currentPhaseId }) => {
  const phasesToShowAuthor = [ 'Discussion', 'Finish'];
  const isAnonymous = !phasesToShowAuthor.includes(currentPhaseId);

  if (isAnonymous) {
    return (
      <Tooltip title="Анонимный пользователь">
        <Avatar icon={<UserOutlined />} />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={authorName || 'Неизвестно'}>
      <Avatar style={{ backgroundColor: '#6ac185' }}>
        {authorName ? authorName[0].toUpperCase() : '?'}
      </Avatar>
    </Tooltip>
  );
};

AvatarOrAnonymous.propTypes = {
  authorName: PropTypes.string,
  currentPhaseId: PropTypes.string.isRequired,
};

export default AvatarOrAnonymous;