"use client";

import Image from "next/image";
import { useTheme } from "@/components/ThemeProvider";
import type { ThemeImages } from "@/lib/themes";
import type { ComponentProps } from "react";

type ImageProps = Omit<ComponentProps<typeof Image>, "src">;

interface ThemedImageProps extends ImageProps {
  imageKey: keyof ThemeImages;
}

export function ThemedImage({ imageKey, alt, ...props }: ThemedImageProps) {
  const { theme } = useTheme();
  return <Image src={theme.images[imageKey]} alt={alt} unoptimized suppressHydrationWarning {...props} />;
}
