"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import collections from "@/data/art-gallery.json";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ArtImageViewer } from "@/components/art-image-viewer";
import { navigationControlClass } from "@/lib/navigation-styles";

export function ArtGallery() {
  const [openPhoto, setOpenPhoto] = useState<string | null>(null);
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
      <div className="space-y-1 px-1">
        {collections.map((group, groupIndex) => (
          <section key={group.id} id={group.id} aria-label={group.title} style={{ scrollMarginTop: offsets.header + offsets.filters + 8 }} className="grid grid-cols-1 items-start gap-1 md:grid-cols-3 xl:grid-cols-4">
          {group.photos.map((photo, index) => (
              <Dialog key={photo.src} open={openPhoto === photo.src} onOpenChange={open => setOpenPhoto(open ? photo.src : null)}>
                <DialogTrigger className="relative block w-full cursor-zoom-in overflow-hidden rounded-[8px] align-top focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground" aria-label={`Open ${photo.title}: ${photo.alt}`}>
                  <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized loading={groupIndex === 0 && index < 4 ? "eager" : "lazy"} className="block h-auto w-full" />
                </DialogTrigger>
                {openPhoto === photo.src && <ArtImageViewer photo={photo} />}
              </Dialog>
          ))}
          </section>
        ))}
      </div>
    </div>
  );
}
