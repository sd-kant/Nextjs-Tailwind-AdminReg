import * as React from "react";
import DatePicker from "react-datepicker";
import {range} from "lodash";

import "./react-datepicker.css";
import {
  METRIC_TEAM_CHART_VALUES,
  METRIC_USER_CHART_VALUES,
  MONTHS,
} from "../../../constant";
import {checkMetric} from "../../../utils/anlytics";

const years = range(1900, new Date().getFullYear() + 1, 1);

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
      value={MONTHS[new Date(date).getMonth()]}
      onChange={({target: {value}}) =>
        changeMonth(MONTHS.indexOf(value))
      }
    >
      {MONTHS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>

    <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
      {">"}
    </button>
  </div>
);

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
      readOnly={
        (selectedMetric?.value && checkMetric(METRIC_USER_CHART_VALUES, selectedMetric?.value)) ||
        METRIC_TEAM_CHART_VALUES.NUMBER_ALERTS_WEEK === selectedMetric?.value ||
        METRIC_TEAM_CHART_VALUES.HIGHEST_CBT_TIME_DAY_WEEK === selectedMetric?.value
      }
    />
  );
};

export default CustomDatePicker;
