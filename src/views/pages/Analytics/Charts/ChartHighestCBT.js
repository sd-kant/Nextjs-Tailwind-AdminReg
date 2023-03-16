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
  TIME_LIST
} from "../../../../constant";
import {get} from "lodash";
import {checkEmptyData} from "../../../../utils/anlytics";

const ChartHighestCBT = (
    {
      metric: unitMetric,
    }) => {
  const {
    maxCBTTileData: chartData,
    setDetailCbt,
    selectedTeams,
    timeZone,
    chartRef,
    setIsEnablePrint
  } = useAnalyticsContext();
  const {t} = useTranslation();

  React.useEffect(() => {
    setIsEnablePrint(!checkEmptyData(chartData, 2));
  }, [chartData, setIsEnablePrint]);

  return (
    <div ref={chartRef} className={clsx(style.ChartBody)}>
      <div className={clsx(style.HighestCbtBody)}>
        <h1 className={clsx(style.TxtCenter)}>
          {t(`highest cbt by time of day and day of week`)}
        </h1>

        <div className={clsx(style.FlexSpace)}>
          <h1 className={clsx(style.TxtLabel, style.FlexSpace, style.CbtChartW30)}>
            {t(`day of week`)}
          </h1>
          <div className={clsx(style.CbtChartWRemain)}>
            {
              chartData?.dayList?.map((item, key) => {
                return (
                  <div
                    key={key}
                    className={clsx(style.FlexSpace, style.DayItemBody)}
                  >
                    <div className={clsx(style.DayTxt)}>{item}</div>

                    <div className={clsx(style.DayTimeGrid16)}>
                      {
                        TIME_LIST?.map((col, index) => {

                          return (
                            <div
                              key={key + '_' + index}
                              className={clsx(style.DivRect, (chartData?.list?.length === 7 && chartData?.list[key][index] !== null) ? style.RectHover : ``)}
                              style={{
                                backgroundColor:
                                  `rgb(
                                    255, 
                                    ${(chartData?.list?.length === 7 && chartData?.list[key][index] !== null) 
                                    ? chartData?.list[key][index]?.maxCbtColor : 255}, 
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
            <div className={clsx(style.FlexSpace, style.DayItemBody)}>
              <div className={clsx(style.CbtChartWRemain, style.FlexSpace)}>
                <div className={clsx(style.DayTxt)}/>
                <div className={clsx(style.DayTimeGrid16)}>
                  {
                    TIME_LIST?.map((time, index) => {
                      return (
                        <div
                          key={index}
                          className={clsx(style.TimeLabel, `mt-10`)}
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
              checkEmptyData(chartData, 2) && (
                <div className={clsx(style.CbtEmptyData)}>{t(`no data to display`)}</div>
              )
            }
          </div>
        </div>

        <div className={clsx(style.TxtCenter)}>
          <div className={clsx(style.TxtCenter, `mt-40`)}>
            {selectedTeams?.length === 1 ?
                timeZone ? timeZone?.displayName + ` - ` + timeZone?.name : ``
                :
                `UTC`
            }
          </div>

          <h1 className={clsx(style.Txt18, `mt-40`)}>{t(`time of day`)}</h1>
          <div className={clsx(style.JustifyCenter)}>
            <span className='mt-15'>{t(`cbt`)}</span>
            <div>
              <div className={clsx(style.ProgressBarContainer, `ml-15`)}>
                <div className={clsx(style.ProgressBarChild, style.Progress)}/>
                <div className={clsx(style.Point99)}/>
                <div className={clsx(style.Point100)}/>
                <div className={clsx(style.Point101)}/>
                <div className={clsx(style.TxtPoint99)}>{unitMetric ? 37.22 : 99}</div>
                <div className={clsx(style.TxtPoint100)}>{unitMetric ? 37.77 : 100}</div>
                <div className={clsx(style.TxtPoint101)}>{unitMetric ? 38.33 : 101}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null
)(withTranslation()(ChartHighestCBT));
