import * as React from "react";
import {connect} from "react-redux";

import clsx from "clsx";
import style from "./QueryResult.module.scss";
import ResultTableHeader from "./ResultTableHeader";
import ResultTableBody from "./ResultTableBody";
import {get} from "lodash";
import Toggle from "../../components/Toggle";
import {useAnalyticsContext} from "../../../providers/AnalyticsProvider";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import {customStyles} from "../DashboardV2";
import exportIcon from "../../../assets/images/export.svg";
import Toolbar from "./Toolbar";
import {useTranslation} from "react-i18next";
import ChartTeamDoughnut from "./Charts/ChartTeamDoughnut";
import ChartTeamVerticalBar from "./Charts/ChartTeamVerticalBar";
import ChartHighestCBT from "./Charts/ChartHighestCBT";
import ChartUserAlert from "./Charts/ChartUserAlert";
import {
  METRIC_CHART_TEAM_VALUES,
  METRIC_CHART_USER_VALUES
} from "../../../constant";

const QueryResult = (
  {
    metric,
  }) => {
  const {
    statsBy,
    setStatsBy,
    visibleExport,
    exportOptions,
    exportOption,
    setExportOption,
    handleExport,
    showBy,
    selectedMetric,
    detailCbt,
  } = useAnalyticsContext();
  const {t} = useTranslation();
  const ableToExport = visibleExport && Boolean(exportOption);

  const ChartComponent = React.useMemo(() => {
    if (showBy === 'table') return null;

    if (selectedMetric?.value === METRIC_CHART_TEAM_VALUES[0]) // 30
      return <ChartTeamDoughnut/>;
    else if (selectedMetric?.value === METRIC_CHART_TEAM_VALUES[1]) // 31
      return <ChartTeamVerticalBar/>;
    else if (selectedMetric?.value === METRIC_CHART_TEAM_VALUES[2]) // 32
      return <ChartHighestCBT/>;
    else if (METRIC_CHART_USER_VALUES.includes(selectedMetric?.value)) // 40, 41
      return <ChartUserAlert/>;
    else return <div className={clsx(style.EmptyHeight)}/>;
  }, [selectedMetric, showBy]);

  return (
    <div className={clsx(style.Wrapper)}>
      {
        (
            showBy === 'table' ||
            (showBy === 'chart' && statsBy === 'team' && selectedMetric?.value === METRIC_CHART_TEAM_VALUES[2] && detailCbt)
        ) ?
            <>
              <div className={clsx(style.InnerWrapper)}>
                <Toolbar/>
                <div className={clsx(style.TableWrapper)}>
                  <table className={clsx(style.Table)}>
                    <ResultTableHeader metric={metric}/>
                    <ResultTableBody metric={metric}/>
                  </table>
                </div>
              </div>
            </>
            :
            ChartComponent
      }
      <div className={clsx(style.StatsSelectWrapper)}>
        <div>
          <Toggle
              on={statsBy === 'team'}
              titleOn= {t("user")}
              titleOff= {t("team")}
              handleSwitch={v => {
                setStatsBy(v ? 'team' : 'user');
              }}
          />
        </div>
        {
          (visibleExport && showBy === 'table') &&
          <div className={clsx(style.ExportWrapper)}>
            <ResponsiveSelect
                className='font-heading-small text-black'
                isClearable
                options={exportOptions}
                value={exportOption}
                maxMenuHeight={190}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                styles={customStyles()}
                onChange={v => setExportOption(v)}
            />
            <img
                src={exportIcon}
                className={clsx(!ableToExport ? style.Disabled : null)}
                alt="export icon"
                onClick={() => ableToExport ? handleExport() : null}
            />
          </div>
        }
        <div/>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null
)(QueryResult);
