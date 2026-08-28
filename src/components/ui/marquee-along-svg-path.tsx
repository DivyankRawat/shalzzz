"use client";

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

import { cn } from "@/lib/utils";

type PreserveAspectRatio =
  | "none"
  | "xMinYMin"
  | "xMidYMin"
  | "xMaxYMin"
  | "xMinYMid"
  | "xMidYMid"
  | "xMaxYMid"
  | "xMinYMax"
  | "xMidYMax"
  | "xMaxYMax";

type PreserveAspectRatioAlign =
  | PreserveAspectRatio
  | `${Exclude<PreserveAspectRatio, "none">} ${"meet" | "slice"}`;

export type MarqueeAlongSvgPathProps = {
  children: React.ReactNode;
  className?: string;
  /** The `d` attribute of the path the items ride along. */
  path: string;
  pathId?: string;
  preserveAspectRatio?: PreserveAspectRatioAlign;
  showPath?: boolean;
  width?: string;
  height?: string;
  viewBox?: string;
  baseVelocity?: number;
  direction?: "normal" | "reverse";
  easing?: (t: number) => number;
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
  slowDownSpringConfig?: SpringOptions;
  useScrollVelocity?: boolean;
  scrollAwareDirection?: boolean;
  scrollSpringConfig?: SpringOptions;
  scrollContainer?: React.RefObject<HTMLElement | null>;
  repeat?: number;
  draggable?: boolean;
  dragSensitivity?: number;
  dragVelocityDecay?: number;
  dragAwareDirection?: boolean;
  grabCursor?: boolean;
  enableRollingZIndex?: boolean;
  zIndexBase?: number;
  zIndexRange?: number;
  cssVariableInterpolation?: { property: string; from: number | string; to: number | string }[];
  /** Scale the whole path down to the container width instead of letting the SVG stretch. */
  responsive?: boolean;
};

const wrap = (min: number, max: number, value: number) => {
  const range = max - min;
  return (((value - min) % range) + range) % range + min;
};

type Item = {
  child: React.ReactNode;
  childIndex: number;
  repeatIndex: number;
  itemIndex: number;
  key: string;
};

export default function MarqueeAlongSvgPath({
  children,
  className,
  path,
  pathId,
  preserveAspectRatio = "xMidYMid meet",
  showPath = false,
  width = "100%",
  height = "100%",
  viewBox = "0 0 100 100",
  baseVelocity = 5,
  direction = "normal",
  easing,
  slowdownOnHover = false,
  slowDownFactor = 0.3,
  slowDownSpringConfig = { damping: 50, stiffness: 400 },
  useScrollVelocity: enableScrollVelocity = false,
  scrollAwareDirection = false,
  scrollSpringConfig = { damping: 50, stiffness: 400 },
  scrollContainer,
  repeat = 3,
  draggable = false,
  dragSensitivity = 0.2,
  dragVelocityDecay = 0.96,
  dragAwareDirection = false,
  grabCursor = false,
  enableRollingZIndex = true,
  zIndexBase = 1,
  zIndexRange = 10,
  cssVariableInterpolation = [],
  responsive = false,
}: MarqueeAlongSvgPathProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const baseOffset = useMotionValue(0);

  // In responsive mode the SVG keeps its authored pixel size and the whole
  // group is scaled to the container instead — scaling the viewBox would let
  // the riding items stretch out of proportion with the path.
  useEffect(() => {
    if (!responsive) return;
    const [, , vbW, vbH] = viewBox.split(" ").map(Number);
    const pathWidth = vbW || 100;
    const pathHeight = vbH || 100;

    const resize = () => {
      const container = containerRef.current;
      const inner = innerRef.current;
      if (!container || !inner) return;
      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const scale = cw / pathWidth;
      inner.style.width = `${pathWidth}px`;
      inner.style.height = `${pathHeight}px`;
      inner.style.transform = `translate(0px, ${(ch - pathHeight * scale) / 2}px) scale(${scale})`;
      inner.style.transformOrigin = "top left";
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [responsive, viewBox]);

  const items: Item[] = useMemo(() => {
    const childArray = React.Children.toArray(children);
    if (!childArray.length) return [];
    // Frames are spread evenly over the whole path, so the number riding it is
    // what sets the gap between them - no margin on a frame can do that.
    // Fractional repeats are therefore allowed, to land on a spacing that whole
    // copies of the set would overshoot.
    const total = Math.max(1, Math.round(childArray.length * repeat));
    return Array.from({ length: total }, (_, itemIndex) => {
      const childIndex = itemIndex % childArray.length;
      const repeatIndex = Math.floor(itemIndex / childArray.length);
      return {
        child: childArray[childIndex],
        childIndex,
        repeatIndex,
        itemIndex,
        key: `${childIndex}-${repeatIndex}`,
      };
    });
  }, [children, repeat]);

  const getZIndex = useCallback(
    (progress: number) =>
      enableRollingZIndex
        ? Math.floor(zIndexBase + (progress / 100) * zIndexRange)
        : undefined,
    [enableRollingZIndex, zIndexBase, zIndexRange],
  );

  const generatedId = useId();
  const resolvedPathId = pathId || `marquee-path-${generatedId.replace(/:/g, "")}`;

  const { scrollY } = useScroll({ container: scrollContainer || containerRef });
  const scrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(scrollVelocity, scrollSpringConfig);

  const hoveringRef = useRef(false);
  const draggingRef = useRef(false);
  const dragVelocityRef = useRef(0);
  const directionRef = useRef(direction === "normal" ? 1 : -1);

  const hoverTarget = useMotionValue(1);
  const idleVelocity = useMotionValue(1);
  const hoverFactor = useSpring(hoverTarget, slowDownSpringConfig);
  const velocityFactor = useTransform(
    enableScrollVelocity ? smoothScrollVelocity : idleVelocity,
    [0, 1000],
    [0, 5],
    { clamp: false },
  );

  // Off-screen marquees do nothing: no point burning a rAF advancing a path
  // nobody is looking at.
  const inViewRef = useRef(true);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_t, delta) => {
    if (!inViewRef.current) return;

    // While a drag is live the pointer is the only thing moving the belt;
    // the flywheel afterwards is handled below.
    if (draggingRef.current && draggable) {
      baseOffset.set(baseOffset.get() + dragVelocityRef.current);
      dragVelocityRef.current *= 0.9;
      if (Math.abs(dragVelocityRef.current) < 0.01) dragVelocityRef.current = 0;
      return;
    }

    hoverTarget.set(hoveringRef.current ? (slowdownOnHover ? slowDownFactor : 1) : 1);

    let moveBy = directionRef.current * baseVelocity * (delta / 1000) * hoverFactor.get();

    if (scrollAwareDirection && !draggingRef.current) {
      if (velocityFactor.get() < 0) directionRef.current = -1;
      else if (velocityFactor.get() > 0) directionRef.current = 1;
    }

    moveBy += directionRef.current * moveBy * velocityFactor.get();

    if (draggable) {
      moveBy += dragVelocityRef.current;
      if (dragAwareDirection && Math.abs(dragVelocityRef.current) > 0.1) {
        directionRef.current = Math.sign(dragVelocityRef.current);
      }
      if (!draggingRef.current && Math.abs(dragVelocityRef.current) > 0.01) {
        dragVelocityRef.current *= dragVelocityDecay;
      } else if (!draggingRef.current) {
        dragVelocityRef.current = 0;
      }
    }

    baseOffset.set(baseOffset.get() + moveBy);
  });

  const lastPointerRef = useRef({ x: 0, y: 0 });

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (grabCursor) e.currentTarget.style.cursor = "grabbing";
    draggingRef.current = true;
    lastPointerRef.current = { x: e.clientX, y: e.clientY };
    dragVelocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable || !draggingRef.current) return;
    const point = { x: e.clientX, y: e.clientY };
    const dx = point.x - lastPointerRef.current.x;
    const dy = point.y - lastPointerRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    dragVelocityRef.current = (dx > 0 ? distance : -distance) * dragSensitivity;
    lastPointerRef.current = point;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    draggingRef.current = false;
    if (grabCursor) e.currentTarget.style.cursor = "grab";
  };

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={cn("relative", className)}
    >
      <div ref={innerRef} className="relative" style={{ contain: "layout style" }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={width}
          height={height}
          viewBox={viewBox}
          preserveAspectRatio={preserveAspectRatio}
          className="w-full h-full"
        >
          <path
            id={resolvedPathId}
            d={path}
            stroke={showPath ? "currentColor" : "none"}
            fill="none"
            ref={pathRef}
          />
        </svg>

        {items.map((item) => (
          <MarqueeItem
            key={item.key}
            item={item}
            total={items.length}
            baseOffset={baseOffset}
            path={path}
            easing={easing}
            getZIndex={getZIndex}
            cssVariableInterpolation={cssVariableInterpolation}
            draggable={draggable}
            grabCursor={grabCursor}
            onHoverChange={(hovering) => {
              hoveringRef.current = hovering;
            }}
          />
        ))}
      </div>
    </div>
  );
}

function MarqueeItem({
  item,
  total,
  baseOffset,
  path,
  easing,
  getZIndex,
  cssVariableInterpolation,
  draggable,
  grabCursor,
  onHoverChange,
}: {
  item: Item;
  total: number;
  baseOffset: MotionValue<number>;
  path: string;
  easing?: (t: number) => number;
  getZIndex: (progress: number) => number | undefined;
  cssVariableInterpolation: { property: string; from: number | string; to: number | string }[];
  draggable: boolean;
  grabCursor: boolean;
  onHoverChange: (hovering: boolean) => void;
}) {
  // Each copy sits an even fraction of the path ahead of the previous one, and
  // wraps back to 0% at the end so the belt is seamless.
  const offsetDistance = useTransform(baseOffset, (v) => {
    const wrapped = wrap(0, 100, v + (item.itemIndex * 100) / total);
    return `${easing ? easing(wrapped / 100) * 100 : wrapped}%`;
  });

  const progress = useMotionValue(0);
  const zIndex = useTransform(progress, (v) => getZIndex(v));

  useEffect(
    () =>
      offsetDistance.on("change", (v) => {
        const match = v.match(/^([\d.]+)%$/);
        if (match && match[1]) progress.set(parseFloat(match[1]));
      }),
    [offsetDistance, progress],
  );

  const cssVars = useCssVariableInterpolation(progress, cssVariableInterpolation);

  return (
    <motion.div
      className={cn("absolute top-0 left-0", draggable && grabCursor && "cursor-grab")}
      style={{
        offsetPath: `path('${path}')`,
        offsetDistance,
        zIndex,
        willChange: "offset-distance",
        backfaceVisibility: "hidden",
        ...cssVars,
      }}
      aria-hidden={item.repeatIndex > 0}
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
    >
      {item.child}
    </motion.div>
  );
}

/**
 * Interpolated CSS custom properties, keyed by name. The list is fixed for the
 * lifetime of a marquee, so the transforms are built once and reused.
 */
function useCssVariableInterpolation(
  progress: MotionValue<number>,
  variables: { property: string; from: number | string; to: number | string }[],
) {
  const [frozen] = useState(() => variables);
  const values = frozen.map((v) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useTransform(progress, [0, 100], [v.from, v.to]),
  );
  return Object.fromEntries(frozen.map((v, i) => [v.property, values[i]])) as Record<
    string,
    MotionValue<number | string>
  >;
}
