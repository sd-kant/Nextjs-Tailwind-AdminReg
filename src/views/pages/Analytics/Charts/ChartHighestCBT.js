import * as React from 'react';
import {connect} from "react-redux";

import clsx from 'clsx';
import style from './Chart.module.scss';
import {
  useTranslation,
  withTranslation
} from "react-i18next";
import {useAnalyticsContext} from "../../../../providers/AnalyticsProvider";
import {
  METRIC_USER_TABLE_VALUES,
  TIME_LIST
} from "../../../../constant";

const ChartHighestCBT = () => {
  const {
    maxCBTTileData: chartData,
    setDetailCbt,
    selectedTeams,
    selectedMetric,
    selectedMembers,
    timeZone,
    teamLabel,
    userLabel,
  } = useAnalyticsContext();

  const {t} = useTranslation();

  const onCheckEmptyData = () => {
    if (!chartData) return 0;
    let flag = 0;
    chartData?.list?.forEach(it => {
      flag += it.filter(a => !!a).length;
    });
    return flag;
  };

  return (
    <div className={clsx(style.chart_body)}>
      <div className={clsx(style.highest_cbt_body)}>
        <h1 className={clsx(style.txt_center)}>
          {t(`highest cbt by time of day and day of week`)}
          {
            selectedMetric?.value === METRIC_USER_TABLE_VALUES.MAX_HEART_CBT && (
                <div className={clsx(style.chart_label)}>
                  {t('past 7 days of m in n', {m: selectedMembers?.length > 0 ? userLabel : t("n user", {n: 0}), n: selectedTeams?.length > 0 ? teamLabel : t("n user", {n: 0})})}
                </div>
            )
          }
        </h1>

        <div className={clsx(style.flex_space)}>
          <h1 className={clsx(style.txt_label, style.flex_space, style.cbt_chart_w_30)}>
            {t(`day of week`)}
          </h1>
          <div className={clsx(style.cbt_chart_w_remain)}>
            {
              chartData?.dayList?.map((item, key) => {
                return (
                  <div
                    key={key}
                    className={clsx(style.flex_space, style.day_item_body)}
                  >
                    <div className={clsx(style.day_txt)}>{item}</div>

                    <div className={clsx(style.day_time_grid16)}>
                      {
                        TIME_LIST?.map((col, index) => {

                          return (
                            <div
                              key={key + '_' + index}
                              className={clsx(style.div_rect, (chartData?.list?.length === 7 && chartData?.list[key][index] !== null) ? style.rect_hover : ``)}
                              style={{
                                backgroundColor:
                                  `rgb(
                                    255, 
                                    ${(chartData?.list?.length === 7 && chartData?.list[key][index] !== null) 
                                    ? chartData?.list[key][index].maxCbt : 255}, 
                                    ${(chartData?.list?.length === 7 && chartData?.list[key][index] !== null)
                                    ? 0 : 255}
                                  )`
                              }}
                              onClick={() =>
                                (chartData?.list?.length === 7 && chartData?.list[key][index] !== null)
                                  ?
                                  setDetailCbt({dayIndex: key, timeIndex: index})
                                  :
                                  null
                              }
                              title={chartData?.list[key][index]?.tooltip}
                            />
                          )
                        })
                      }
                    </div>
                  </div>
                )
              })
            }
            <div className={clsx(style.flex_space, style.day_item_body)}>
              <div className={clsx(style.cbt_chart_w_remain, style.flex_space)}>
                <div className={clsx(style.day_txt)}/>
                <div className={clsx(style.day_time_grid16)}>
                  {
                    TIME_LIST?.map((time, index) => {
                      return (
                        <div
                          key={index}
                          className={clsx(style.time_label, `mt-10`)}
                        >
                          {time}
                        </div>
                      )
                    })
                  }
                </div>
              </div>
            </div>

            {
              !onCheckEmptyData() && (
                <div className={clsx(style.cbt_empty_data)}>{t(`no data to display`)}</div>
              )
            }
          </div>
        </div>

        <div className={clsx(style.txt_center)}>
          <div className={clsx(style.txt_center, `mt-40`)}>
            {selectedTeams?.length === 1 ?
                timeZone ? timeZone?.displayName + ` - ` + timeZone?.name : ``
                :
                `UTC`
            }
          </div>

          <h1 className={clsx(style.txt_18, `mt-40`)}>{t(`time of day`)}</h1>
          <div className={clsx(style.justify_center)}>
            <span className='mt-15'>{t(`cbt`)}</span>
            <div>
              <div className={clsx(style.progress_bar_container, `ml-15`)}>
                <div className={clsx(style.progress_bar_child, style.progress)}/>
                <div className={clsx(style.point99)}/>
                <div className={clsx(style.point100)}/>
                <div className={clsx(style.point101)}/>
                <div className={clsx(style.txt_point99)}>99</div>
                <div className={clsx(style.txt_point100)}>100</div>
                <div className={clsx(style.txt_point101)}>101</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

const mapStateToProps = () => ({});

export default connect(
  mapStateToProps,
  null
)(withTranslation()(ChartHighestCBT));
