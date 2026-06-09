"use client";

import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import type { ThemeImages } from "@/lib/themes";
import type { ComponentProps } from "react";
import { useState, useEffect } from "react";

type ImageProps = Omit<ComponentProps<typeof Image>, "src">;

interface ThemedImageProps extends ImageProps {
  imageKey: keyof ThemeImages;
}

export function ThemedImage({ imageKey, alt, ...props }: ThemedImageProps) {
  const { theme, ready } = useTheme();
  const [displaySrc, setDisplaySrc] = useState("/images/transparent.png");

  useEffect(() => {
    if (!ready) return;
    const target = theme.images[imageKey];
    const img = new window.Image();
    img.onload = () => setDisplaySrc(target);
    img.src = target;
    return () => { img.onload = null; };
  }, [theme, imageKey, ready]);

  return <Image src={displaySrc} alt={alt} unoptimized {...props} />;
}
