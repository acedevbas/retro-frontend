import React, { useState } from "react";
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled, { createGlobalStyle } from "styled-components";
import { CalendarOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { registerLocale } from "react-datepicker";
import ru from "date-fns/locale/ru";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/ru";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.locale("ru");
dayjs.extend(customParseFormat);
dayjs.extend(utc);
registerLocale("ru", ru);

const GlobalStyles = createGlobalStyle`
  .react-datepicker {
    font-family: 'Roboto', sans-serif;
  }

  .react-datepicker__header {
    background-color: #f5f5f5;
  }

  .react-datepicker__day-names {
    background-color: #f5f5f5;
  }
`;

const DateDisplayWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
`;

const CalendarButton = styled.button`
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

  ${DateDisplayWrapper}:hover & {
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

const TodayButton = styled.button`
  padding: 6px 12px;
  font-size: 14px;
  background-color: #1677ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  width: 100%;

  &:hover {
    background-color: #1454d1;
  }
`;

const parseDate = (dateString) => {
  if (!dateString) return null;

  const parsedDate = dayjs(dateString).isValid() ? dayjs(dateString).toDate() : null;
  return parsedDate;
};

function DatePickerWithStyledIcon({ selectedDate, setSelectedDate, dateFormat = "DD.MM.YYYY" }) {
  const [isPopoverOpen, setPopoverOpen] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date ? dayjs(date).format("YYYY-MM-DD") : null); // Сохраняем дату в формате строки
    setPopoverOpen(false);
  };

  const handleSetToday = () => {
    const today = new Date();
    setSelectedDate(dayjs(today).format("YYYY-MM-DD")); // Сохраняем дату в формате строки
    setPopoverOpen(false);
  };

  const clearDate = (e) => {
    e.stopPropagation();
    setSelectedDate(null);
  };

  const initialDate = parseDate(selectedDate);

  const calendar = (
    <div>
      <DatePicker
        selected={initialDate}
        onChange={handleDateChange}
        inline
        locale="ru"
        dateFormat="P"
        renderCustomHeader={({ monthDate, decreaseMonth, increaseMonth }) => (
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px", backgroundColor: "#f5f5f5" }}>
            <button onClick={decreaseMonth}>{"<"}</button>
            <span>{dayjs(monthDate).format("MMMM YYYY")}</span>
            <button onClick={increaseMonth}>{">"}</button>
          </div>
        )}
        calendarContainer={({ children }) => (
          <div>
            {children}
            <div className="react-datepicker__footer">
              <TodayButton onClick={handleSetToday}>Сегодня</TodayButton>
            </div>
          </div>
        )}
      />
    </div>
  );

  return (
    <>
      <GlobalStyles />
      <Popover
        content={calendar}
        trigger="click"
        visible={isPopoverOpen}
        onVisibleChange={setPopoverOpen}
      >
        <DateDisplayWrapper>
          <CalendarButton type="button" aria-label="calendar">
            <span className="ant-btn-icon">
              <span role="img" aria-label="calendar" className="anticon anticon-calendar">
                <CalendarOutlined />
              </span>
            </span>
          </CalendarButton>
          <span>{initialDate ? dayjs(initialDate).format(dateFormat) : "—"}</span>
          {initialDate && (
            <CloseIcon onClick={clearDate} aria-label="close-circle">
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
        </DateDisplayWrapper>
      </Popover>
    </>
  );
}

DatePickerWithStyledIcon.propTypes = {
  selectedDate: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string
  ]),
  setSelectedDate: PropTypes.func.isRequired,
  dateFormat: PropTypes.string,
};

export default DatePickerWithStyledIcon;