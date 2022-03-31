import * as React from 'react';
import {connect} from "react-redux";
import {withTranslation} from "react-i18next";

import clsx from 'clsx';
import style from './MemberDetail.module.scss';
import Modal from "react-modal";
import avatar from '../../../assets/images/logo_round.png';
import alertsIcon from '../../../assets/images/alerts-icon.svg';
import closeIcon from '../../../assets/images/close-orange.svg';
import Button from "../../components/Button";
import {useDashboardContext} from "../../../providers/DashboardProvider";
import thermometer from '../../../assets/images/thermometer-orange.svg';
import heart from '../../../assets/images/heart.svg';
import {get} from "lodash";
import ResponsiveSelect from "../../components/ResponsiveSelect";
import {customStyles} from "../../pages/DashboardV2";
import {numMinutesBetweenWithNow as numMinutesBetween} from "../../../utils";
import BatteryV3 from "../../components/BatteryV3";
import ConfirmModalV2 from "../../components/ConfirmModalV2";
import ConfirmModal from "../../components/ConfirmModal";
import {formatHeartRate} from "../../../utils/dashboard";

export const filters = [
  {
    value: "1",
    label: "most recent",
  },
  {
    value: "2",
    label: "most highest",
  },
];

export const activitiesSorts = [
  {
    value: "1",
    label: "Most Recent Alerts",
  },
  {
    value: "2",
    label: "All Activities",
  },
];

const MemberDetail = (
  {
    t,
    open = false,
    closeModal = () => {
    },
    data,
    metric,
  }) => {
  const {
    values: {devices},
    formatAlertForDetail,
    formatHeartCbt,
    getHeartRateZone,
    formattedTeams,
    moveMember,
    setMember,
    setVisibleMemberModal,
  } = useDashboardContext();
  const [visibleMoveModal, setVisibleMoveModal] = React.useState(false);
  const [confirmModal, setConfirmModal] = React.useState({visible: false, title: ''});
  console.log("member", data);
  const {stat, alertsForMe, alertObj, lastSyncStr, numberOfAlerts, connectionObj, invisibleHeatRisk} = data ?? {
    stat: null, alertsForMe: null, lastSyncStr: null, numberOfAlerts: null,
  };
  let badgeColorStyle = style.Off;
  if (connectionObj?.value?.toString() === "3") {
    if (["1", "2"].includes(alertObj?.value?.toString())) {
      badgeColorStyle = style.Red;
    } else {
      badgeColorStyle = style.Green;
    }
  } else if (connectionObj?.value?.toString() === "4") {
    badgeColorStyle = style.Yellow;
  }
  const heartRateZoneStyles = {
    "1": style.VeryLight,
    "2": style.Light,
    "3": style.Moderate,
    "4": style.High,
  };
  const [team, setTeam] = React.useState(null);
  React.useEffect(() => {
    if (data?.teamId) {
      setTeam(formattedTeams?.find(it => it.value?.toString() === data?.teamId?.toString()));
    } else {
      setTeam(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);
  const userDevices = devices?.find(it => it.userId?.toString() === data?.userId?.toString())?.devices;
  let androidDevice = null;
  let kenzenDevice = null;
  if (userDevices?.length > 0) {
    androidDevice = userDevices?.filter(it => it.type === "android")?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
    kenzenDevice = userDevices?.filter(it => it.type === "kenzen")?.sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())?.[0];
  }
  const visibleHeartStats = numMinutesBetween(new Date(), new Date(stat?.heartRateTs)) <= 60 && stat?.onOffFlag;
  const heartRateZone = getHeartRateZone(data?.dateOfBirth, stat?.heartRateAvg);

  const handleMove = async () => {
    try {
      await moveMember([data], team?.value);
      setVisibleMemberModal(false);
      setVisibleMoveModal(false);
      setConfirmModal({
        visible: true,
        title: t("move user to team confirmation title", {user: `${data?.firstName} ${data?.lastName}`, team: team?.label})
      });
    } catch (e) {
      console.log("moving member error", e);
    }
  };

  const renderActionContent = () => {
    return (
      <>
        <div className={clsx(style.Control)}>
          <Button
            size="sm"
            bgColor={'transparent'}
            borderColor={'orange'}
            title={t("send a message")}
          />
        </div>

        <div className={clsx(style.Control)}>
          <Button
            size="sm"
            bgColor={'transparent'}
            borderColor={'orange'}
            title={t("reset password")}
          />
        </div>
      </>
    );
  }

  return (
    <React.Fragment>
      <Modal
        isOpen={open}
        className={clsx(style.Modal)}
        overlayClassName={clsx(style.ModalOverlay)}
        onRequestClose={closeModal}
        appElement={document.getElementsByTagName("body")}
      >
        <div className={clsx(style.Wrapper)}>
          <img
            className={clsx(style.CloseIcon)}
            src={closeIcon}
            alt="close icon"
            onClick={closeModal}
          />

          <div className={clsx(style.LeftCard)}>
            <div className={clsx(style.UserActionCard)}>
              <div className={clsx(style.UserCard, style.Card)}>
                <div className={clsx(style.UserMain)}>
                  <div className={clsx(style.AvatarArea)}>
                    <img
                      className={clsx(style.Avatar)}
                      src={avatar} alt="avatar"
                    />

                    <span className={clsx('text-orange cursor-pointer text-capitalize')}>
                    {t("edit")}
                  </span>
                  </div>

                  <div className={clsx(style.NameDevice)}>
                    <div title={data?.firstName + ' ' + data?.lastName} className={clsx(style.NameDeviceElement)}>
                    <span className={clsx('font-heading-small')}>
                      {`${data?.firstName}  ${data?.lastName}`}
                    </span>
                    </div>

                    <div title={data?.email} className={clsx(style.NameDeviceElement)}>
                      <span className={clsx('font-binary')}>
                        {data?.email}
                      </span>
                    </div>

                    <div>
                      <div className={clsx(style.Mac_Battery)}>
                      <span className={clsx('font-binary')}>
                        {stat?.deviceId ?? "N/A"}
                      </span>&nbsp;&nbsp;
                        <BatteryV3
                          charging={stat?.chargingFlag}
                          percent={stat?.batteryPercent}
                        />
                      </div>
                      {
                        kenzenDevice &&
                        <div>
                        <span className={clsx('font-binary')}>
                          FW Ver. {kenzenDevice?.version}
                        </span>
                        </div>
                      }
                      {
                        androidDevice &&
                        <div>
                        <span className={clsx('font-binary')}>
                          Android Ver. {androidDevice?.osVersion}
                        </span>
                        </div>
                      }
                      {
                        androidDevice &&
                        <div>
                        <span className={clsx('font-binary')}>
                          App Ver. {androidDevice?.version}
                        </span>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div className={clsx(style.Divider)}>
                  {/*Divider*/}
                </div>

                <div className={clsx(style.InformationArea)}>
                  <div>
                    <div className={clsx(style.InformationEntity)}>
                      <div>
                        <span className={clsx(style.HelperText, 'font-helper-text')}>{t("last sync")}</span>
                      </div>
                      <div style={{height: '21px'}}>
                        <span className={clsx('font-input-label')}>{lastSyncStr}</span>
                      </div>
                    </div>

                    <div className={clsx(style.InformationEntity)}>
                      <div>
                        <span className={clsx(style.HelperText, 'font-helper-text')}>{t("status")}</span>
                      </div>
                      <div className={clsx(style.StatusCell)} title={invisibleHeatRisk ? null : alertObj?.label} style={{height: '18.38px'}}>
                        <div className={clsx(style.BadgeWrapper)}>
                          <div className={clsx(style.StatusBadge, badgeColorStyle)}/>
                        </div>
                        <span className={clsx('font-input-label')}>{!invisibleHeatRisk ? alertObj?.label : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className={clsx(style.InformationEntity)}>
                      <div>
                        <span className={clsx(style.HelperText, 'font-helper-text')}>{t("alert(24hr)")}</span>
                      </div>
                      <div>
                        <span className={clsx('font-input-label')}>{numberOfAlerts ?? 0}</span>
                      </div>
                    </div>

                    <div className={clsx(style.InformationEntity)}>
                      <div>
                        <span className={clsx(style.HelperText, 'font-helper-text', 'text-uppercase')}>{t("connection status")}</span>
                      </div>
                      <div className={clsx(style.Cell)}>
                        <span className={clsx('font-input-label')} title={connectionObj?.label}>{connectionObj?.label}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={clsx(style.FirstRolesCard)}>
                {renderActionContent()}
              </div>
            </div>

            <div className={clsx(style.HeartRiskCard)}>
              <div className={clsx(style.RiskCard, style.Card)}>
                <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                <span className={clsx('font-input-label')}>
                  {t("cbt avg")}
                </span>
                  <span className={'font-input-label text-uppercase'}>{metric ? '(°C)' : '(°F)'}</span>
                </div>

                <div className={clsx(style.InformationContent)}
                     style={{display: 'flex', justifyContent: 'center', height: '55px'}}>
                  <img src={thermometer} alt="thermometer" width={15}/>
                  <span className={'font-big-number'}>
                  {formatHeartCbt(visibleHeartStats ? stat?.cbtAvg : null)}
                </span>
                </div>

                <div style={{display: 'flex', justifyContent: 'center'}}>
                  <span className={clsx('font-binary text-danger')}/>
                </div>
              </div>

              <div className={clsx(style.HeartCard, style.Card)}>
                <div style={{display: "flex", flexDirection: 'column', alignItems: 'center'}}>
                <span className={clsx('font-input-label')}>
                  {t("heart rate avg")}
                </span>
                  <span className={clsx('font-input-label text-uppercase')}>(bpm)</span>
                </div>

                <div className={clsx(style.InformationContent)}
                     style={{display: 'flex', justifyContent: 'center', height: '55px'}}>
                  <img src={heart} alt="heart" width={30}/>
                  <span className={clsx('font-big-number')}>
                  {formatHeartRate(visibleHeartStats ? stat?.heartRateAvg : null)}
                </span>
                </div>
                {
                  visibleHeartStats &&
                  <div style={{display: 'flex', justifyContent: 'center'}}>
                <span className={clsx('font-binary', heartRateZoneStyles[heartRateZone?.value?.toString()])}>
                  {heartRateZone?.label}
                </span>
                  </div>
                }
              </div>
            </div>
          </div>

          <div className={clsx(style.RightCard)}>
            <div className={clsx(style.AlertsCard, style.Card)}>
              <div className={clsx(style.CardTop)}>
                <div className={clsx(style.CardHeader, 'font-heading-small')}>
                  <img src={alertsIcon} alt="alerts icon"/>
                  &nbsp;&nbsp;
                  <span>{t("activity logs")}</span>
                </div>

                <div className={clsx(style.FilterArea)}>
                  {/*<span className={clsx('font-binary')} style={{marginTop: '10px'}}>
                {t("filter by")}
              </span>*/}

                  <ResponsiveSelect
                    className={clsx('font-binary text-black', style.Dropdown)}
                    placeholder={t("sort by")}
                    styles={customStyles()}
                    options={activitiesSorts}
                    maxMenuHeight={190}
                    writable={false}
                  />
                </div>
              </div>

              <div className={clsx(style.AlertCardContent)}>
                {
                  alertsForMe?.length > 0 ?
                    <div className={clsx(style.DataRow, style.Header, 'font-button-label text-orange')}>
                      <span className={clsx('font-binary', style.Padding)}>{t("details")}</span>
                      <div>
                        <span className={clsx('font-binary', style.Padding)}>{t("cbt")}</span>
                        <span className={clsx('font-binary', style.Padding, 'ml-20')}>{t("hr")}</span>
                      </div>
                      <span className={clsx('font-binary', style.Padding)}>{t("datetime")}</span>
                    </div> :
                    <div className={clsx(style.DataRow, style.Header, 'font-button-label text-orange')}>
                      <span className={clsx('font-binary', style.Padding)}>{t("no alerts")}</span>
                    </div>
                }
                {
                  alertsForMe?.map((item, index) => {
                    return (
                      <div className={clsx(style.DataRow)} key={`user-alert-${data?.userId}-${index}`}>
                        <div className={clsx(style.DataLabel)}>
                          <div className={clsx('font-binary', style.Rounded)}>
                            {formatAlertForDetail(item.alertStageId)}
                          </div>
                        </div>

                        <div>
                          <div className={clsx('font-binary', style.Rounded)}>
                            <img className={style.MobileOnly} src={thermometer} alt="thermometer" width={8}
                                 style={{marginRight: '3px'}}/>
                            <span className={clsx(style.HeartCBTSpan)}>{formatHeartCbt(item.heartCbtAvg)}</span>
                          </div>

                          <div className={clsx('font-binary', style.Rounded, 'ml-15')}>
                            <img className={style.MobileOnly} src={heart} alt="heart" width={13}
                                 style={{marginRight: '3px'}}/>
                            <span className={clsx(style.HeartCBTSpan)}>{formatHeartRate(item.heartRateAvg)}</span>
                          </div>
                        </div>

                        <div>
                        <span className={clsx('font-binary text-gray-2', style.Padding)}>
                          {new Date(item.utcTs).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            <div className={clsx(style.ActivityRoleCard)}>
              <div className={clsx(style.ActivityCard, style.Card_No_Back)}>
                <div className={clsx(style.CardHeader, 'font-heading-small')}>
                  <span>{t("modify team")}</span>
                </div>

                <div>
                  <ResponsiveSelect
                    className='mt-10 font-heading-small text-black'
                    placeholder={t("select")}
                    styles={customStyles()}
                    options={formattedTeams}
                    value={team}
                    onChange={e => setTeam(e)}
                    maxMenuHeight={190}
                  />
                </div>

                <div className='mt-15 d-flex justify-end'>
                  <Button
                    title={'update team'}
                    size='sm'
                    disabled={team?.value?.toString() === data?.teamId?.toString()}
                    onClick={() => {
                      setVisibleMoveModal(true);
                    }}
                  />
                </div>
              </div>

              <div className={clsx(style.SecondRoleCard, style.Card_No_Back)}>
                {renderActionContent()}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <ConfirmModalV2
        show={visibleMoveModal}
        header={t("move user to team warning title", {user: `${data?.firstName} ${data?.lastName}`, team: team?.label})}
        onOk={handleMove}
        onCancel={() => setVisibleMoveModal(false)}
      />
      <ConfirmModal
        show={confirmModal.visible}
        header={confirmModal.title}
        onOk={() => {
          setMember(null);
          setConfirmModal({visible: false, title: ''});
        }}
      />
    </React.Fragment>
  );
}

const mapStateToProps = (state) => ({
  metric: get(state, 'ui.metric'),
});

export default connect(
  mapStateToProps,
  null,
)(withTranslation()(MemberDetail));
