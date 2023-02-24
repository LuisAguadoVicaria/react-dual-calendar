import React from 'react';
import './style.css';
import { useState, useEffect } from 'react';

function CalendarWrapper() {
  const [selectedDates, setSelectedDates] = useState({
    checkIn: null,
    checkOut: null,
  });
  const [opened, setOpened] = useState(false);

  const formatDate = (date) => {
    const today = new Date();
    date = date || today;
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  /* Parsing dates */
  const { checkIn, checkOut } = selectedDates;
  const formattedCheckIn = formatDate(checkIn);
  const formattedCheckOut = formatDate(checkOut);

  return (
    <>
      <input
        id="calendar-input"
        onClick={() => setOpened(!opened)}
        type="text"
        value={formattedCheckIn + ' | ' + formattedCheckOut}
        readOnly={true}
      />
      <input
        id="selected-dates"
        value={JSON.stringify(selectedDates)}
        readOnly={true}
      />
      {opened && (
        <Calendar
          setSelectedDates={setSelectedDates}
          isOpened={opened}
          setOpened={setOpened}
        />
      )}
    </>
  );
}

function Calendar({ setSelectedDates, setOpened, isOpened }) {
  useEffect(() => {
    const closeIfClickedOutside = (event) => {
      const calendarElement = document.getElementById('calendar');
      if (
        calendarElement &&
        !calendarElement.contains(event.target) &&
        isOpened &&
        event.target.id !== 'calendar-input'
      ) {
        setOpened(false);
      }
    };

    const calendar = document.querySelector('#calendar');
    document.addEventListener('click', closeIfClickedOutside);
    return () => {
      document.removeEventListener('click', closeIfClickedOutside);
    };
  }, []);

  /* Date logic */
  const [date, setDate] = useState(new Date());

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };
  const nextMonth = () => {
    resetSelection();
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };
  const prevMonth = () => {
    resetSelection();
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  function getDaysInMonth(month, year) {
    let date = new Date(year, month, 1);
    let days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }

  const currentMonthArray = getDaysInMonth(date.getMonth(), date.getFullYear());
  const nextMonthArray = getDaysInMonth(
    date.getMonth() + 1,
    date.getFullYear()
  );

  const lastDayOfFirstMonth = currentMonthArray.length;
  const bothMonthsArray = [...currentMonthArray, ...nextMonthArray];

  /* Select Logic */
  const resetSelection = () => {
    setSelection([]);
  };

  const [selection, setSelection] = useState([]);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleDateClick = (index) => {
    const [firstClick, secondClick] = selection;
    if (firstClick === undefined || !isSelecting) {
      setIsSelecting(true);
      return setSelection([index]);
    }
    if (isSelecting) {
      setIsSelecting(false);
      // Save dates on input
      if (firstClick > secondClick) {
        setSelectedDates({
          checkIn: bothMonthsArray[secondClick],
          checkOut: bothMonthsArray[firstClick],
        });
      }
      if (firstClick < secondClick) {
        setSelectedDates({
          checkIn: bothMonthsArray[firstClick],
          checkOut: bothMonthsArray[secondClick],
        });
      }
    }
  };

  const handleDateHover = (index) => {
    if (!isSelecting) return null;

    const [firstClick, secondClick] = selection;
    if (firstClick === undefined) {
      return null;
    }

    return setSelection([firstClick, index]);
  };

  const checkItemSelected = (index) => {
    const [firstClick, secondClick] = selection;

    if (index === firstClick || index === secondClick) {
      return true;
    }
    if (index > firstClick && index < secondClick) {
      return 'true-withHov';
    }

    if (index < firstClick && index > secondClick) {
      return 'true-withHov';
    }
    return '';
  };

  /* Html parsing */
  const currentMonthHtml = currentMonthArray.map((date, index) => {
    return (
      <div
        key={index}
        onMouseEnter={() => handleDateHover(index)}
        onClick={() => handleDateClick(index)}
      >
        {date.getDate()} - {JSON.stringify(checkItemSelected(index))}
      </div>
    );
  });
  const nextMonthHtml = currentMonthArray.map((date, index) => {
    return (
      <div
        key={lastDayOfFirstMonth + index}
        onMouseEnter={() => handleDateHover(lastDayOfFirstMonth + index)}
        onClick={() => handleDateClick(lastDayOfFirstMonth + index)}
      >
        {date.getDate()} -{' '}
        {JSON.stringify(checkItemSelected(lastDayOfFirstMonth + index))}
      </div>
    );
  });

  const header = formatHeaderDates(date);
  /* TODO: Format to UTC */
  function formatHeaderDates(date) {
    return (
      <div>
        {date.toLocaleString('default', { month: 'long', year: 'numeric' })}-
        {new Date(date.getFullYear(), date.getMonth() + 2, 0).toLocaleString(
          'default',
          { month: 'long', year: 'numeric' }
        )}
      </div>
    );
  }

  return (
    <div id="calendar">
      <div>
        {JSON.stringify(selection)}
        <button onClick={prevMonth}>Previous</button>
        <h1>{header}</h1>
        <button onClick={nextMonth}>Next</button>
      </div>
      <div className="calendar">
        <section>m1: {currentMonthHtml}</section>
        <section>m2: {nextMonthHtml}</section>
      </div>
    </div>
  );
}

export default CalendarWrapper;
