// NotesDrawerContent.jsx

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Form,
  Button,
  Space,
  Modal,
  Tooltip,
  Input,
  Skeleton,
  notification,
  Card,
  Typography,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import UserPickerWithPopover from '../UserPickerWithPopover';
import DatePickerWithStyledIcon from '../DatePickerWithStyledIcon';
import './NotesDrawerContent.css'

const { Paragraph } = Typography;
const { TextArea } = Input;

const cardStyle = {
  marginBottom: '16px',
};

const variants = {
  hidden: { opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.3 } },
  visible: { opacity: 1, height: 'auto', overflow: 'hidden', transition: { duration: 0.3 } },
  exit: { opacity: 0, height: 0, overflow: 'hidden', transition: { duration: 0.3 } },
  remove: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.3 },
  },
};

const confirmDelete = (noteId, onDelete) => {
  Modal.confirm({
    title: 'Вы уверены, что хотите удалить эту заметку?',
    okText: 'Да',
    cancelText: 'Нет',
    onOk: () => onDelete(noteId),
  });
};

const NotesDrawerContent = ({ socket, roomId, users }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [form] = Form.useForm();
  const [selectedExecutor, setSelectedExecutor] = useState(null);

  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket) return;

    const handleNotesList = (notesList) => {
      setNotes(notesList);
      setLoading(false);
    };

    const handleNoteAdded = (newNote) => {
      setNotes((prevNotes) => [newNote, ...prevNotes]);
    };

    const handleNoteUpdated = (updatedNote) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.uuid === updatedNote.uuid ? updatedNote : note
        )
      );
    };

    const handleNoteDeleted = (deletedNoteId) => {
      setNotes((prevNotes) =>
        prevNotes.filter((note) => note.uuid !== deletedNoteId)
      );
    };

    const handleError = (error) => {
      notification.error({
        message: 'Ошибка',
        description:
          error.message || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
      });
    };

    socket.on('notesList', handleNotesList);
    socket.on('noteAdded', handleNoteAdded);
    socket.on('noteUpdated', handleNoteUpdated);
    socket.on('noteDeleted', handleNoteDeleted);
    socket.on('error', handleError);

    socket.emit('getNotes', { roomId }, (response) => {
      if (response.error) {
        handleError(response.error);
      }
    });

    return () => {
      socket.off('notesList', handleNotesList);
      socket.off('noteAdded', handleNoteAdded);
      socket.off('noteUpdated', handleNoteUpdated);
      socket.off('noteDeleted', handleNoteDeleted);
      socket.off('error', handleError);
    };
  }, [socket, roomId]);

  const handleCancel = () => {
    setSelectedNote(null);
    form.resetFields();
    setSelectedExecutor(null);
    setSelectedDate(null);
    setNoteText('');
  };

  const handleSubmit = (values) => {
    const noteData = {
      ...values,
      text: noteText,
      executor: selectedExecutor || null,
      dueDate: selectedDate ? selectedDate : null,
    };
    if (selectedNote && selectedNote.uuid) {
      socket.emit(
        'editNote',
        { roomId, noteId: selectedNote.uuid, updatedData: noteData },
        (response) => {
          if (response.error) {
            notification.error({
              message: 'Ошибка при редактировании заметки',
              description:
                response.error.message ||
                'Произошла ошибка при редактировании заметки. Пожалуйста, попробуйте еще раз.',
            });
          }
        }
      );
    } else {
      socket.emit('addNote', { roomId, note: noteData }, (response) => {
        if (response.error) {
          notification.error({
            message: 'Ошибка при добавлении заметки',
            description:
              response.error.message ||
              'Произошла ошибка при добавлении заметки. Пожалуйста, попробуйте еще раз.',
          });
        }
      });
    }
    handleCancel();
  };

  const handleDelete = (noteId) => {
    socket.emit('deleteNote', { roomId, noteId }, (response) => {
      if (response.error) {
        notification.error({
          message: 'Ошибка при удалении заметки',
          description:
            response.error.message ||
            'Произошла ошибка при удалении заметки. Пожалуйста, попробуйте еще раз.',
        });
      }
    });
  };

  const truncateExecutorName = (name) => {
    if (!name) return '—';
    const firstWord = name.split(' ')[0];
    return firstWord.length > 12 ? `${firstWord.slice(0, 12)}...` : firstWord;
  };

  const renderNoteContent = (note) => (
    <Card
      style={cardStyle}
      actions={[
        <Tooltip title="Редактировать" key="edit">
          <EditOutlined
            onClick={() => {
              setSelectedNote(note);
              setNoteText(note.text);
              setSelectedExecutor(note.executor ? note.executor : null);
              setSelectedDate(note.dueDate ? moment(note.dueDate) : null);
            }}
          />
        </Tooltip>,
        <Tooltip title="Удалить" key="delete">
          <DeleteOutlined
            onClick={() => confirmDelete(note.uuid, handleDelete)}
          />
        </Tooltip>,
      ]}
    >
      <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 8 }}>
        {note.text}
      </Paragraph>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <UserOutlined style={{ marginRight: 4 }} />
          {truncateExecutorName(note.executor)}
        </div>
        <div>
          <CalendarOutlined style={{ marginRight: 4 }} />
          {note.dueDate ? moment(note.dueDate).format('DD.MM.YYYY') : '—'}
        </div>
      </div>
    </Card>
  );

  const renderForm = (note) => (
    <Card style={cardStyle}>
      <Form form={form} onFinish={handleSubmit} initialValues={note}>
        <Form.Item
          name="text"
          rules={[{ required: true, message: 'Введите текст заметки' }]}
          style={{ marginBottom: 16 }}
        >
          <TextArea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            autoSize={{ minRows: 3, maxRows: 3 }}
            showCount
            placeholder="Текст заметки"
            maxLength={300}
          />
        </Form.Item>
        <div style={{ display: 'flex', marginBottom: 16 }}>
          <UserPickerWithPopover
            users={users}
            selectedExecutor={selectedExecutor}
            setSelectedExecutor={setSelectedExecutor}
            truncateName={true}
            style={{ marginRight: '16px', flex: 1 }}
          />
          <DatePickerWithStyledIcon
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            dateFormat="DD.MM.YYYY"
          />
        </div>
        <Form.Item style={{ marginBottom: 0 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              {selectedNote && selectedNote.uuid ? 'Сохранить' : 'Добавить'}
            </Button>
            <Button onClick={handleCancel}>Отмена</Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );

  return (
    <>
      {/* Кнопка добавления заметки */}
      <Button
        type="primary"
        onClick={() => {
          setSelectedNote({});
          setSelectedExecutor(null);
          setSelectedDate(null);
          setNoteText('');
          form.resetFields();
        }}
        style={{
          marginBottom: 16,
          width: '100%',
          fontWeight: 'bold',
        }}
      >
        Добавить заметку
      </Button>
      <div
        style={{
          overflowY: 'auto',
          paddingRight: '8px',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d4d4d4 transparent',
        }}
        className="custom-scrollbar"
      >
        <AnimatePresence initial={false}>
          {selectedNote && !selectedNote.uuid && (
            <motion.div
              key="new-note"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
            >
              {renderForm(selectedNote)}
            </motion.div>
          )}
          {loading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <Card key={index} style={cardStyle}>
                  <Skeleton active />
                </Card>
              ))}
            </>
          ) : (
            notes.map((note) => (
              <motion.div
                key={note.uuid}
                initial="hidden"
                animate="visible"
                exit="remove"
                variants={variants}
              >
                {selectedNote && selectedNote.uuid === note.uuid
                  ? (
                    <motion.div key={`edit-${note.uuid}`} variants={variants}>
                      {renderForm(note)}
                    </motion.div>
                  ) : (
                    <motion.div key={`content-${note.uuid}`} variants={variants}>
                      {renderNoteContent(note)}
                    </motion.div>
                  )}
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

NotesDrawerContent.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
};

export default NotesDrawerContent;