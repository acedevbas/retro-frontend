import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { UserOutlined, CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { Input, Button, DatePicker, Select, Form, Card, Typography } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import ruRU from 'antd/lib/locale/ru_RU';
import DroppableArea from './DroppableArea';
import styled from 'styled-components';

const { TextArea } = Input;
const { Option } = Select;
const { Text } = Typography;

const StyledCard = styled(Card)`
    .ant-card-body {
        padding: 0;
    }
`;

const NoteAddForm = ({ users, onAdd }) => {
    const [newNote, setNewNote] = useState({ text: '', executor: '', deadline: '', cards: [], uuid: Date.now().toString() });
    const [formVisible] = useState(true);

    useEffect(() => {
        if (formVisible) {
            setNewNote({ text: '', executor: '', deadline: '', cards: [], uuid: Date.now().toString() });
        }
    }, [formVisible]);

    const handleChange = (e) => {
        setNewNote({ ...newNote, [e.target.name]: e.target.value });
    };

    const handleDateChange = (date, dateString) => {
        setNewNote({ ...newNote, deadline: dateString });
    };

    const handleAdd = () => {
        onAdd(newNote);
        setNewNote({ text: '', executor: '', deadline: '', cards: [], uuid: Date.now().toString() });
        form.resetFields(); // Сброс формы после добавления заметки
    };

    const handleCardDrop = (card) => {
        if (!newNote.cards.find(c => c.uuid === card.uuid)) {
            setNewNote(prevNote => ({
                ...prevNote,
                cards: [...prevNote.cards, card]
            }));
        }
    };

    const handleRemoveCard = (cardUuid) => {
        setNewNote(prevNote => ({
            ...prevNote,
            cards: prevNote.cards.filter(card => card.uuid !== cardUuid)
        }));
    };

    const [form] = Form.useForm();

    return (
        <StyledCard
            style={{
                borderRadius: '10px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
        >
            <Form form={form} layout="vertical" onFinish={handleAdd}>
                <Form.Item
                    label={<Text strong>Исполнитель</Text>}
                    style={{ marginBottom: '20px' }}
                >
                    <Select
                        prefix={<UserOutlined />}
                        name="executor"
                        value={newNote.executor}
                        onChange={(value) => setNewNote({ ...newNote, executor: value })}
                        placeholder="Выберите исполнителя"
                        style={{ width: '100%' }}
                        allowClear
                    >
                        {users.map(user => (
                            <Option key={user.username} value={user.username}>
                                <UserOutlined style={{ marginRight: 8 }} />
                                {user.username}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label={<Text strong>Срок</Text>}
                    style={{ marginBottom: '20px' }}
                >
                    <DatePicker
                        prefix={<CalendarOutlined />}
                        name="deadline"
                        value={newNote.deadline ? dayjs(newNote.deadline) : null}
                        onChange={handleDateChange}
                        placeholder="Выберите дату"
                        style={{ width: '100%' }}
                        locale={ruRU}
                        allowClear
                    />
                </Form.Item>
                <Form.Item
                    label={<Text strong>Текст заметки</Text>}
                    name="text"
                    rules={[{ required: true, message: 'Пожалуйста, введите текст заметки' }]}
                >
                    <TextArea
                        name="text"
                        value={newNote.text}
                        onChange={handleChange}
                        style={{ resize: 'none' }}
                        rows={3}
                        placeholder="Введите текст заметки"
                    />
                </Form.Item>
                <DroppableArea
                    cards={newNote.cards}
                    onCardDrop={handleCardDrop}
                    onRemoveCard={handleRemoveCard}
                />
                <Button htmlType="submit" type="primary" style={{ width: '100%', marginTop: '20px' }}>
                    <PlusOutlined /> Добавить заметку
                </Button>
            </Form>
        </StyledCard>
    );
};

NoteAddForm.propTypes = {
    users: PropTypes.arrayOf(
        PropTypes.shape({
            username: PropTypes.string.isRequired,
        })
    ).isRequired,
    onAdd: PropTypes.func.isRequired,
};

export default NoteAddForm;