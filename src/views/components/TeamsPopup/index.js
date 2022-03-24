import * as React from 'react';
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './TeamsPopup.module.scss';
import Popup from 'reactjs-popup';
import teamIcon from '../../../assets/images/teams-icon.svg';
import {useDashboardContext} from "../../../providers/DashboardProvider";
import {useMembersContextV2} from "../../../providers/MembersProviderV2";

const popupContentStyle = {
  boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.15)',
  borderRadius: '25px',
  padding: '25px 10px',
  background: '#212121',
  width: '268px',
  border: 'none',
  position: 'absolute',
}

const TeamsPopup = (
  {
    t,
    content,
  }) => {
  const {formattedTeams} = useDashboardContext();
  const {handleMove} = useMembersContextV2();
  const ref = React.useRef();

  return (
    <Popup
      trigger={content}
      position="top"
      arrow={false}
      ref={ref}
      {...{ contentStyle: popupContentStyle }}
    >
      <div
        className={clsx(style.Wrapper)}
        /*onKeyDown={alert}*/
      >
        <div className={clsx(style.Header)}>
          <img src={teamIcon} alt="team icon"/>
          &nbsp;&nbsp;&nbsp;
          <span className={clsx('font-heading-small text-white')}>
            {t("teams")}
          </span>
        </div>

        <div
          className={clsx(style.Body)}
          /*tabIndex={0}*/
        >
          {
            formattedTeams?.map(team => (
              <div
                key={`team-dropdown-item-team-${team.value}`}
                className={clsx(style.Item, 'font-binary')}
                onClick={() => {
                  handleMove(team.value);
                  ref.current.close();
                }}
              >
                <span className={clsx('text-white')}>
                  {team.label}
                </span>
                {/*&nbsp;&nbsp;&nbsp;
                <span className={clsx('text-gray-2')}>
                  ({team.cnt})
                </span>*/}
              </div>
            ))
          }
        </div>
      </div>
    </Popup>
  )
}

export default withTranslation()(TeamsPopup);
