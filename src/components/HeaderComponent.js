import React from 'react';
import PropTypes from 'prop-types';
import { Menu, Typography, Space, Button, message, Row, Col } from 'antd';
import { UsergroupAddOutlined, CopyOutlined } from '@ant-design/icons';

const HeaderComponent = ({ roomId, onParticipantsClick }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(roomId).then(
      () => {
        message.success('Код комнаты скопирован в буфер обмена');
      },
      () => {
        message.error('Не удалось скопировать код');
      }
    );
  };

  return (
    <Menu theme="dark" mode="horizontal" style={{ padding: 0 }}> {/* Убедитесь, что здесь переданы только поддерживаемые пропсы */}
      <Row justify="space-between" align="middle" style={{ width: '100%', padding: '0 16px' }}>
        <Col>
          <Space align="center">
            <Typography.Text strong style={{ color: '#fff' }}>
              Комната {roomId}
            </Typography.Text>
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={copyToClipboard}
              style={{ height: '32px', lineHeight: '0', marginLeft: '8px' }}
            />
          </Space>
        </Col>
        <Col>
          <Button
            type="link"
            icon={<UsergroupAddOutlined style={{ fontSize: '20px' }} />}
            onClick={onParticipantsClick}
            style={{ padding: '0', height: '32px' }}
          />
        </Col>
      </Row>
    </Menu>
  );
};

HeaderComponent.propTypes = {
  roomId: PropTypes.string.isRequired,
  onParticipantsClick: PropTypes.func.isRequired,
};

export default HeaderComponent;
