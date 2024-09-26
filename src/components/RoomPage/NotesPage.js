import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import NoteAddForm from './NoteAddForm';
import NoteList from './NoteList';
import CardList from './CardList';
import { Row, Col, notification } from 'antd';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const NotesPage = ({ socket, roomId, users, cards }) => {
    const [notes, setNotes] = useState([]);

    useEffect(() => {
        console.log({ roomId });
        console.log({ socket });

        // Получение списка заметок при подключении
        socket.emit('getNotes', { roomId });

        // Обработчик события получения списка заметок
        socket.on('notesList', (notesList) => {
            console.log('Received notes list:', notesList);
            setNotes(notesList);
        });

        // Обработчик события добавления заметки
        socket.on('noteAdded', (newNote) => {
            console.log('Note added:', newNote);
            setNotes((prevNotes) => [...prevNotes, newNote]);
            notification.success({
                message: 'Заметка добавлена',
                description: `Заметка "${newNote.text}" была успешно добавлена.`,
            });
        });

        // Обработчик события обновления заметки
        socket.on('noteUpdated', (updatedNote) => {
            console.log('Note updated:', updatedNote);
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note.uuid === updatedNote.uuid ? updatedNote : note))
            );
            notification.success({
                message: 'Заметка обновлена',
                description: `Заметка "${updatedNote.text}" была успешно обновлена.`,
            });
        });

        // Обработчик события удаления заметки
        socket.on('noteDeleted', (deletedNoteId) => {
            console.log('Note deleted:', deletedNoteId);
            const deletedNote = notes.find((note) => note.uuid === deletedNoteId);
            setNotes((prevNotes) => prevNotes.filter((note) => note.uuid !== deletedNoteId));
            if (deletedNote) {
                notification.success({
                    message: 'Заметка удалена',
                    description: `Заметка "${deletedNote.text}" была успешно удалена.`,
                });
            }
        });

        // Обработчик ошибок
        socket.on('error', (error) => {
            console.error('Socket error:', error);
            notification.error({
                message: 'Ошибка',
                description: error.message,
            });
        });

        // Очистка обработчиков при размонтировании компонента
        return () => {
            socket.off('notesList');
            socket.off('noteAdded');
            socket.off('noteUpdated');
            socket.off('noteDeleted');
            socket.off('error');
        };
    }, [socket, roomId]);

    const handleAddNote = (note) => {
        try {
            socket.emit('addNote', { roomId, note });
        } catch (error) {
            console.error('Error adding note:', error);
            notification.error({
                message: 'Ошибка добавления',
                description: 'Произошла ошибка при добавлении заметки.',
            });
        }
    };

    const handleEditNote = (noteId, updatedData) => {
        try {
            console.log('Editing note:', noteId, updatedData);
            socket.emit('editNote', { roomId, noteId, updatedData });
        } catch (error) {
            console.error('Error editing note:', error);
            notification.error({
                message: 'Ошибка редактирования',
                description: 'Произошла ошибка при редактировании заметки.',
            });
        }
    };

    const handleDeleteNote = (noteId) => {
        try {
            console.log('Deleting note:', noteId);
            socket.emit('deleteNote', { roomId, noteId });
        } catch (error) {
            console.error('Error deleting note:', error);
            notification.error({
                message: 'Ошибка удаления',
                description: 'Произошла ошибка при удалении заметки.',
            });
        }
    };

    const handleRemoveCardFromNote = (noteId, cardId) => {
        try {
            console.log('Removing card:', cardId, 'from note:', noteId);
            socket.emit('removeCardFromNote', { roomId, noteId, cardId });
        } catch (error) {
            console.error('Error removing card from note:', error);
            notification.error({
                message: 'Ошибка удаления карты',
                description: 'Произошла ошибка при удалении карты из заметки.',
            });
        }
    };

    const handleCardDrop = (noteId, card) => {
        console.log('Dropping card:', card, 'into note:', noteId);
        const note = notes.find(note => note.uuid === noteId);

        if (!note) {
            console.error('Note not found for uuid:', noteId);
            notification.error({
                message: 'Ошибка',
                description: 'Заметка не найдена.',
            });
            return;
        }

        if (!note.cards) {
            console.error('Note cards property is missing or null:', note);
            notification.error({
                message: 'Ошибка',
                description: 'Свойство заметки cards отсутствует или равно null.',
            });
            return;
        }

        for (const existingCard of note.cards) {
            if (existingCard === null) {
                console.error('Found null card in note:', note);
                continue;
            }
            if (existingCard.uuid === card.uuid) {
                notification.warning({
                    message: 'Предупреждение',
                    description: 'Карта уже прикреплена к заметке.',
                });
                return;
            }
        }

        try {
            socket.emit('addCardToNote', { roomId, noteId, card });
        } catch (error) {
            console.error('Error adding card to note:', error);
            notification.error({
                message: 'Ошибка добавления карты',
                description: 'Произошла ошибка при добавлении карты в заметку.',
            });
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <Row gutter={[16, 16]} justify="center">
                <Col span={6}>
                    <NoteAddForm onAdd={handleAddNote} users={users} />
                    <div style={{ marginTop: '16px',  background: '#fff' }}>
                        <NoteList
                            notes={notes}
                            onEdit={handleEditNote}
                            onDeleteNote={handleDeleteNote} // Обновляем здесь
                            onRemoveCardFromNote={handleRemoveCardFromNote}
                            onCardDrop={handleCardDrop}
                            users={users}
                        />
                    </div>
                </Col>
                <Col span={6}>
                    <div style={{ border: '2px dashed #d9d9d9',  borderRadius: '10px', background: '#fff' }}>
                        <CardList allCards={cards} notes={notes} />
                    </div>
                </Col>
            </Row>
        </DndProvider>
    );
};

NotesPage.propTypes = {
    socket: PropTypes.object.isRequired,
    cards: PropTypes.array.isRequired,
    roomId: PropTypes.string,
    users: PropTypes.arrayOf(
        PropTypes.shape({
            username: PropTypes.string,
            userId: PropTypes.string,
        })
    ),
};

export default NotesPage;