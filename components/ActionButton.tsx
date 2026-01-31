"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

interface ActionButtonProps {
  label: string;
  message?: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  onClick?: () => void;
}

export default function ActionButton({
  label,
  message,
  variant = "primary",
  className,
  onClick
}: ActionButtonProps) {
  const [notice, setNotice] = useState<string | null>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    if (message) {
      setNotice(message);
      window.setTimeout(() => setNotice(null), 2400);
    }
  };

  return (
    <div className={className}>
      <Button variant={variant} onClick={handleClick}>
        {label}
      </Button>
      {notice ? <p className="mt-2 text-xs text-mint-600 dark:text-mint-300">{notice}</p> : null}
    </div>
  );
}
