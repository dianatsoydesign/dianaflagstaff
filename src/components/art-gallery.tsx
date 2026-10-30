"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import collections from "@/data/art-gallery.json";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ArtImageViewer } from "@/components/art-image-viewer";
import { useViewerHistory } from "@/lib/use-viewer-history";
import { careSurfaceClass } from "@/components/picker-styles";
import { navigationControlClass } from "@/lib/navigation-styles";

export function ArtGallery() {
  const [openPhoto, setOpenPhoto] = useViewerHistory("art-gallery");
  const filtersRef = useRef<HTMLElement>(null);
  const [activeCollection, setActiveCollection] = useState(collections[0]?.id ?? "");
  const chipRowRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const sections = collections.map(group => document.getElementById(group.id)).filter((section): section is HTMLElement => !!section);
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = (filtersRef.current?.getBoundingClientRect().bottom ?? offsets.header + offsets.filters) + 24;
      let current: HTMLElement | undefined = sections[0];
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section;
        else break;
      }
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections.at(-1);
      if (current) setActiveCollection(current.id);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const observer = new ResizeObserver(schedule);
    sections.forEach(section => observer.observe(section));
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [offsets.header, offsets.filters]);

  useEffect(() => {
    const row = chipRowRef.current;
    const chip = row?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!row || !chip || row.scrollWidth <= row.clientWidth) return;
    const bounds = row.getBoundingClientRect(), selected = chip.getBoundingClientRect();
    // Reveal the active chip horizontally without moving the page or keyboard focus.
    if (selected.left < bounds.left) row.scrollLeft -= bounds.left - selected.left + 4;
    else if (selected.right > bounds.right) row.scrollLeft += selected.right - bounds.right + 4;
  }, [activeCollection]);

  return (
    <div className="pb-8 text-left">
      <div className="site-gutter pb-4 pt-10 sm:pt-16">
        <div className="site-width">
          <h1 className="sr-only">Art + design</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">My best work from the past decade, mostly created at Pratt Institute.</p>
        </div>
      </div>
      <nav ref={filtersRef} aria-label="Art collections" style={{ top: offsets.header }} className="site-gutter sticky z-30 bg-background py-2">
        <div className="site-width">
          <div ref={chipRowRef} className="-ml-3 flex gap-2 overflow-x-auto px-2 py-2 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:pb-3 min-[1100px]:flex-wrap min-[1100px]:pb-2">
            {collections.map(group => <a key={group.id} href={`#${group.id}`} aria-current={activeCollection === group.id ? "location" : undefined} className={`${navigationControlClass()} whitespace-nowrap border-2 ${activeCollection === group.id ? `border-ink ${careSurfaceClass} font-semibold` : "border-transparent"}`}>{group.title}<span className="ml-2 text-sm text-muted-foreground">{group.photos.length}</span></a>)}
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
