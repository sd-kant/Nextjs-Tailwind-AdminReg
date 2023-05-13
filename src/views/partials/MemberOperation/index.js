import * as React from 'react';
import { withTranslation } from 'react-i18next';
import removeIcon from '../../../assets/images/minus-circle.svg';
import closeIcon from '../../../assets/images/remove.svg';
import moveToIcon from '../../../assets/images/arrow-right-circle.svg';

import clsx from 'clsx';
import style from './MemberOperation.module.scss';
import { useMembersContextV2 } from '../../../providers/MembersProviderV2';
import TeamsPopup from '../../components/TeamsPopup';

const MemberOperation = ({ t }) => {
  const { selectedMembers, setSelectedMembers, handleRemoveClick } = useMembersContextV2();
  const renderAction = (
    { icon = removeIcon, title = t('remove'), action = () => {}, isMoveTo, isRemove },
    index
  ) => {
    const content = (
      <div onClick={action} className={clsx(style.Action)} key={`action-${title}-${index}`}>
        <img
          className={clsx(isRemove ? style.RIcon : style.ActionIcon)}
          src={icon}
          alt="action icon"
        />
        <span className="text-capitalize">{title}</span>
      </div>
    );

    return isMoveTo ? (
      <TeamsPopup content={content} key={`action-popup-${title}-${index}`} />
    ) : (
      content
    );
  };

  const actions = [
    {
      icon: moveToIcon,
      title: t('move to'),
      isMoveTo: true
    },
    {
      icon: removeIcon,
      title: t('remove'),
      isRemove: true,
      action: handleRemoveClick
    },
    {
      icon: closeIcon,
      title: t('cancel'),
      action: () => setSelectedMembers([])
    }
  ];

  return (
    <div className={clsx(style.Wrapper, selectedMembers?.length > 0 ? style.Show : style.Hide)}>
      <div className={clsx(style.Description)}>
        <span className={clsx('font-heading-small text-capitalize')}>
          {selectedMembers?.length > 1
            ? t('n users selected', { n: selectedMembers?.length })
            : t('n user selected', { n: selectedMembers?.length })}
        </span>
      </div>

      <div className={clsx(style.Actions)}>{actions.map(renderAction)}</div>
    </div>
  );
};

export default withTranslation()(MemberOperation);
