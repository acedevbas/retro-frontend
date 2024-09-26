import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  List,
  Typography,
  Button,
  Form,
  Input,
  Modal,
  notification,
  DatePicker,
  Select,
  Card,
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/ru';
import './NoteList.css'; // Стили для компонента

moment.locale('ru');

const { TextArea } = Input;

const NotesList = ({ socket, roomId, users }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Взаимодействие с бэкендом
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

  // Функции обработки формы
  const showModal = (note = null) => {
    setSelectedNote(note);
    if (note) {
      form.setFieldsValue({
        title: note.title,
        text: note.text,
        executor: note.executor,
        dueDate: note.dueDate ? moment(note.dueDate) : null,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setSelectedNote(null);
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleSubmit = (values) => {
    const noteData = {
      ...values,
      dueDate: values.dueDate ? values.dueDate.toISOString() : null,
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
          } else {
            notification.success({
              message: 'Заметка обновлена',
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
        } else {
          notification.success({
            message: 'Заметка добавлена',
          });
        }
      });
    }
    handleCancel();
  };

  const handleDelete = (noteId) => {
    Modal.confirm({
      title: 'Вы уверены, что хотите удалить эту заметку?',
      okText: 'Да',
      okType: 'danger',
      cancelText: 'Нет',
      onOk: () => {
        socket.emit('deleteNote', { roomId, noteId }, (response) => {
          if (response.error) {
            notification.error({
              message: 'Ошибка при удалении заметки',
              description:
                response.error.message ||
                'Произошла ошибка при удалении заметки. Пожалуйста, попробуйте еще раз.',
            });
          } else {
            notification.success({
              message: 'Заметка удалена',
            });
          }
        });
      },
    });
  };

  return (
    <div className="notes-list-container">
      <div className="notes-list-header">
        <Typography.Title level={4}>
          Заметки
        </Typography.Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
          className="add-note-button"
        >
          Добавить заметку
        </Button>
      </div>
      <div className="notes-list-content">
        <List
          dataSource={notes}
          loading={loading}
          renderItem={(note) => (
            <Card
              key={note.uuid}
              className="note-card"
              actions={[
                <EditOutlined
                  key="edit"
                  style={{ color: '#ffffff' }}
                  onClick={() => showModal(note)}
                />,
                <DeleteOutlined
                  key="delete"
                  style={{ color: '#ff4d4f' }}
                  onClick={() => handleDelete(note.uuid)}
                />,
              ]}
            >
              <Card.Meta
                title={note.title}
                description={
                  <>
                    <Typography.Paragraph className="note-text">
                      {note.text}
                    </Typography.Paragraph>
                    <div className="note-meta">
                      {note.executor && (
                        <div>
                          Исполнитель:{' '}
                          {users.find((u) => u.id === note.executor)?.name ||
                            'Неизвестно'}
                        </div>
                      )}
                      {note.dueDate && (
                        <div>
                          Срок: {moment(note.dueDate).format('LL')}
                        </div>
                      )}
                    </div>
                  </>
                }
              />
            </Card>
          )}
        />
      </div>

      {/* Плавающая кнопка для добавления заметки */}
      <div className="add-note-fab">
        <Button
          type="primary"
          shape="circle"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => showModal()}
          className="add-note-fab-button"
        />
      </div>

      {/* Модальное окно для добавления/редактирования заметки */}
      <Modal
        title={selectedNote ? 'Редактировать заметку' : 'Добавить заметку'}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        closeIcon={<CloseOutlined style={{ color: '#ffffff' }} />}
        className="notes-modal"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="title"
            label={<span style={{ color: '#ffffff' }}>Заголовок</span>}
            rules={[{ required: true, message: 'Введите заголовок заметки' }]}
          >
            <Input placeholder="Введите заголовок" />
          </Form.Item>
          <Form.Item
            name="text"
            label={<span style={{ color: '#ffffff' }}>Текст заметки</span>}
          >
            <TextArea rows={4} placeholder="Введите текст заметки" />
          </Form.Item>
          <Form.Item
            name="executor"
            label={<span style={{ color: '#ffffff' }}>Исполнитель</span>}
          >
            <Select placeholder="Выберите исполнителя" allowClear>
              {users.map((user) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="dueDate"
            label={<span style={{ color: '#ffffff' }}>Срок выполнения</span>}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedNote ? 'Сохранить' : 'Добавить'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

NotesList.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
};

export default NotesList;