"use client";

import { useToast as useToastUI } from "@/components/ui/use-toast";

// Re-export the useToast hook from shadcn/ui
export const useToast = useToastUI;

// Export the hook as default for easier imports
export default useToast;
