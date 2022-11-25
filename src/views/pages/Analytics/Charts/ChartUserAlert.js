import * as React from 'react';
import {connect} from "react-redux";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
} from 'chart.js';
import {Line} from 'react-chartjs-2';
import {
  COLOR_BLUE,
  COLORS,
  METRIC_CHART_USER_VALUES,
  TYPES
} from "../../../../constant";

import clsx from 'clsx';
import style from './Chart.module.scss';
import {
  useTranslation,
  withTranslation
} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {customStyles} from "../../DashboardV2";
import ResponsiveSelect from "../../../components/ResponsiveSelect";
import {
  chartPlugins,
  getWeeksInMonth
} from "../../../../utils/anlytics";
import MultiSelectPopup from "../../../components/MultiSelectPopup";
import spacetime from "spacetime";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
);

const ChartUserAlert = () => {
  const {
    selectedMetric,
    selectedTeams,
    selectedMembers,
    selectedUsers,
    setUsers,
    users,
    chartData,
    timeZone
  } = useAnalyticsContext();
  const {t} = useTranslation();

  const [type, setType] = React.useState(1); // 1 | 2 // 1: day, 2: week
  const [dates, setDates] = React.useState(null);
  const [date, setDate] = React.useState(null);
  const selectedType = React.useMemo(() => {
    let dateList = getWeeksInMonth(timeZone);
    dateList = type === 1 ? dateList.dates : type === 2 ? dateList.weeks : [];
    setDates(dateList);
    setDate(dateList?.length > 0 ? dateList[0].value : null);
    return TYPES?.find(it => it.value?.toString() === type?.toString());
  }, [type, timeZone]);

  const selectedDate = React.useMemo(() => {
    return dates?.find(it => it.value?.toString() === date?.toString());
  }, [date, dates]);

  const usersLabel = React.useMemo(() => {
    if (selectedUsers?.length > 0) {
      if (selectedUsers?.length > 1 && (selectedMembers?.length === selectedUsers?.length)) {
        return t(`all users`);
      } else if (selectedUsers?.length > 1) {
        return t(`n users selected`, {n: selectedUsers.length});
      } else {
        return selectedMembers?.find(it => it.value?.toString() === selectedUsers?.[0]?.value?.toString())?.label;
      }
    } else {
      return t(`select user`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMembers, selectedUsers]);

  const [data, setData] = React.useState({
    labels: [],
    datasets: [
      {
        label: `${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'CBT' : 'Hr'}`,
        data: [],
        borderWidth: 4,
        borderColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
        backgroundColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
      },
    ],
  });

  React.useEffect(() => {
    if (selectedDate) {
      let labels = [], tempData = [];
      let dateList = getWeeksInMonth(timeZone);

      let start = selectedDate.label;
      dateList = selectedType.value === 1 ? dateList.dates : dateList.weeks;

      let findIndex = dateList.findIndex(it => it.value === selectedDate.value);
      let end = findIndex === 0 ? spacetime(new Date(), timeZone.name) : dateList[findIndex - 1].label;

      let filterUsers = users.filter(it => selectedMembers.findIndex(a => a?.value?.toString() === it.toString()) > -1);
      chartData.filter(it => filterUsers.includes(it.userId))?.forEach(it => {
        if (spacetime(it.ts, timeZone.name).isAfter(start) && spacetime(it.ts, timeZone.name).isBefore(end)) {
          labels.push(spacetime(it.ts, timeZone.name).unixFmt('dd hh:mm:ss'));
          tempData.push(selectedMetric.value === METRIC_CHART_USER_VALUES[0] ? it?.heartCbtAvg : it?.heartRateAvg);
        }
      });
      labels.reverse();
      tempData.reverse();

      setData({
        labels,
        datasets: [
          {
            label: `${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'CBT' : 'Hr'}`,
            data: tempData,
            borderWidth: 4,
            borderColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
            backgroundColor: selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? COLORS[2] : COLOR_BLUE,
          },
        ],
      })
    }
  }, [chartData, selectedMetric, selectedType, selectedDate, users, selectedMembers, selectedTeams, timeZone]);

  return (
      <div className={clsx(style.chart_body)}>
        <div className={clsx(style.line_body)}>
          <h1 className={clsx(style.txt_center)}>
            {t(`${selectedMetric?.value === METRIC_CHART_USER_VALUES[0] ? 'cbt' : 'hr'}`)}
          </h1>
          <div className={clsx(style.line_flex, `mb-15`)}>
            {
              selectedMembers?.length > 0 ?
                  <div className={"d-flex flex-row"}>
                    <span className='font-input-label d-flex align-center'>
                      {t(`users`)}
                    </span>
                    <div className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}>
                      <MultiSelectPopup
                          label={usersLabel}
                          options={selectedMembers}
                          value={selectedUsers}
                          onChange={v => {
                            setUsers(v?.map(it => it.value));
                          }}
                      />
                    </div>
                  </div> : <div/>
            }
            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t(`types`)}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}
                  isClearable
                  options={TYPES}
                  value={selectedType}
                  styles={customStyles()}
                  placeholder={t(`select type`)}
                  onChange={v => setType(v?.value)}
              />
            </div>

            <div className='d-flex flex-row ml-15'>
              <span className='font-input-label d-flex align-center'>
                {t(`date range`)}
              </span>

              <ResponsiveSelect
                  className={clsx(style.select_mw, `ml-15 font-heading-small text-black`)}
                  isClearable
                  options={dates}
                  value={selectedDate}
                  styles={customStyles()}
                  placeholder={t(`select start date`)}
                  onChange={v => setDate(v?.value)}
              />
            </div>
          </div>

          <div className={clsx(style.flex_space)}>
            <Line
                options={{radius: 0}}
                data={data}
                plugins={chartPlugins(`line`, t(`no data to display`))}
            />
          </div>
        </div>
      </div>
  )
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    null
)(withTranslation()(ChartUserAlert));
