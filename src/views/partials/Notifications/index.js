import * as React from 'react';
import { withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './Notifications.module.scss';
import { useNotificationContext } from '../../../providers/NotificationProvider';

const Notifications = ({ t }) => {
  const { notifications, removeNotification } = useNotificationContext();

  return (
    <div className={clsx(style.Wrapper, notifications?.length > 0 ? style.Show : style.Hide)}>
      {notifications?.map((notification) => (
        <div className={clsx(style.Notification)} key={notification.id}>
          <div>
            <span className={clsx('text-black font-binary')}>{notification.title}</span>
          </div>

          <div
            className={clsx('cursor-pointer')}
            onClick={() => removeNotification(notification.id)}
          >
            <span className={clsx('text-orange font-input-label text-capitalize')}>
              {t('close')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default withTranslation()(Notifications);
