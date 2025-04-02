import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

interface AvatarProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
	className?: string;
}

interface AvatarImageProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
	className?: string;
}

interface AvatarFallbackProps
	extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
	className?: string;
	initials?: string;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
	({ className, ...props }, ref) => (
		<AvatarPrimitive.Root
			ref={ref}
			className={cn(
				"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-background",
				className
			)}
			{...props}
		/>
	)
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
	({ className, ...props }, ref) => (
		<AvatarPrimitive.Image
			ref={ref}
			className={cn("aspect-square h-full w-full object-cover", className)}
			{...props}
		/>
	)
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
	({ className, initials, ...props }, ref) => (
		<AvatarPrimitive.Fallback
			ref={ref}
			className={cn(
				"flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-sm font-medium text-primary",
				className
			)}
			{...props}
		>
			{initials}
		</AvatarPrimitive.Fallback>
	)
);
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
