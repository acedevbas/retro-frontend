import React, { useState, useEffect } from 'react';
import { Input, Typography, Button, Space } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import './EditableRoomName.css';

const { Title } = Typography;

const EditableRoomName = ({ currentName, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentName);

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSave = async () => {
    setIsEditing(false);
    if (name !== currentName) {
      await onSave(name);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(currentName);
  };

  return (
    <div className="editable-room-name">
      {isEditing ? (
        <Space>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onPressEnter={handleSave}
            autoFocus
          />
          <Button 
            type="primary" 
            icon={<CheckOutlined />} 
            onClick={handleSave}
          />
          <Button 
            icon={<CloseOutlined />} 
            onClick={handleCancel}
          />
        </Space>
      ) : (
        <Title level={2}>
          {name}
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => setIsEditing(true)} 
          />
        </Title>
      )}
    </div>
  );
};

EditableRoomName.propTypes = {
  currentName: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default EditableRoomName;