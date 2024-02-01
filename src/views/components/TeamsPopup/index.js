import * as React from 'react';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import style from './TeamsPopup.module.scss';
import Popup from 'reactjs-popup';
import teamIcon from '../../../assets/images/teams-icon.svg';
import { useDashboardContext } from '../../../providers/DashboardProvider';
import { useMembersContextV2 } from '../../../providers/MembersProviderV2';

const popupContentStyle = {
  boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.15)',
  borderRadius: '25px',
  padding: '25px 10px',
  background: '#212121',
  width: '268px',
  border: 'none',
  position: 'absolute'
};

const TeamsPopup = ({ t, content, moveTo }) => {
  const { formattedTeams, formattedOrganizations } = useDashboardContext();
  const { handleMoveClick, handleMoveToAnotherOrgClick } = useMembersContextV2();
  const ref = React.useRef();

  const items = React.useMemo(() => {
    return moveTo === 'team' ? formattedTeams : formattedOrganizations;
  }, [moveTo, formattedTeams, formattedOrganizations]);

  return (
    <Popup
      trigger={content}
      position="top"
      arrow={false}
      ref={ref}
      {...{ contentStyle: popupContentStyle }}>
      <div
        className={clsx(style.Wrapper)}
        /*onKeyDown={alert}*/
      >
        <div className={clsx(style.Header)}>
          <img src={teamIcon} alt="team icon" />
          &nbsp;&nbsp;&nbsp;
          <span className={clsx('font-heading-small text-white')}>
            {t(moveTo === 'team' ? 'teams' : 'companies')}
          </span>
        </div>

        <div
          className={clsx(style.Body)}
          /*tabIndex={0}*/
        >
          {items?.map((item) => (
            <div
              key={`team-dropdown-item-team-${item.value}`}
              className={clsx(style.Item, 'font-binary')}
              onClick={() => {
                if (moveTo === 'team') {
                  handleMoveClick(item.value);
                } else {
                  handleMoveToAnotherOrgClick(item.value);
                }

                ref.current.close();
              }}>
              <span className={clsx('text-white')}>{item.label}</span>
              {/*&nbsp;&nbsp;&nbsp;
                <span className={clsx('text-gray-2')}>
                  ({team.cnt})
                </span>*/}
            </div>
          ))}
        </div>
      </div>
    </Popup>
  );
};

export default withTranslation()(TeamsPopup);
