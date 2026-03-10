import { useEffect } from "react";
import { useState } from "react";

export default function useDebounce( value, delay = 500 ){
    const [ debouncedValue, setDebouncedValue ] = useState(value);

    //now this useEffect is dependent on the value and delay so when even it changes it is 
    // rendered again
    useEffect( ()=>{
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        
        return () =>clearTimeout(timer);
    }, [value, delay]);  

    return debouncedValue;
}
