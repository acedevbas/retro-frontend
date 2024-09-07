import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Avatar,
  Typography,
  Space,
  Dropdown,
  Menu,
  Tooltip,
  Modal,
  Popover,
} from "antd";
import { PlusOutlined, EllipsisOutlined, SmileOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const customEmojis = ["😍", "😁", "🥰", "🤠", "🥴", "🧐", "🥺", "🥸", "💩", "🤡", "😰", "😭", "👌", "👍", "👎"];

const enlargeEmojis = (text) => {
  return text.replace(
    /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])/gu,
    "<span style='font-size: 1.5em;'>$1</span>"
  );
};

const ColumnManager = ({ columns, cards, addCard, editColumn, deleteColumn, deleteCard }) => {
  const [newCardText, setNewCardText] = useState({});
  const [editingColumn, setEditingColumn] = useState(null);
  const [newColumnName, setNewColumnName] = useState("");
  const [usernames, setUsernames] = useState({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const usersToFetch = Array.from(new Set(cards.map((card) => card.author))).filter(
        (id) => !usernames[id]
      );

      const promises = usersToFetch.map((author) =>
        fetch(`http://localhost:3000/users/${author}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.username) {
              setUsernames((prev) => ({ ...prev, [author]: data.username }));
            }
          })
          .catch((error) => console.error("Error fetching user:", error))
      );

      await Promise.all(promises);
    };

    fetchUsernames();
  }, [cards, usernames]);

  const handleCardTextChange = (text, columnId) => {
    setNewCardText((prevText) => ({ ...prevText, [columnId]: text }));
  };

  const addEmojiToText = (emoji, columnId) => {
    setNewCardText((prevText) => ({
      ...prevText,
      [columnId]: (prevText[columnId] || "") + emoji,
    }));
  };

  const openRenameModal = (columnId, name) => {
    setEditingColumn(columnId);
    setNewColumnName(name);
  };

  const handleEditColumn = () => {
    if (editingColumn !== null) {
      editColumn(editingColumn, newColumnName);
      setEditingColumn(null);
    }
  };

  const emojiContent = (columnId) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
      {customEmojis.map((emoji) => (
        <span
          key={emoji}
          style={{ fontSize: '24px', cursor: 'pointer', margin: '5px' }}
          onClick={() => addEmojiToText(emoji, columnId)}
        >
          {emoji}
        </span>
      ))}
    </div>
  );

  return (
    <Row gutter={[16, 16]}>
      {columns.map((column) => (
        <Col xs={24} sm={12} md={8} key={column._id}>
          <Card
            title={
              <Space align="center" style={{ justifyContent: "space-between", width: "100%" }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {column.name}
                </Typography.Title>
                <Dropdown
                  overlay={
                    <Menu>
                      <Menu.Item key="edit" onClick={() => openRenameModal(column._id, column.name)}>
                        Переименовать
                      </Menu.Item>
                      <Menu.Item key="delete" onClick={() => deleteColumn(column._id)}>
                        Удалить
                      </Menu.Item>
                    </Menu>
                  }
                  trigger={["click"]}
                >
                  <Button shape="circle" icon={<EllipsisOutlined />} size="small" />
                </Dropdown>
              </Space>
            }
            bordered
            style={{ backgroundColor: "#f9f9f9", position: "relative" }}
          >
            <Space style={{ marginBottom: "16px", width: "100%" }} direction="vertical">
              <div style={{ position: "relative", width: "100%" }}>
                <TextArea
                  placeholder="Добавить карточку"
                  value={newCardText[column._id] || ""}
                  onChange={(e) => handleCardTextChange(e.target.value, column._id)}
                  autoSize={{ minRows: 2, maxRows: 6 }}
                  style={{
                    width: "100%",
                    paddingRight: "40px", // Пространство для иконки
                  }}
                />
                <Popover content={emojiContent(column._id)} trigger="click">
                  <Button
                    type="text"
                    icon={<SmileOutlined />}
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "18px",
                      color: "rgba(0,0,0,0.45)",
                    }}
                  />
                </Popover>
              </div>

              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ width: "100%" }}
                onClick={() => {
                  if (newCardText[column._id]) {
                    addCard(column._id, newCardText[column._id]);
                    setNewCardText((prevText) => ({ ...prevText, [column._id]: "" }));
                  }
                }}
              >
                Добавить карточку
              </Button>
            </Space>

            <Row gutter={[16, 16]}>
              {cards
                .filter((card) => card.columnId === column._id)
                .map((card) => (
                  <Col xs={24} key={card._id}>
                    <Card
                      hoverable={false}
                      style={{
                        backgroundColor: "#ffffff",
                        marginBottom: "16px",
                        border: "1px solid #dcdcdc",
                        boxShadow: "none",
                        display: "flex",
                        flexDirection: "column",
                      }}
                      bodyStyle={{ padding: "0" }}
                    >
                      <div
                        style={{
                          padding: "16px",
                          borderBottom: "1px dashed #dcdcdc",
                          flexGrow: 1,
                        }}
                      >
                        <div
                          dangerouslySetInnerHTML={{ __html: enlargeEmojis(card.content) }}
                          style={{ fontSize: "16px", whiteSpace: "pre-wrap" }}
                        />
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "8px",
                          backgroundColor: "#edf3f7",
                        }}
                      >
                        <Tooltip title={usernames[card.author] || "Неизвестно"}>
                          <Avatar size="small" style={{ backgroundColor: "#6ac185" }}>
                            {usernames[card.author] ? usernames[card.author][0].toUpperCase() : "?"}
                          </Avatar>
                        </Tooltip>
                        <Dropdown
                          overlay={
                            <Menu>
                              <Menu.Item key="delete" onClick={() => deleteCard(card._id)}>
                                Удалить
                              </Menu.Item>
                            </Menu>
                          }
                          trigger={["click"]}
                        >
                          <Button shape="circle" icon={<EllipsisOutlined />} size="small" />
                        </Dropdown>
                      </div>
                    </Card>
                  </Col>
                ))}
            </Row>
          </Card>
        </Col>
      ))}

      {/* Модальное окно для переименования столбца */}
      <Modal
        title="Переименовать столбец"
        open={!!editingColumn}
        onOk={handleEditColumn}
        onCancel={() => setEditingColumn(null)}
      >
        <Input
          value={newColumnName}
          placeholder="Новое название столбца"
          onChange={(e) => setNewColumnName(e.target.value)}
        />
      </Modal>
    </Row>
  );
};

ColumnManager.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      columnId: PropTypes.string.isRequired,
    })
  ).isRequired,
  addCard: PropTypes.func.isRequired,
  editColumn: PropTypes.func.isRequired,
  deleteColumn: PropTypes.func.isRequired,
  deleteCard: PropTypes.func.isRequired,
};

export default ColumnManager;
