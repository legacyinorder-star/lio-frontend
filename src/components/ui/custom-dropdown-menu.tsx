import React, { ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
	children: ReactNode;
	align?: "start" | "end";
	className?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

interface DropdownMenuContentProps {
	children: ReactNode;
	className?: string;
	align?: "start" | "end";
	id?: string;
}

interface DropdownMenuItemProps {
	children: ReactNode;
	className?: string;
	onSelect?: (e: React.MouseEvent) => void;
	asChild?: boolean;
}

interface DropdownMenuLabelProps {
	children: ReactNode;
	className?: string;
}

interface DropdownMenuSeparatorProps {
	className?: string;
}

export function DropdownMenu({
	children,
	align = "start",
	className,
	open,
	onOpenChange,
}: DropdownMenuProps) {
	const [internalIsOpen, setInternalIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLDivElement>(null);

	// Use external open prop if provided, otherwise use internal state
	const isOpen = open !== undefined ? open : internalIsOpen;

	// Find the trigger element from children
	const childrenArray = React.Children.toArray(children);
	const trigger = childrenArray[0];
	const content = childrenArray[1];

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node) &&
				triggerRef.current &&
				!triggerRef.current.contains(event.target as Node)
			) {
				if (open !== undefined) {
					onOpenChange?.(false);
				} else {
					setInternalIsOpen(false);
					onOpenChange?.(false);
				}
			}
		};

		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				if (open !== undefined) {
					onOpenChange?.(false);
				} else {
					setInternalIsOpen(false);
					onOpenChange?.(false);
				}
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onOpenChange, open]);

	const handleTriggerClick = () => {
		const newIsOpen = !isOpen;
		if (open !== undefined) {
			onOpenChange?.(newIsOpen);
		} else {
			setInternalIsOpen(newIsOpen);
			onOpenChange?.(newIsOpen);
		}
	};

	return (
		<div className={cn("relative inline-block", className)}>
			<div
				ref={triggerRef}
				onClick={handleTriggerClick}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleTriggerClick();
					}
				}}
				aria-expanded={isOpen}
				aria-haspopup="true"
			>
				{trigger}
			</div>
			{isOpen && (
				<div
					ref={dropdownRef}
					className={cn(
						"absolute z-50 min-w-[8rem] rounded-md border bg-white p-1 shadow-md",
						align === "end" ? "right-0" : "left-0",
						"mt-1"
					)}
					role="menu"
					aria-orientation="vertical"
				>
					{content}
				</div>
			)}
		</div>
	);
}

export function DropdownMenuContent({
	children,
	className,
	id,
}: DropdownMenuContentProps) {
	return (
		<div
			id={id}
			className={cn(
				"w-56 bg-white border border-[#ECECEC] shadow-md rounded-md",
				className
			)}
		>
			{children}
		</div>
	);
}

export function DropdownMenuItem({
	children,
	className,
	onSelect,
	asChild,
}: DropdownMenuItemProps) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		onSelect?.(e);
	};

	if (asChild) {
		return (
			<div
				className={cn(
					"relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]",
					className
				)}
				onClick={handleClick}
				role="menuitem"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						handleClick(e as unknown as React.MouseEvent);
					}
				}}
			>
				{children}
			</div>
		);
	}

	return (
		<button
			className={cn(
				"relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#F5F5F5] focus:bg-[#F5F5F5]",
				className
			)}
			onClick={handleClick}
			role="menuitem"
		>
			{children}
		</button>
	);
}

export function DropdownMenuLabel({
	children,
	className,
}: DropdownMenuLabelProps) {
	return (
		<div
			className={cn("px-2 py-1.5 text-sm font-medium", className)}
			role="menuitem"
		>
			{children}
		</div>
	);
}

export function DropdownMenuSeparator({
	className,
}: DropdownMenuSeparatorProps) {
	return (
		<div className={cn("my-1 h-px bg-[#ECECEC]", className)} role="separator" />
	);
}
