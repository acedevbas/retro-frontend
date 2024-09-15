import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Popover, Space } from 'antd';
import { SmileOutlined, PlusOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const customEmojis = ['😍', '😁', '🥰', '🤠', '🥴', '🧐', '🥺', '🥸', '💩', '🤡', '😰', '😭', '👌', '👍', '👎'];

const AddCardForm = ({ columnId, addCard }) => {
  const [newCardText, setNewCardText] = useState('');

  const handleAddCard = () => {
    if (newCardText.trim()) {
      addCard(columnId, newCardText);
      setNewCardText('');
    }
  };

  return (
    <div style={{ marginBottom: '16px', width: '100%' }}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <TextArea
            placeholder="Добавить карточку"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
            style={{ width: '100%', paddingRight: '40px' }}
          />
          <Popover
            content={
              <div style={{ width: '215px' }}>
                {customEmojis.map((emoji) => (
                  <span
                    key={emoji}
                    style={{
                      fontSize: '24px',
                      cursor: 'pointer',
                      margin: '5px',
                    }}
                    onClick={() => setNewCardText((prev) => prev + emoji)}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            }
            trigger="click"
          >
            <Button
              type="text"
              icon={<SmileOutlined />}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: '18px',
              }}
            />
          </Popover>
        </div>
        <Button
          type="primary"
          block
          icon={<PlusOutlined />}
          onClick={handleAddCard}
        >
          Добавить карточку
        </Button>
      </Space>
    </div>
  );
};

AddCardForm.propTypes = {
  columnId: PropTypes.string.isRequired,
  addCard: PropTypes.func.isRequired,
};

export default AddCardForm;
