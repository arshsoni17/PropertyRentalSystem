import { Photo, MasonryPhotoAlbumProps, ResolvedNumber, ComponentsProps, Render } from '../types.js';
import 'react';

type ResolvedMasonryProps<TPhoto extends Photo, TWidth extends number | undefined = number | undefined> = Omit<MasonryPhotoAlbumProps<TPhoto>, "columns" | "spacing" | "padding" | "componentsProps" | "render"> & {
    spacing: ResolvedNumber<TWidth>;
    padding: ResolvedNumber<TWidth>;
    columns: ResolvedNumber<TWidth>;
    componentsProps: ComponentsProps<TPhoto>;
    render: Render<TPhoto> | undefined;
};
declare function resolveMasonryProps<TPhoto extends Photo>(containerWidth: number, props: MasonryPhotoAlbumProps<TPhoto>): ResolvedMasonryProps<TPhoto, number>;
declare function resolveMasonryProps<TPhoto extends Photo>(containerWidth: number | undefined, props: MasonryPhotoAlbumProps<TPhoto>): ResolvedMasonryProps<TPhoto>;

export { resolveMasonryProps as default };
