import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const dates = [
    {
        "date": "2026-02-01",
        "reason": "host_blocked"
    },
    {
        "date": "2026-03-01",
        "reason": "host_blocked"
    },
    {
        "date": "2026-03-02",
        "reason": "host_blocked"
    },
    {
        "date": "2026-03-15",
        "reason": "host_blocked"
    },
    {
        "date": "2026-03-28",
        "reason": "host_blocked"
    }
]
//it will not change the original array, ... this three dotes is spread operator which is used to expand an array into individual elements


// dates.forEach( () => { });

function Calendar({ disabled = [], onDateChange }) {
    const [selectedRange, setSelectedRange] = useState();

    const handleSelect = (range) => {
        setSelectedRange(range);
        onDateChange?.({
            startDate: range?.from ?? null,
            endDate: range?.to ?? null,
        });
    };

    const handleClearDates = () => {
        setSelectedRange(null);
        onDateChange?.({ startDate: null, endDate: null });
    };


    return (
        <div className=" w-180 p-2 bg-white shadow-sm">
            
            <DayPicker
                mode="range"
                numberOfMonths={2}
                selected={selectedRange}
                onSelect={handleSelect}
                excludeDisabled
                disabled={disabled}
                modifiersClassNames={{
                    disabled: 'text-red-500 line-through opacity-90',
                    selected: 'bg-black text-white font-bold',
                }}
                className="border-none"
            />

            {/* Clear dates button */}
            <div className="w-160 flex justify-end mt-4 pt-4 border-t">
                <button
                    onClick={handleClearDates}
                    className="text-sm font-semibold  hover:text-gray-600 transition"
                >
                    Clear dates
                </button>
            </div>
        </div>
    );
}

export default Calendar;