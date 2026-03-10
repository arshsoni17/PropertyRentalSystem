import { Photo, LayoutModel } from '../types.js';
import 'react';

declare function computeColumnsLayout<TPhoto extends Photo>(photos: readonly TPhoto[], spacing: number, padding: number, containerWidth: number, columns: number): LayoutModel<TPhoto> | undefined;

export { computeColumnsLayout as default };
