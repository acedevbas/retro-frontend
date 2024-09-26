import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { List, Button, Typography, Collapse, Tooltip, Select, DatePicker, Badge, Card, Input, Empty, Popover } from 'antd';
import { DownOutlined, UpOutlined, DeleteOutlined, FileTextOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import DroppableArea from './DroppableArea';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import './NoteList.css'; // Импортируем файл стилей

dayjs.locale('ru'); // Устанавливаем локаль для date picker

const { Text, Paragraph, Title } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const NoteList = ({ notes, onEdit, onRemoveCardFromNote, onCardDrop, onDeleteNote, users }) => {
    const [activeKey, setActiveKey] = useState([]);
    const [popoverVisible, setPopoverVisible] = useState({});

    const handleCollapseChange = (key) => {
        setActiveKey(key);
    };

    const handleFieldChange = (noteId, field, value) => {
        const note = notes.find(note => note.uuid === noteId);
        if (note) {
            onEdit(noteId, { ...note, [field]: value });
        } else {
            console.warn('Note not found for uuid:', noteId);
        }
    };

    const handleDelete = (noteId) => {
        onDeleteNote(noteId);
        setPopoverVisible({ ...popoverVisible, [noteId]: false });
    };

    const handleVisibleChange = (noteId, visible) => {
        setPopoverVisible({ ...popoverVisible, [noteId]: visible });
    };

    const renderHeader = (note) => (
        <div className="header-container">
            <div className="header-content">
                {activeKey.includes(note.uuid) ? (
                    <Title level={4} className="title">
                        Детали заметки
                    </Title>
                ) : (
                    <Text ellipsis className="note-text">
                        {note.text}
                    </Text>
                )}
                <Tooltip title={`Создано: ${dayjs(note.createdAt).format('DD.MM.YYYY HH:mm')} Изменено: ${dayjs(note.updatedAt).format('DD.MM.YYYY HH:mm')}`}>
                    <span className="created-date">
                        <CalendarOutlined style={{ marginRight: 4 }} />
                        {dayjs(note.createdAt).format('DD.MM.YYYY')}
                    </span>
                </Tooltip>
            </div>
            <div className="header-right">
                {activeKey.includes(note.uuid) && <Badge status={note.status} />}
            </div>
        </div>
    );

    return (
        <>
            <List
                itemLayout="horizontal"
                dataSource={notes}
                renderItem={(note) => (
                    <Card
                        className="card note-card"
                        style={{ body: { padding: '0px' } }} 
                    >
                        <Collapse
                            activeKey={activeKey}
                            onChange={handleCollapseChange}
                            bordered={false}
                           
                            expandIcon={({ isActive }) => (
                                <Tooltip title={isActive ? 'Свернуть' : 'Развернуть'}>
                                    <Button type="link" icon={isActive ? <UpOutlined /> : <DownOutlined />} />
                                </Tooltip>
                            )}
                        >
                            <Panel
                                key={note.uuid}
                                header={renderHeader(note)}
                            >
                                <div className="panel-content">
                                    <Paragraph>
                                        <Text strong>Описание: </Text>
                                        <Input.TextArea
                                            value={note.text}
                                            onChange={(e) => handleFieldChange(note.uuid, 'text', e.target.value)}
                                            autoSize
                                            bordered={false}
                                            className="text-area"
                                        />
                                    </Paragraph>
                                    <Paragraph>
                                        <Text strong>Исполнитель: </Text>
                                        <Select
                                            value={note.executor || undefined}
                                            onChange={(value) => handleFieldChange(note.uuid, 'executor', value || null)}
                                            bordered={false}
                                            className="select"
                                            placeholder="Выберите исполнителя"
                                            allowClear
                                        >
                                            {users.map((user) => (
                                                <Option key={user.username} value={user.username}>
                                                    <UserOutlined style={{ marginRight: 8 }} />
                                                    {user.username}
                                                </Option>
                                            ))}
                                        </Select>
                                    </Paragraph>
                                    <Paragraph>
                                        <Text strong>Срок: </Text>
                                        <DatePicker
                                            value={note.dueDate ? dayjs(note.dueDate) : null}
                                            onChange={(date) => {
                                                handleFieldChange(note.uuid, 'dueDate', date ? date.toDate() : null);
                                            }}
                                            bordered={false}
                                            className="date-picker"
                                            placeholder="Выберите дату"
                                            suffixIcon={null} // Убираем иконку
                                            clearIcon={<span>&times;</span>} // Используем символ "&times;" для крестика
                                            onClick={(e) => e.stopPropagation()} // Prevent collapse on date picker click
                                            format="DD.MM.YYYY"
                                        />
                                    </Paragraph>
                           
                                    <DroppableArea
                                        cards={note.cards}
                                        onCardDrop={(card) => {
                                            onCardDrop(note.uuid, card);
                                        }}
                                        onRemoveCard={(cardId) => {
                                            onRemoveCardFromNote(note.uuid, cardId);
                                        }}
                                    />
                                    <div className="delete-container">
                                        <Popover
                                            content={
                                                <div>
                                                    <p>Вы уверены, что хотите удалить эту заметку?</p>
                                                    <Button onClick={() => handleDelete(note.uuid)} type="primary" danger>
                                                        Удалить
                                                    </Button>
                                                </div>
                                            }
                                            title="Подтверждение удаления"
                                            trigger="click"
                                            visible={popoverVisible[note.uuid]}
                                            onVisibleChange={(visible) => handleVisibleChange(note.uuid, visible)}
                                        >
                                            <Button
                                                type="link"
                                                icon={<DeleteOutlined />}
                                                className="delete-button ant-btn-dangerous"
                                                onClick={(e) => e.stopPropagation()} // Prevent collapsing on delete button click
                                            >
                                                <Text type="danger">Удалить заметку</Text>
                                            </Button>
                                        </Popover>
                                    </div>
                                </div>
                            </Panel>
                        </Collapse>
                    </Card>
                )}
                locale={{
                    emptyText: (
                        <Card className="card empty-card">
                            <Empty
                                description={<Text type="secondary">Нет заметок</Text>}
                                image={<FileTextOutlined className="empty-icon" />}
                                imageStyle={{ height: 40 }}
                            />
                        </Card>
                    )
                }}
                className="list"
            />
        </>
    );
};

NoteList.propTypes = {
    notes: PropTypes.arrayOf(
        PropTypes.shape({
            uuid: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
            executor: PropTypes.string,
            dueDate: PropTypes.string,
            createdAt: PropTypes.string.isRequired, // Добавляем createdAt
            updatedAt: PropTypes.string.isRequired, // Добавляем updatedAt
            cards: PropTypes.arrayOf(
                PropTypes.shape({
                    _id: PropTypes.string.isRequired,
                    content: PropTypes.string.isRequired,
                    columnName: PropTypes.string,
                    authorName: PropTypes.string.isRequired,
                    votes: PropTypes.number.isRequired,
                    uuid: PropTypes.string.isRequired,
                })
            ),
        })
    ).isRequired,
    onEdit: PropTypes.func.isRequired,
    onRemoveCardFromNote: PropTypes.func.isRequired,
    onCardDrop: PropTypes.func.isRequired,
    onDeleteNote: PropTypes.func.isRequired,
    users: PropTypes.arrayOf(
        PropTypes.shape({
            username: PropTypes.string,
            userId: PropTypes.string,
        })
    ),
};

export default NoteList;