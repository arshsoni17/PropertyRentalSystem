import { Photo, ColumnsPhotoAlbumProps, ResolvedNumber, ComponentsProps, Render } from '../types.js';
import 'react';

type ResolvedColumnsProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = Omit<ColumnsPhotoAlbumProps<TPhoto>, "columns" | "spacing" | "padding" | "componentsProps" | "render"> & {
    spacing: ResolvedNumber<TWidth>;
    padding: ResolvedNumber<TWidth>;
    columns: ResolvedNumber<TWidth>;
    componentsProps: ComponentsProps<TPhoto>;
    render: Render<TPhoto> | undefined;
};
declare function resolveColumnsProps<TPhoto extends Photo>(containerWidth: number, props: ColumnsPhotoAlbumProps<TPhoto>): ResolvedColumnsProps<TPhoto, number>;
declare function resolveColumnsProps<TPhoto extends Photo>(containerWidth: number | undefined, props: ColumnsPhotoAlbumProps<TPhoto>): ResolvedColumnsProps<TPhoto>;

export { resolveColumnsProps as default };
