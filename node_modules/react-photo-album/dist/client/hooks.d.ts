import { ForwardedRef } from '../types.js';
import 'react';

declare function useArray<T>(array: readonly T[] | undefined): readonly T[] | undefined;

declare function useContainerWidth(ref: ForwardedRef, breakpointsArray: readonly number[] | undefined, defaultContainerWidth?: number): {
    containerRef: (node: HTMLElement | null) => void;
    containerWidth: number | undefined;
};

export { useArray, useContainerWidth };
