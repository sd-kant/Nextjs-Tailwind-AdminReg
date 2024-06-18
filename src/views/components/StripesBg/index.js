import React from "react";
import styles from "./index.module.scss";
import clsx from "clsx";

const StripesBg = () => {
    return (
        <div className="tw-hidden sm:tw-flex tw-flex-col tw-fixed tw-right-0 tw-h-dvh md:tw-w-[280px] tw-pointer-events-none -tw-z-[100]">
            <div className={clsx(styles.stripesBgTop, 'tw-grow', 'tw-w-[280px]')}></div>
            <div className={clsx(styles.stripesBgBottom, 'tw-grow', 'tw-w-[280px]')}></div>
        </div>
    );
};

export default StripesBg;