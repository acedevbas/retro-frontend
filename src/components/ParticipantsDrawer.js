import React from 'react';
import { Drawer, List, Avatar } from 'antd';
import PropTypes from 'prop-types';

function ParticipantsDrawer({ visible, onClose, users }) {
  return (
    <Drawer
      title="Участники"
      placement="right"
      onClose={onClose}
      open={visible}
      width={320}
    >
      <List
        itemLayout="horizontal"
        dataSource={users}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar>{(item.username || 'U').charAt(0).toUpperCase()}</Avatar>}
              title={item.username || 'Неизвестный пользователь'}
            />
          </List.Item>
        )}
      />
    </Drawer>
  );
}

ParticipantsDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  users: PropTypes.array.isRequired,
};

export default ParticipantsDrawer;