import { Photo, RowsPhotoAlbumProps, ResolvedNumber, ComponentsProps, Render } from '../types.js';
import 'react';

type ResolvedRowsProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = Omit<RowsPhotoAlbumProps<TPhoto>, "targetRowHeight" | "rowConstraints" | "spacing" | "padding" | "componentsProps" | "render"> & {
    spacing: ResolvedNumber<TWidth>;
    padding: ResolvedNumber<TWidth>;
    targetRowHeight: ResolvedNumber<TWidth>;
    componentsProps: ComponentsProps<TPhoto>;
    render: Render<TPhoto> | undefined;
    minPhotos: number | undefined;
    maxPhotos: number | undefined;
};
declare function resolveRowsProps<TPhoto extends Photo>(containerWidth: number, props: RowsPhotoAlbumProps<TPhoto>): ResolvedRowsProps<TPhoto, number>;
declare function resolveRowsProps<TPhoto extends Photo>(containerWidth: number | undefined, props: RowsPhotoAlbumProps<TPhoto>): ResolvedRowsProps<TPhoto>;

export { resolveRowsProps as default };
