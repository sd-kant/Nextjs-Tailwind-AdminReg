import { Html5QrcodeScanner } from 'html5-qrcode';
import React, { useEffect, useState } from 'react';

const qrcodeRegionId = "html5qr-code-full-region";

// Creates the configuration object for Html5QrcodeScanner.
const createConfig = (props) => {
    let config = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    if (props.formatsToSupport){
        config.formatsToSupport = props.formatsToSupport;
    }
    if(props.useBarCodeDetectorIfSupported !== undefined){
        config.useBarCodeDetectorIfSupported = props.useBarCodeDetectorIfSupported;
    }
    if(props.videoConstraints){
        config.videoConstraints = props.videoConstraints;
    }
    return config;
};

const Html5QrcodePlugin = (props) => {
    const [html5QrcodeScanner, setHtml5QrcodeScanner] = useState(null);
    useEffect(() => {
        // when component mounts
        const config = createConfig(props);
        const verbose = props.verbose === true;
        // Suceess callback is required.
        if (!(props.qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }
        if(html5QrcodeScanner === null){
            setHtml5QrcodeScanner(new Html5QrcodeScanner(qrcodeRegionId, config, verbose));
        }
        // cleanup function when component will unmount
        return () => {
            if(html5QrcodeScanner){
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear html5QrcodeScanner. ", error);
                });
            }
        };
    }, [html5QrcodeScanner, props]);

    useEffect(() => {
        if(html5QrcodeScanner) html5QrcodeScanner.render(props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
    }, [html5QrcodeScanner, props])

    return (
        <div id={qrcodeRegionId} />
    );
};

export default Html5QrcodePlugin;