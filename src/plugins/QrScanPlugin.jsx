import React, { useEffect, useState } from 'react';
import QrScanner from 'qr-scanner';

const qrcodeRegionId = "qr-scan-full-region";

const QrScanPlugin = ({qrCodeSuccessCallback}) => {
    const [qrScanner, setQrScanner] = useState(null);

    useEffect(() => {
        if(qrScanner === null){
            const _qrScanner = new QrScanner(
                document.getElementById(qrcodeRegionId),
                result => {
                    qrCodeSuccessCallback(result.data);
                },
                { 
                    // onDecodeError: error => {
                    //     console.error(error);
                    // },
                    preferredCamera: 'environment',
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                },
            );
            setQrScanner(_qrScanner);
        }
        return async () => {
            if(qrScanner){
                console.log('destory scanning')
                qrScanner.destroy();
                setQrScanner(null);
            }
        }
    }, [qrScanner, qrCodeSuccessCallback]);

    useEffect(() => {
        if(qrScanner){
            console.log('starting')
            qrScanner.setInversionMode('both');
            qrScanner.start();
        }
    }, [qrScanner]);

    return (
        <video className='tw-w-full tw-h-full' muted id={qrcodeRegionId} />
    );
};

export default QrScanPlugin;