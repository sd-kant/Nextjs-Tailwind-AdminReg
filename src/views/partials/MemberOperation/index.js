import * as React from 'react';
import {withTranslation} from "react-i18next";
import trashIcon from '../../../assets/images/trash.svg';
import closeIcon from '../../../assets/images/remove.svg';
import moveToIcon from '../../../assets/images/arrow-right-circle.svg';

import clsx from 'clsx';
import style from './MemberOperation.module.scss';
import {useMembersContextV2} from "../../../providers/MembersProviderV2";
import TeamsPopup from "../../components/TeamsPopup";

const MemberOperation = (
  {
    t,
  }) => {
  const {selectedMembers, setSelectedMembers} = useMembersContextV2();
  const renderAction = (
    {
      icon = trashIcon,
      title = t('remove'),
      action = () => {
      },
      isMoveTo,
    }, index) => {

    const content = (
      <div onClick={action} className={clsx(style.Action)} key={`action-${title}-${index}`}>
        <img className={clsx(style.ActionIcon)} src={icon} alt="action icon"/>
        <span>
          {title}
        </span>
      </div>
    );

    return (
      isMoveTo ?
        <TeamsPopup
          content={content}
          key={`action-popup-${title}-${index}`}
        /> : content
    );
  };

  const actions = [
    {
      icon: trashIcon,
      title: t('remove'),
    },
    {
      icon: moveToIcon,
      title: t('move to'),
      isMoveTo: true,
    },
    {
      icon: closeIcon,
      title: t('close'),
      action: () => setSelectedMembers([]),
    },
  ];

  return (
    <div className={clsx(style.Wrapper, selectedMembers?.length > 0 ? style.Show : style.Hide)}>
      <div className={clsx(style.Description)}>
        <span className={clsx('font-binary')}>{t("you've selected")}</span>
        <span className={clsx('font-heading-small')}>{t('n individual', {n: selectedMembers?.length})} individual</span>
      </div>

      <div className={clsx(style.Actions)}>
        {
          actions.map(renderAction)
        }
      </div>
    </div>
  )
}

export default withTranslation()(MemberOperation);
