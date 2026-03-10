import { Photo, CommonPhotoAlbumProps, ResolvedNumber, ComponentsProps, Render, ResponsiveParameter, ResponsiveSizes } from '../types.js';
import 'react';

declare function clsx(...classes: (string | boolean | undefined)[]): string;

declare function cssClass(suffix?: string): string;
declare function cssVar(suffix: string): string;

declare function ratio({ width, height }: Pick<Photo, "width" | "height">): number;

type CommonProps<TPhoto extends Photo> = Pick<CommonPhotoAlbumProps<TPhoto>, "spacing" | "padding" | "componentsProps" | "render">;
type ResolvedCommonProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = {
    spacing: ResolvedNumber<TWidth>;
    padding: ResolvedNumber<TWidth>;
    componentsProps: ComponentsProps<TPhoto>;
    render: Render<TPhoto> | undefined;
};
declare function unwrap<Value, Arg>(value: Value | ((arg: Arg) => Value), arg: Arg): Value;
declare function unwrapParameter<Value>(value: ResponsiveParameter<Value> | undefined, containerWidth: number | undefined): Value | undefined;
declare function resolveResponsiveParameter(parameter: ResponsiveParameter | undefined, containerWidth: number, values: readonly ResponsiveParameter[], minValue?: number): number;
declare function resolveResponsiveParameter(parameter: ResponsiveParameter | undefined, containerWidth: number | undefined, values: readonly ResponsiveParameter[], minValue?: number): number | undefined;
declare function resolveCommonProps<TPhoto extends Photo>(containerWidth: number, props: CommonProps<TPhoto>): ResolvedCommonProps<TPhoto, number>;
declare function resolveCommonProps<TPhoto extends Photo>(containerWidth: number | undefined, props: CommonProps<TPhoto>): ResolvedCommonProps<TPhoto>;

declare function round(value: number, decimals?: number): number;

declare function srcSetAndSizes(photo: Photo, responsiveSizes: ResponsiveSizes | undefined, photoWidth: number, containerWidth: number, photosCount: number, spacing: number, padding: number): {
    srcSet: string | undefined;
    sizes: string;
};

export { clsx, cssClass, cssVar, ratio, resolveCommonProps, resolveResponsiveParameter, round, srcSetAndSizes, unwrap, unwrapParameter };
