// AddCardForm.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Popover, Space, message } from 'antd';
import { SmileOutlined, PlusOutlined } from '@ant-design/icons';
import './AddCardForm.css';

const { TextArea } = Input;

const customEmojis = [
  '😍', '😁', '🥰', '🤠', '🥴', '🧐', 
  '🥺', '🥸', '💩', '🤡', '😰', '😭', 
  '👌', '👍', '👎'
];

const AddCardForm = ({ columnId, addCard }) => {
  const [newCardText, setNewCardText] = useState('');

  const handleAddCard = () => {
    if (newCardText.trim()) {
      addCard(columnId, newCardText.trim());
      setNewCardText('');
    } else {
      message.warning('Пожалуйста, введите текст для карточки.');
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewCardText((prev) => prev + emoji);
  };

  return (
    <div className="add-card-form">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div className="text-area-container">
          <TextArea
            placeholder="Добавить карточку"
            value={newCardText}
            onChange={(e) => setNewCardText(e.target.value)}
            autoSize={{ minRows: 2, maxRows: 6 }}
            maxLength={200}
            className="text-area"
          />
          <Popover
            content={
              <div className="emoji-picker">
                {customEmojis.map((emoji) => (
                  <span
                    key={emoji}
                    className="emoji-item"
                    onClick={() => handleEmojiClick(emoji)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Добавить эмодзи ${emoji}`}
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
              className="emoji-button"
              aria-label="Добавить эмодзи"
            />
          </Popover>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddCard}
          className="add-card-button"
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
