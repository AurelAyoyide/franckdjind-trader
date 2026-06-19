/* eslint-disable @next/next/no-img-element -- External images bypass the Next optimizer unless their host is allowlisted. */
import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type SafeImageProps = ImageProps;

function isExternalImage(src: ImageProps["src"]): src is string {
  return typeof src === "string" && /^https:\/\//i.test(src);
}

export function SafeImage({ src, alt, className, fill, priority, ...props }: SafeImageProps) {
  if (isExternalImage(src)) {
    const loading = priority ? "eager" : "lazy";

    if (fill) {
      return (
        <img
          alt={alt}
          className={cn("absolute inset-0 h-full w-full", className)}
          loading={loading}
          src={src}
        />
      );
    }

    return (
      <img
        alt={alt}
        className={className}
        height={typeof props.height === "number" ? props.height : undefined}
        loading={loading}
        src={src}
        width={typeof props.width === "number" ? props.width : undefined}
      />
    );
  }

  return <Image alt={alt} className={className} fill={fill} priority={priority} src={src} {...props} />;
}
