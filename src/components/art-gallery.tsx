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
  const photos = collections.flatMap(group => group.photos);
  function navigatePhoto(direction: number) {
    const index = photos.findIndex(photo => photo.src === openPhoto);
    if (index < 0 || photos.length < 2) return;
    setOpenPhoto(photos[Math.max(0, Math.min(photos.length - 1, index + direction))].src);
  }
  const selectedPhoto = photos.find(photo => photo.src === openPhoto);
  const openedTrigger = useRef<HTMLButtonElement>(null);
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
      const visibleTop = Math.max(0, filtersRef.current?.getBoundingClientRect().bottom ?? offsets.header + offsets.filters);
      const visibleBottom = window.innerHeight;
      const visibleSections = sections.map(section => {
        const bounds = section.getBoundingClientRect();
        return { id: section.id, totalHeight: bounds.height, height: Math.max(0, Math.min(bounds.bottom, visibleBottom) - Math.max(bounds.top, visibleTop)) };
      });
      const totalVisibleGallery = visibleSections.reduce((total, section) => total + section.height, 0);
      // Compare short collections with their own height so a single row can
      // become active. Tall collections still use the visible gallery height.
      // Prefer the greatest coverage and keep the current chip at a tie.
      setActiveCollection(current => {
        let selected = current;
        let bestCoverage = 0.5;
        const ranked = [...visibleSections].sort((a, b) => Number(b.id === current) - Number(a.id === current));
        for (const section of ranked) {
          const availableHeight = Math.min(section.totalHeight, totalVisibleGallery);
          const coverage = availableHeight > 0 ? section.height / availableHeight : 0;
          if (coverage > bestCoverage) {
            selected = section.id;
            bestCoverage = coverage;
          }
        }
        return selected;
      });
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

  function revealChip(chip: HTMLElement) {
    const row = chipRowRef.current;
    if (!row || row.scrollWidth <= row.clientWidth) return;
    const bounds = row.getBoundingClientRect(), selected = chip.getBoundingClientRect();
    const padding = 8;
    if (selected.left < bounds.left + padding) row.scrollLeft -= bounds.left + padding - selected.left;
    else if (selected.right > bounds.right - padding) row.scrollLeft += selected.right - bounds.right + padding;
  }

  useEffect(() => {
    const row = chipRowRef.current;
    // A scroll-driven selection must never hide the chip someone is using.
    const focused = document.activeElement;
    const chip = focused instanceof HTMLAnchorElement && row?.contains(focused)
      ? focused
      : row?.querySelector<HTMLElement>('[aria-current="location"]');
    if (chip) revealChip(chip);
  }, [activeCollection]);

  return (
    <Dialog open={!!selectedPhoto} onOpenChange={open => { if (!open) setOpenPhoto(null); }}>
    <div className="pb-8 text-left">
      <div className="site-gutter pb-4 pt-10 sm:pt-16">
        <div className="site-width">
          <h1 className="sr-only">Art + design</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">My best work from the past decade, mostly created at Pratt Institute.</p>
        </div>
      </div>
      <nav ref={filtersRef} aria-label="Art collections" style={{ top: offsets.header }} className="site-gutter sticky z-30 bg-background py-2">
        <div className="site-width">
          <div ref={chipRowRef}
            onFocusCapture={event => {
              if (event.target instanceof HTMLAnchorElement) revealChip(event.target);
            }}
            onKeyDown={event => {
              if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              const chips = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a[href]"));
              const current = chips.indexOf(event.target as HTMLAnchorElement);
              if (current < 0) return;
              event.preventDefault();
              const index = event.key === "Home" ? 0 : event.key === "End" ? chips.length - 1
                : Math.max(0, Math.min(chips.length - 1, current + (event.key === "ArrowRight" ? 1 : -1)));
              chips[index]?.focus({ preventScroll: true });
            }}
            className="-ml-3 flex gap-2 overflow-x-auto px-2 py-2 max-md:[scrollbar-width:none] max-md:[&::-webkit-scrollbar]:hidden md:pb-3 min-[1100px]:flex-wrap min-[1100px]:pb-2">
            {collections.map(group => <a key={group.id} href={`#${group.id}`} aria-current={activeCollection === group.id ? "location" : undefined} className={`${navigationControlClass()} whitespace-nowrap border-2 ${activeCollection === group.id ? `border-ink ${careSurfaceClass} font-semibold` : "border-transparent"}`}>{group.title}<span className="ml-2 text-sm text-muted-foreground">{group.photos.length}</span></a>)}
          </div>
        </div>
      </nav>
      <div className="space-y-1 px-1">
        {collections.map((group, groupIndex) => (
          <section key={group.id} id={group.id} aria-label={group.title} style={{ scrollMarginTop: offsets.header + offsets.filters + 8 }} className="grid grid-cols-1 items-start gap-1 md:grid-cols-3 xl:grid-cols-4">
          {group.photos.map((photo, index) => (
              <div key={photo.src}>
                <DialogTrigger onClick={event => { openedTrigger.current = event.currentTarget; setOpenPhoto(photo.src); }} className="relative block w-full cursor-zoom-in overflow-hidden rounded-[8px] align-top focus-visible:z-10 focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-foreground" aria-label={`Open ${photo.title}: ${photo.alt}`}>
                  <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} unoptimized loading={groupIndex === 0 && index < 4 ? "eager" : "lazy"} className="block h-auto w-full" />
                </DialogTrigger>

              </div>
          ))}
          </section>
        ))}
      </div>
    </div>
                {selectedPhoto && <ArtImageViewer showFitButton={false} photo={selectedPhoto} returnFocusRef={openedTrigger} galleryImages={photos.map(item => ({ src: item.original, alt: item.alt }))} onSelectImage={src => { const photo = photos.find(item => item.original === src); if (photo) setOpenPhoto(photo.src); }} showThumbnails={false} fitGalleryImages onPrevious={openPhoto !== photos[0]?.src ? () => navigatePhoto(-1) : undefined} onNext={openPhoto !== photos.at(-1)?.src ? () => navigatePhoto(1) : undefined} />}
    </Dialog>
  );
}
