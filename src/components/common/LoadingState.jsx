import React from "react";
import { Loader2 } from "lucide-react";

export default function LoadingState({ message = "Loading campus events..." }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
    </div>
  );
}
