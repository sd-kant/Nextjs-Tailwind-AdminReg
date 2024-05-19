import React, { lazy } from "react";
import { useTranslation } from 'react-i18next';
import KlogoOrange1 from 'assets/images/K Logo_orange 1.png';
import { Link, Route, useLocation, Routes } from "react-router-dom";

const Manuals = lazy(() => import('./Tabs/Manuals'));
const Videos = lazy(() => import('./Tabs/Videos'));
const GetHelp = lazy(() => import('./Tabs/GetHelp'));

const TabWrapper = () => {
    const { t } = useTranslation();
    const subpath = useLocation().pathname.split('/').slice(0, 3).join('/');
    const label = React.useMemo(
        () => {
            if(subpath.includes('device')) return t('device support');
            if(subpath.includes('hub')) return t('hub support');
            if(subpath.includes('mobile-apps')) return t('mobile app support');
            if(subpath.includes('admin')) return t('administration support');
            if(subpath.includes('dashboard')) return t('team dashboard support');
            if(subpath.includes('analytics')) return t('analytics support');
            return '';
        }, [subpath, t]
    );

    return (
        <div className="tw-flex tw-divide-y-0 tw-divide-x tw-divide-solid tw-pt-8 tw-ml-2 sm:tw-ml-6 md:tw-ml-12">
            <div className="tw-p-2 sm:tw-p-4 md:tw-p-6">
                <div className="tw-flex tw-justify-end">
                    <img className="tw-w-[50px] sm:tw-w-auto" src={KlogoOrange1} alt="placeholder" />
                </div>
                <ul className="tw-pl-0 sm:tw-pl-[40px] tw-list-none">
                    <li className="tw-py-3 font-heading-medium"><Link className="tw-no-underline tw-text-white" to={`${subpath}/manuals`}>{t('manuals')}</Link></li>
                    <li className="tw-py-3 font-heading-medium"><Link className="tw-no-underline tw-text-white" to={`${subpath}/videos`}>{t('videos')}</Link></li>
                    <li className="tw-py-3 font-heading-medium"><Link className="tw-no-underline tw-text-white" to={`${subpath}/get-help`}>{t('get help')}</Link></li>
                </ul>
            </div>
            <div className="tw-pl-2 sm:tw-pl-4 md:tw-pl-6">
                <h2 className='font-heading-large-44-auto tw-text-orange-400 tw-my-0'>{label}</h2>
                <div className="tw-pl-2 sm:tw-pl-8">
                    <Routes>
                        <Route path="/manuals" element={<Manuals />} />
                        <Route path="/videos" element={<Videos />} />
                        <Route path="/get-help" element={<GetHelp />} />
                        <Route path="*" element={<Manuals />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default TabWrapper;