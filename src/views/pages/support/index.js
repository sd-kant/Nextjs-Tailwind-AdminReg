import React, {Suspense, lazy} from 'react';
import StripesBg from 'views/components/StripesBg';
import logo from 'assets/images/logo_light.svg';
import { Route, Routes } from 'react-router-dom';
import Loader from 'views/components/Loader';

const NavMenu = lazy(() => import('./NavMenu'));
const TabWrapper = lazy(() => import('./TabWrapper'));

const Support = () => {
    return (
        <>
            <StripesBg />
            <div className='tw-flex tw-flex-col tw-justify-center tw-w-full'>
                <div className='tw-flex tw-flex-col tw-mt-6 sm:tw-mt-12 md:tw-mt-24'>
                    <div className='tw-flex tw-pt-2 sm:tw-pt-0'>
                        <div className='tw-ml-6 sm:tw-ml-24 md:tw-ml-36'>
                            <img src={logo} alt="logo" />
                        </div>
                    </div>
                    <Suspense fallback={<Loader />}>
                        <Routes>
                            <Route path='/' element={<NavMenu />} />
                            <Route path='/hub/*' element={<TabWrapper />} />
                            <Route path='/device/*' element={<TabWrapper />} />
                            <Route path='/mobile-apps/*' element={<TabWrapper />} />
                            <Route path='/admin/*' element={<TabWrapper />} />
                            <Route path='/dashboard/*' element={<TabWrapper />} />
                            <Route path='/analytics/*' element={<TabWrapper />} />
                        </Routes>
                    </Suspense>
                </div>
            </div>

        </>

    );
}

export default Support;