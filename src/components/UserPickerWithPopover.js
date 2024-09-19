import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { UserOutlined } from "@ant-design/icons";
import { Popover, Input } from "antd";

const UserDisplayWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
`;

const UserButton = styled.button`
  font-size: 16px;
  line-height: 1.5714285714285714;
  height: 32px;
  width: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
  }

  .anticon {
    width: 1em;
    height: 1em;
    fill: currentColor;
  }
`;

const CloseIcon = styled.span`
  margin-left: 3px;
  margin-top: 1px;
  cursor: pointer;
  visibility: hidden;
  opacity: 0;
  transition: color 0.2s ease, opacity 0.3s ease;

  ${UserDisplayWrapper}:hover & {
    visibility: visible;
    opacity: 1;
  }

  svg {
    width: 12px;
    height: 12px;
    fill: rgba(0, 0, 0, 0.25);
    transition: fill 0.2s ease;

    &:hover {
      fill: rgba(0, 0, 0, 0.45);
    }
  }
`;

const SelectList = styled.ul`
  max-height: 200px;
  overflow-y: auto;
  padding: 0;
  margin: 0;
  border-top: 1px solid #f0f0f0;
`;

const SelectListItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #e6f7ff;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const AddNewItem = styled.span`
  font-size: 12px;
  color: gray;
`;

const MAX_USERNAME_LENGTH = 12;

function UserPicker({ users, selectedExecutor, setSelectedExecutor, truncateName = false }) {
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const [selectedExecutorLocal, setSelectedExecutorLocal] = useState(selectedExecutor);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    setSelectedExecutorLocal(selectedExecutor);
  }, [selectedExecutor]);

  const handleUserSelect = (username) => {
    setSelectedExecutorLocal(username);
    setSelectedExecutor(username); // Передаем выбранное значение в родительский компонент
    setPopoverOpen(false);
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    setSelectedExecutorLocal(null);
    setSelectedExecutor(null); // Очищаем выбранное значение в родительском компоненте
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(filterText.toLowerCase())
  );

  const popoverContent = (
    <div>
      <Input
        placeholder="Поиск пользователя"
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
        style={{ marginBottom: "8px" }}
      />
      <SelectList>
        {filteredUsers.map((user) => (
          <SelectListItem
            key={user.username}
            onClick={() => handleUserSelect(user.username)}
          >
            {user.username}
          </SelectListItem>
        ))}
        {filterText && !filteredUsers.find((user) => user.username === filterText) && (
          <SelectListItem onClick={() => handleUserSelect(filterText)}>
            {filterText} <AddNewItem>(Добавить)</AddNewItem>
          </SelectListItem>
        )}
      </SelectList>
    </div>
  );

  const getDisplayName = (name) => {
    if (!truncateName) return name;
    const firstWord = name.split(" ")[0];
    return firstWord.length > MAX_USERNAME_LENGTH
      ? firstWord.substring(0, MAX_USERNAME_LENGTH)
      : firstWord;
  };

  return (
    <Popover
      content={popoverContent}
      trigger="click"
      visible={isPopoverOpen}
      onVisibleChange={setPopoverOpen}
    >
      <UserDisplayWrapper>
        <UserButton type="button" aria-label="user">
          <span className="ant-btn-icon">
            <span role="img" aria-label="user" className="anticon anticon-user">
              <UserOutlined />
            </span>
          </span>
        </UserButton>
        <span>{selectedExecutorLocal ? getDisplayName(selectedExecutorLocal) : "—"}</span>
        {selectedExecutorLocal && (
          <CloseIcon onClick={handleClearSelection} aria-label="close-circle">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="close-circle"
              aria-hidden="true"
            >
              <path d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z"></path>
            </svg>
          </CloseIcon>
        )}
      </UserDisplayWrapper>
    </Popover>
  );
}

UserPicker.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      username: PropTypes.string.isRequired,
    })
  ).isRequired,
  selectedExecutor: PropTypes.string,
  setSelectedExecutor: PropTypes.func.isRequired,
  truncateName: PropTypes.bool,
};

export default UserPicker;