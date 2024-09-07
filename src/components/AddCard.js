import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Select, Row, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Option } = Select;

const AddCard = ({ columns, onAddCard }) => {
  const [newCardText, setNewCardText] = useState('');
  const [selectedColumnId, setSelectedColumnId] = useState(columns[0]?._id || '');

  const handleAddCard = () => {
    if (newCardText.trim() && selectedColumnId) {
      onAddCard({ content: newCardText, columnId: selectedColumnId });
      setNewCardText('');
    }
  };

  return (
    <Card style={{ marginBottom: '16px', background: '#ffffff' }}>
      <Row gutter={16} style={{ alignItems: 'center' }}>
        <Col xs={24} sm={12} md={10}>
          <Input
            placeholder="Add new card"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            prefix={<EditOutlined />}
            suffix={<CheckCircleOutlined style={{ color: newCardText ? '#52c41a' : '#ccc' }} />}
          />
        </Col>
        <Col xs={12} sm={6} md={8}>
          <Select
            style={{ width: '100%' }}
            value={selectedColumnId}
            onChange={(value) => setSelectedColumnId(value)}
            suffixIcon={<CheckCircleOutlined />}
          >
            {columns.map((column) => (
              <Option key={column._id} value={column._id}>
                {column.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col xs={12} sm={6} md={6}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="middle"
            onClick={handleAddCard}
            block
          >
            Add
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

AddCard.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  })).isRequired,
  onAddCard: PropTypes.func.isRequired,
};

export default AddCard;
