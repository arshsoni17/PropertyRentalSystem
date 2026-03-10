import { useState } from "react";
import useDebounce from "./debounce";
import LoadingPreview from "../loadingPage";
import { useEffect } from "react";

export default function useSearch(url) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    //remove error

    const debouncedQuery = useDebounce(query, 500); //this will only updates after 500 ms

    useEffect(() => {
        //here trim is used so that we will gget our search input string without space 
        if (!debouncedQuery.trim()) {
            setResults([]);
            return;
        }
        //////////////////////**************************************** MAIN THING **********************/
        const controller = new AbortController();//avoid race condition

        const fetchResults = async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    `${url}?q=${debouncedQuery}`, {
                    signal: controller.signal // this will ties the controller with the fetch 
                })

                if( !response.ok ){ return console.log( "there is error in fetching")}

                const data = await response.json();

                setResults(data);
            }
            catch (error) {
                console.log(error);
            }finally{
                setLoading(false);
            }
        };

        //call the function
        fetchResults();

        return ()=> controller.abort(); // this will cancel the fetch if the qurey changes
    }, [ debouncedQuery, url ]);

    return { query, setQuery, results, loading };
}