"use client";

import { useRef, useState, type FormEvent } from "react";
import { ImagePlus, X } from "lucide-react";
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CustomerContactFields } from "@/components/customer-contact-fields";
import { isValidOrderEmail } from "@/lib/cart-field-limits";
import { ShopRequestCat } from "@/components/shop-request-cat";
import { ProductNamePrice } from "@/components/product-name-price";
import { RequestTextarea } from "@/components/request-textarea";

type Field = "name" | "email" | "idea" | "photos";
const initialValues = { name: "", email: "", idea: "" };
const photoLimit = 2 * 1024 * 1024;

export function CustomRequestTile() {
  const [values, setValues] = useState(initialValues);
  const [photos, setPhotos] = useState<File[]>([]);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const form = useRef<HTMLFormElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const errorClass = "mt-2 text-left text-sm text-red-700 dark:text-red-400";

  function fieldError(key: Field) {
    return errors[key] ? <p id={`custom-${key}-error`} role="alert" className={errorClass}>{errors[key]}</p> : null;
  }
  function addPhotos(files: FileList | null) {
    if (!files) return;
    const next = [...photos, ...Array.from(files)].filter((file, index, all) => all.findIndex(item => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified) === index);
    let message: string | undefined;
    if (next.length > 1) message = "Remove the current image before choosing another.";
    else if (next.some(file => file.size > photoLimit)) message = "Each photo must be 2 MB or smaller.";
    else if (next.some(file => !["image/jpeg", "image/png", "image/webp"].includes(file.type))) message = "Use JPG, PNG, or WebP photos.";
    setErrors(current => ({ ...current, photos: message }));
    if (!message) { setPhotos(next); setUploadStatus(next.length ? `${next[0].name} attached.` : ""); }
  }
  function validate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Partial<Record<Field, string>> = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!isValidOrderEmail(values.email)) next.email = "Enter a valid email address.";
    if (!values.idea.trim()) next.idea = "Tell me what you would like to make.";
    setErrors(current => ({ ...current, ...next }));
    const first = Object.keys(next)[0];
    if (first) form.current?.querySelector<HTMLElement>(`#custom-${first}`)?.focus();
  }

  return (
    <Sheet>
      <SheetTrigger className="group flex w-full cursor-pointer flex-col gap-2 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground">
        <div className="@container relative flex aspect-square w-full flex-col justify-center overflow-hidden rounded-[8px] bg-wash dark:bg-[#292929] dark:fine-pointer:group-hover:bg-[#3b3b3b] dark:group-focus-visible:bg-[#3b3b3b] p-7 text-foreground ring-1 ring-inset ring-transparent transition-colors duration-200 fine-pointer:group-hover:bg-[#eeeeee] fine-pointer:group-hover:ring-foreground group-focus-visible:bg-[#eeeeee] group-focus-visible:ring-foreground motion-reduce:transition-none sm:p-9">
          <ShopRequestCat />
        </div>
        <ProductNamePrice name="Custom idea" price={0} priceLabel="TBD price" />
      </SheetTrigger>
      <SheetContent side="right" overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[2px]" className="flex !h-dvh !w-full !max-w-none flex-col gap-0 overflow-hidden p-0 motion-reduce:transition-none sm:!w-xl sm:!max-w-xl lg:!w-2xl lg:!max-w-2xl [&>[data-slot=sheet-close]]:size-11">
        <SheetHeader className="shrink-0 border-b border-border px-5 py-5 pr-16">
          <SheetTitle className="font-display text-2xl leading-tight tracking-[-0.04em]">Custom request</SheetTitle>
        </SheetHeader>
        <form ref={form} noValidate onSubmit={validate} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5 text-left">
          <CustomerContactFields idPrefix="custom" name={values.name} email={values.email} fieldErrors={errors}
              namePlaceholder="So I know who I’m creating for" emailPlaceholder="So I can get back to you"
              onNameChange={value => { setValues(current => ({ ...current, name: value })); setErrors(current => ({ ...current, name: undefined })); }}
              onEmailChange={value => { setValues(current => ({ ...current, email: value })); setErrors(current => ({ ...current, email: undefined })); }} />
          <RequestTextarea id="custom-idea" label="Description" required value={values.idea} maxLength={3000} error={errors.idea}
            placeholder="What would you like me to make? Include any details or inspiration links."
            onChange={value => { setValues(current => ({ ...current, idea: value })); setErrors(current => ({ ...current, idea: undefined })); }} />
          <div>
            <label htmlFor="custom-photos" className="mb-3 block text-sm font-medium">Image attachment (optional)</label>
            <div onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; setDragging(true); }}
              onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
              onDrop={event => { event.preventDefault(); setDragging(false); addPhotos(event.dataTransfer.files); }}
              className={`relative flex min-h-40 flex-col items-center justify-center gap-3 rounded-[8px] border-2 border-dashed p-5 focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-foreground ${dragging ? "border-foreground bg-accent" : "border-muted-foreground bg-wash"}`}>
              <ImagePlus aria-hidden="true" className="size-7 text-muted-foreground" />
              <p className="text-sm text-foreground">Drop an image here or <span className="underline underline-offset-4">choose image</span></p>
              <p id="custom-photos-help" className="text-sm text-muted-foreground">JPG, PNG, or WebP. Up to 2 MB.</p>
              <input id="custom-photos" type="file" accept="image/jpeg,image/png,image/webp" aria-describedby={errors.photos ? "custom-photos-help custom-photos-error" : "custom-photos-help"} aria-invalid={!!errors.photos} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" onChange={event => { addPhotos(event.target.files); event.target.value = ""; }} />
            </div>
            <p role="status" className="sr-only">{uploadStatus}</p>
            {fieldError("photos")}
            {!!photos.length && <ul className="mt-3 space-y-2" aria-label="Selected image attachment">{photos.map((photo, index) => <li key={`${photo.name}-${index}`} className="flex items-center justify-between gap-3 text-sm"><span className="min-w-0 break-all">{photo.name}</span><Button type="button" variant="ghost" className="size-11 shrink-0" aria-label={`Remove ${photo.name}`} onClick={() => { setPhotos([]); setUploadStatus("Image removed."); setErrors(current => ({ ...current, photos: undefined })); }}><X aria-hidden="true" className="size-4" /></Button></li>)}</ul>}
          </div>
          {Object.values(errors).some(Boolean) && <p role="alert" className={errorClass}>Please check the highlighted fields.</p>}
          <Button type="submit" disabled className="h-12 rounded-full bg-button px-6 text-base text-button-foreground hover:bg-button-hover">Send request</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
