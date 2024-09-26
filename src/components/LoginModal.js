import React from 'react';
import { Modal, Input, Button, Typography, Form } from 'antd';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';

const { Title } = Typography;

function LoginModal({ open, onLogin }) {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    onLogin(values.username);
  };

  return (
    <Modal
      open={open}
      footer={null}
      closable={false}
      centered
    >
      <div style={{ textAlign: 'center' }}>
        <Title level={3}>Добро пожаловать</Title>
        <Form form={form} onFinish={handleFinish} layout="vertical">
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Пожалуйста, введите ваше имя' }]}
          >
            <Input
              placeholder="Введите ваше имя"
              prefix={<UserOutlined />}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block icon={<LoginOutlined />}>
              Войти
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
}

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
};

export default LoginModal;