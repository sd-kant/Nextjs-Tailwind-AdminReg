import React from "react";
import styles from './index.module.scss';
import clsx from "clsx";

import workerOrange1 from 'assets/images/worker-orange.svg';
import settings from 'assets/images/settings-orange.svg';
import workerOrange from 'assets/images/worker-orange-2.svg';
import ArrowIcon from 'assets/images/arrow.svg';
import KenzenDeviceImg from 'assets/images/kenzen-device.png';
import graphBar from 'assets/images/graph-bars.svg';

const NavBigBtn = ({ text, topLabel = '', iconName, iconImage, onClick, children, textClassName='' }) => {

    const renderIcon = (iconName) => {
        switch(iconName){
            case 'admin':
                return (
                  <div className={clsx(styles.ImageWrapper)}>
                    <img
                      src={workerOrange1}
                      className={clsx(styles.WorkerOrangeImage)}
                      alt="worker orange"
                    />
                    <img src={settings} className={clsx(styles.SettingsImage)} alt="settings" />
                  </div>
                )
            case 'dashboard':
                return (
                    <div className={clsx(styles.ImageWrapper2_Body)}>
                      <div className={clsx(styles.ImageWrapper2)}>
                        <img
                          src={workerOrange}
                          className={clsx(styles.WorkerWhiteImage1)}
                          alt="settings"
                        />
                        <img
                          src={workerOrange}
                          className={clsx(styles.WorkerOrangeImage)}
                          alt="worker orange"
                        />
                      </div>
                    </div>
                );
            case 'connect_device1':
                return (
                    <div className={clsx(styles.ImageWrapper3)}>
                        <div className={clsx(styles.GroupMembers)}>
                        <img
                            src={workerOrange}
                            className={clsx(styles.WorkerWhiteImage1)}
                            alt="settings"
                        />
                        <img src={workerOrange} alt="worker" />
                        </div>
                        <img src={ArrowIcon} className={clsx(styles.Arrow)} alt="arrow" />
                        <img src={KenzenDeviceImg} alt="kenzen device" />
                    </div>
                );
            case 'connect_device2':
                return (
                    <div className={clsx(styles.ImageWrapper4)}>
                        <img src={workerOrange} alt="worker" />
                        <img src={ArrowIcon} alt="arrow" />
                        <img src={KenzenDeviceImg} alt="kenzen device" />
                    </div>
                )
            case 'analytics':
                return (
                    <div className={clsx(styles.ImageWrapper, 'tw-w-full')}>
                        <img src={graphBar} className="tw-w-full tw-h-[94px]" alt="analytics" />
                    </div>
                )
            default:
                return (
                    <div className={clsx('tw-flex', 'tw-justify-center', 'tw-p-[15px]', 'tw-w-full')}>
                        {children}
                    </div>
                )
        }
    };
    return (
        <div className={clsx(styles.OptionWrapper)} onClick={onClick}>
            {topLabel && (
                <div>
                    <span className={clsx('font-button-label')}>{topLabel}</span>
                </div>
            )}
            {renderIcon(iconName, iconImage)}
            <div className={clsx(styles.DescriptionDiv)}>
                <span className={clsx({'font-small': !textClassName}, textClassName)}>{text}</span>
            </div>
        </div>
    );
}

export default NavBigBtn;