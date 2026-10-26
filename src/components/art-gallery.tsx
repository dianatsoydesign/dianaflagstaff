"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import collections from "@/data/art-gallery.json";
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { navigationControlClass } from "@/lib/navigation-styles";

export function ArtGallery() {
  const filtersRef = useRef<HTMLElement>(null);
  const [offsets, setOffsets] = useState({ header: 0, filters: 60 });

  useEffect(() => {
    const header = document.querySelector("header");
    const filters = filtersRef.current;
    if (!header || !filters) return;
    const update = () => {
      const height = header.getBoundingClientRect().height;
      setOffsets({ header: header.dataset.scrollHidden === "true" ? 0 : height, filters: filters.getBoundingClientRect().height });
    };
    const observer = new ResizeObserver(update);
    const attributes = new MutationObserver(update);
    attributes.observe(header, { attributes: true, attributeFilter: ["data-scroll-hidden"] });
    observer.observe(header);
    observer.observe(filters);
    update();
    return () => { observer.disconnect(); attributes.disconnect(); };
  }, []);

  return (
    <div className="pb-8 text-left">
      <div className="site-gutter pb-4 pt-10 sm:pt-16">
        <div className="site-width">
          <h1 className="sr-only">Art gallery</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">My best work from the past decade, mostly created at Pratt Institute.</p>
        </div>
      </div>
      <nav ref={filtersRef} aria-label="Art collections" style={{ top: offsets.header }} className="site-gutter sticky z-30 bg-background py-2">
        <div className="site-width">
          <div className="-ml-3 flex gap-2 overflow-x-auto px-1 py-1 min-[1100px]:flex-wrap">
            {collections.map(group => <a key={group.id} href={`#${group.id}`} className={`${navigationControlClass()} whitespace-nowrap`}>{group.title}<span className="ml-2 text-sm text-muted-foreground">{group.photos.length}</span></a>)}
          </div>
        </div>
      </nav>
      <div className="columns-2 gap-1 px-1 md:columns-3 xl:columns-4">
        {collections.flatMap((group, groupIndex) =>
          group.photos.map((photo, index) => (
              <Dialog key={photo.src}>
                <DialogTrigger id={index === 0 ? group.id : undefined} style={{ scrollMarginTop: offsets.header + offsets.filters + 8 }} className=" relative mb-1 block w-full cursor-zoom-in break-inside-avoid overflow-hidden align-top focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground" aria-label={`Open ${photo.title}: ${photo.alt}`}>
                  <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized loading={groupIndex === 0 && index < 4 ? "eager" : "lazy"} className="block h-auto w-full" />
                </DialogTrigger>
                <DialogContent className="flex max-h-[94dvh] w-[96vw] max-w-[96vw] flex-col gap-3 overflow-y-auto rounded-none p-3 motion-reduce:animate-none! sm:max-w-[96vw]">
                  <div className="pr-12">
                    <DialogTitle className="leading-normal">{photo.title}</DialogTitle>
                    <DialogDescription className="sr-only">{photo.alt}</DialogDescription>
                  </div>
                  <Image src={photo.original} alt={photo.alt} width={photo.width} height={photo.height} unoptimized className="mx-auto block h-auto max-h-[74dvh] w-auto max-w-full object-contain" />
                </DialogContent>
              </Dialog>
          ))
        )}
      </div>
    </div>
  );
}
