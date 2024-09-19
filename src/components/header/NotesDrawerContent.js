import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { Form, Button, Space, Typography, Modal, Tooltip, Input, Skeleton, notification } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import moment from 'moment';
import UserPickerWithPopover from '../UserPickerWithPopover';
import DatePickerWithStyledIcon from '../DatePickerWithStyledIcon';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

const variants = {
  hidden: { opacity: 0, transition: { duration: 0.5 } },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.5 } },
  remove: { opacity: 0, scale: 1.2, filter: 'blur(5px)', transition: { duration: 0.5 } },
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
  const [selectedDate, setSelectedDate] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleNotesList = (notesList) => {
      setNotes(notesList);
      setLoading(false);
      setTimeout(() => setShowNotes(true), 500); // Добавляем задержку, чтобы дать время исчезнуть скелетонам
    };

    const handleNoteAdded = (newNote) => {
      console.log('New note received:', newNote);
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
      setNotes((prevNotes) => prevNotes.filter((note) => note.uuid !== deletedNoteId));
    };

    const handleError = (error) => {
      notification.error({
        message: 'Ошибка',
        description: error.message || 'Произошла ошибка. Пожалуйста, попробуйте еще раз.',
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
    console.log('Selected Note:', selectedNote);

    const noteData = {
      ...values,
      text: noteText,
      executor: selectedExecutor || null,
      dueDate: selectedDate ? selectedDate : null,
    };
    if (selectedNote && selectedNote.uuid) {
      socket.emit('editNote', { roomId, noteId: selectedNote.uuid, updatedData: noteData }, (response) => {
        if (response.error) {
          notification.error({
            message: 'Ошибка при редактировании заметки',
            description: response.error.message || 'Произошла ошибка при редактировании заметки. Пожалуйста, попробуйте еще раз.',
          });
        }
      });
    } else {
      socket.emit('addNote', { roomId, note: noteData }, (response) => {
        if (response.error) {
          notification.error({
            message: 'Ошибка при добавлении заметки',
            description: response.error.message || 'Произошла ошибка при добавлении заметки. Пожалуйста, попробуйте еще раз.',
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
          description: response.error.message || 'Произошла ошибка при удалении заметки. Пожалуйста, попробуйте еще раз.',
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
    <>
      <Paragraph style={{ marginBottom: 8, whiteSpace: 'pre-wrap' }}>
        {note.text}
      </Paragraph>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 8,
        color: 'rgba(0, 0, 0, 0.45)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
          <UserOutlined style={{ marginRight: 8 }} />
          <Text ellipsis style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            {truncateExecutorName(note.executor)}
          </Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          <Text style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
            {note.dueDate ? moment(note.dueDate).format('DD.MM.YYYY') : '—'}
          </Text>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title="Редактировать">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedNote(note);
                setNoteText(note.text);
                setSelectedExecutor(note.executor ? note.executor : null);
                setSelectedDate(note.dueDate ? moment(note.dueDate) : null);
              }}
              style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.45)' }}
            />
          </Tooltip>
          <Tooltip title="Удалить">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => confirmDelete(note.uuid, handleDelete)}
              style={{ color: 'rgba(0, 0, 0, 0.45)' }}
            />
          </Tooltip>
        </div>
      </div>
    </>
  );

  const renderForm = (note) => (
    <Form form={form} onFinish={handleSubmit} initialValues={note}>
      <Form.Item name="text" rules={[{ required: true, message: 'Введите текст заметки' }]}>
        <div style={{ position: 'relative' }}>
          <TextArea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            autoSize={{ minRows: 3 }}
            showCount
            placeholder="Текст заметки"
            style={{ resize: 'none', paddingBottom: '60px' }}
            maxLength={300}
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#fff',
            zIndex: 1,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden', marginRight: '10px' }}>
              <UserPickerWithPopover
                users={users}
                selectedExecutor={selectedExecutor}
                setSelectedExecutor={setSelectedExecutor}
                truncateName={true}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '150px',
                }}
              />
            </div>
            <DatePickerWithStyledIcon
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              dateFormat='DD.MM.YYYY'
            />
          </div>
        </div>
      </Form.Item>
      <Form.Item style={{ marginTop: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            {selectedNote && selectedNote.uuid ? "Сохранить" : "Добавить"}
          </Button>
          <Button onClick={handleCancel}>Отмена</Button>
        </Space>
      </Form.Item>
    </Form>
  );

  return (
    <>
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
          backgroundColor: '#1890ff',
          borderColor: '#1890ff',
          color: '#fff',
          fontWeight: 'bold',
        }}
      >
        Добавить заметку
      </Button>
      <div>
        <AnimatePresence initial={false}>
          {selectedNote && !selectedNote.uuid && (
            <motion.div
              key="new-note"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={variants}
              style={{
                marginBottom: 16,
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                position: 'relative'
              }}
            >
              {renderForm(selectedNote)}
            </motion.div>
          )}
          {loading ? (
            <>
              {[...Array(3)].map((_, index) => (
                <motion.div
                  key={index}
                  initial="visible"
                  animate="visible"
                  exit="hidden"
                  variants={variants}
                  style={{
                    backgroundColor: '#fff',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                    marginBottom: '16px',
                    position: 'relative'
                  }}
                >
                  <Skeleton active />
                </motion.div>
              ))}
            </>
          ) : (
            showNotes && notes.map((note, index) => (
              <motion.div
                key={note.uuid}
                initial="hidden"
                animate="visible"
                exit="remove"
                variants={variants}
                transition={{ delay: index * 0.1 }} // Добавляем задержку для плавного появления карточек
                style={{
                  backgroundColor: '#fff',
                  padding: '20px',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                  marginBottom: '16px',
                  position: 'relative'
                }}
              >
                {selectedNote && selectedNote.uuid === note.uuid ? (
                  renderForm(note)
                ) : (
                  renderNoteContent(note)
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