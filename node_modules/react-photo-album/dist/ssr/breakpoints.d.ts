import * as react_jsx_runtime from 'react/jsx-runtime';

declare function useBreakpoints(prefix: string, breakpoints: readonly number[]): {
    containerClass: string;
    breakpointClass: (breakpoint: number) => string;
    breakpoints: number[];
};

type StyledBreakpointsProps = {
    breakpoints: readonly number[];
    containerClass: string;
    breakpointClass: (breakpoint: number) => string;
};
declare function StyledBreakpoints({ breakpoints, containerClass, breakpointClass }: StyledBreakpointsProps): react_jsx_runtime.JSX.Element;

export { StyledBreakpoints, useBreakpoints };
