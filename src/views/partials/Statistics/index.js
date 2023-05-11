import * as React from 'react';
import { Trans, withTranslation } from 'react-i18next';

import clsx from 'clsx';
import style from './Statistics.module.scss';

const Statistics = ({ t, boxShadow = false }) => {
  const items = [
    {
      amount: 5,
      title: t('active users')
    },
    {
      amount: '8hrs',
      title: t('average wear time')
    },
    {
      amount: '40%',
      title: t('users receiving alerts')
    },
    {
      amount: '4',
      title: t('stop work alerts')
    },
    {
      amount: '1',
      title: t('ready to work alerts')
    }
  ];

  return (
    <div className={clsx(style.Wrapper, boxShadow ? style.BoxShadow : null)}>
      <div className={clsx(style.InnerWrapper, style.LeftWrapper)}>
        {items.map((item, index) => (
          <div className={clsx(style.Item)} key={`statistics-item-${index}`}>
            <div>
              <span className={clsx('font-header-medium')}>{item.amount}</span>
            </div>

            <div>
              <span className={clsx('font-binary', 'text-capitalize')}>{item.title}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={clsx(style.InnerWrapper, style.RightWrapper)}>
        <div>
          <div>
            <span className={clsx('font-button-label')}>{t('kenzen recommendation')}</span>
          </div>

          <div style={{ marginTop: '4px' }}>
            <span className={clsx('font-binary')}>
              <Trans
                i18nKey={'recommendation description'}
                components={{
                  span: <span className={clsx('font-input-label-italic')} />
                }}
                values={{
                  minutes: '15 (fifteen) minute',
                  when: '9:30:00 AM'
                }}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(Statistics);
