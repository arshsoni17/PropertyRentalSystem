import React from 'react';
import { useTimer } from 'react-timer-hook';

function PaymentTimer({ expiryTimestamp, onExpire }) {
    const {
        seconds,
        minutes,
        isRunning,
    } = useTimer({ 
        expiryTimestamp, 
        onExpire: onExpire || (() => console.warn('Payment time expired')),
    });

    return (
        <div className="flex flex-col items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl w-50 m-10">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">
                Complete payment within
            </p>
            <div className="flex items-center gap-2">
                {/* Minutes */}
                <div className="flex flex-col items-center bg-white border border-red-200 rounded-lg px-4 py-2 min-w-14">
                    <span className="text-3xl font-bold text-red-600">
                        {String(minutes).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-red-400">min</span>
                </div>

                <span className="text-2xl font-bold text-red-500">:</span>

                {/* Seconds */}
                <div className="flex flex-col items-center bg-white border border-red-200 rounded-lg px-4 py-2 min-w-14">
                    <span className="text-3xl font-bold text-red-600">
                        {String(seconds).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-red-400">sec</span>
                </div>
            </div>

            {!isRunning && (
                <p className="text-xs font-semibold text-red-600">Session Expired!</p>
            )}
        </div>
    );
}

export default PaymentTimer;