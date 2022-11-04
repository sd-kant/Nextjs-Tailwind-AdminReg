import * as React from "react";
import DatePicker from "react-datepicker";
import {range} from "lodash";

import "./react-datepicker.css";

const years = range(1900, new Date().getFullYear() + 1, 1);
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const CustomHeader = (
  {
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }) => (
  <div
    style={{
      margin: 10,
      display: "flex",
      justifyContent: "center",
    }}
  >
    <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
      {"<"}
    </button>
    <select
      value={new Date(date).getFullYear()}
      onChange={({target: {value}}) => changeYear(value)}
    >
      {years.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <select
      value={months[new Date(date).getMonth()]}
      onChange={({target: {value}}) =>
        changeMonth(months.indexOf(value))
      }
    >
      {months.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
      {">"}
    </button>
  </div>
)

const CustomDatePicker = (
  {
    selectedMetric,
    date,
    setDate,
    maxDate,
    CustomInput,
  }) => {
  return (
    <DatePicker
      renderCustomHeader={CustomHeader}
      customInput={<CustomInput/>}
      selected={date}
      maxDate={maxDate}
      onChange={v => setDate(v)}
      readOnly={selectedMetric?.value === 40 || selectedMetric?.value === 41}
    />
  );
};

export default CustomDatePicker;
