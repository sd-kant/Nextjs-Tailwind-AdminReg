import React from "react";

import NavBigBtn from 'views/components/NavBigBtn';
import mobileSvg from 'assets/images/mobile.svg';
import deviceSvg from 'assets/images/kenzen-device-01.png';
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";

export const MENU_LIST = [
    {
        text: 'device',
        iconName: 'device',
        path: '/support/device',
        img: deviceSvg
    },
    {
        text: 'hub',
        iconName: 'connect_device1',
        path: '/support/hub'
    },
    {
        text: 'mobile apps',
        iconName: 'mobile apps',
        path: '/support/mobile-apps',
        img: mobileSvg
    },
    {
        text: 'administration',
        iconName: 'admin',
        path: '/support/admin',
        img: deviceSvg
    },
    {
        text: 'dashboard',
        iconName: 'dashboard',
        path: '/support/dashboard'
    },
    {
        text: 'analytics',
        iconName: 'analytics',
        path: '/support/analytics',
        img: mobileSvg
    },
];

const NavMenu = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    return (
        <div className='tw-flex tw-ml-8 md:tw-ml-[12%] lg:tw-ml-[20%]'>
            <div className='tw-flex tw-flex-col'>
                <h2 className='tw-text-center font-heading-large-44-auto tw-text-orange-400'>{t('kenzen support')}</h2>
                <div className='tw-grid tw-grid-cols-1 sm:tw-grid-cols-2 md:tw-grid-cols-3 md:tw-divide-gray-300 tw-gap-4'>
                    {MENU_LIST.map((item, index) => (
                        <div key={index} >
                            <NavBigBtn
                                text={t(item.text)}
                                textClassName="font-ubuntu-regular tw-text-[14px] sm:tw-text-[16px] md:tw-text-[18px]"
                                iconName={item.iconName}
                                onClick={() => navigate(item.path)} >
                                {item.img && <img src={item.img} className="" alt={item.text} />}
                            </NavBigBtn>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavMenu;