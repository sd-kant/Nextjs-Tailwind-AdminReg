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
import ChartUserAlertCbt from "./Charts/ChartUserAlertCbt";
import ChartUserAlertHr from "./Charts/ChartUserAlertHr";

const QueryResult = (
  {
    metric,
  }) => {
  const {statsBy, setStatsBy, visibleExport, exportOptions, exportOption, setExportOption, handleExport, showBy, selectedMetric} = useAnalyticsContext();
  const {t} = useTranslation();
  const ableToExport = visibleExport && Boolean(exportOption);

  const ChartComponent = React.useMemo(() => {
    if (showBy === 'table' || !selectedMetric?.value) return null;
    if (selectedMetric?.value === 30) return <ChartTeamDoughnut/>;
    else if (selectedMetric?.value === 31) return <ChartTeamVerticalBar/>;
    else if (selectedMetric?.value === 40) return <ChartUserAlertCbt/>;
    else if (selectedMetric?.value === 41) return <ChartUserAlertHr/>;
    else return <></>
  }, [selectedMetric, showBy]);

  return (
    <div className={clsx(style.Wrapper)}>
      {
        showBy === 'table' ?
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
          visibleExport &&
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
