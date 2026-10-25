"use client";
import { RequestConfirmation } from "@/components/request-confirmation";
import { useRouter } from "next/navigation";
export default function Preview() { const router = useRouter(); return <div className="mx-auto max-w-2xl"><RequestConfirmation onContinue={() => router.push("/")} /></div>; }
