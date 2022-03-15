import * as React from 'react';
import {withTranslation} from "react-i18next";
import clsx from 'clsx';
import style from './TeamsPopup.module.scss';
import Popup from 'reactjs-popup';
import teamIcon from '../../../assets/images/teams-icon.svg';

const popupContentStyle = {
  boxShadow: '0px 15px 25px rgba(0, 0, 0, 0.15)',
  borderRadius: '25px',
  padding: '25px 10px',
  background: '#212121',
  width: '268px',
  border: 'none',
  position: 'absolute',
}

const teams = [
  {
    id: 1,
    title: 'Factory First Floor',
    cnt: 12,
  },
  {
    id: 2,
    title: 'Factory Second Floor',
    cnt: 5,
  },
  {
    id: 3,
    title: 'Factory Third Floor',
    cnt: 7,
  },
  {
    id: 4,
    title: 'Factory Fourth Floor',
    cnt: 9,
  },
  {
    id: 5,
    title: 'Factory Fifth Floor',
    cnt: 10,
  },
];

const TeamsPopup = (
  {
    t,
    content,
  }) => {
  const [selected, setSelected] = React.useState(1);
  return (
    <Popup
      trigger={content}
      position="top"
      arrow={false}
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
            teams?.map((team, index) => (
              <div
                key={`team-dropdown-item-${index}`}
                className={clsx(style.Item, 'font-binary', index === selected ? style.Selected : null)}
                onClick={() => setSelected(index)}
              >
                <span className={clsx('text-white')}>
                  {team.title}
                </span>
                &nbsp;&nbsp;&nbsp;
                <span className={clsx('text-gray-2')}>
                  ({team.cnt})
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </Popup>
  )
}

export default withTranslation()(TeamsPopup);
