"use client";

import JSCanvas from "@/components/jsCanvas";
import { WindowIcon } from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface AdListEntry {
  title: string;
  description: string;
  file: string;
  icon: React.ElementType;
}

const jsList: AdListEntry[] = [
  {
    title: "balls.js",
    description: "A classic bouncing-ball canvas sketch with playful motion.",
    file: "balls.js",
    icon: WindowIcon,
  },
  {
    title: "hue_effect.js",
    description: "An animated color experiment that shifts hue over time.",
    file: "hue_effect.js",
    icon: WindowIcon,
  },
];

const defaultScript = jsList[0].file;

export default function JSPage() {
  const searchParams = useSearchParams();
  const [script, setScriptSrc] = useState(defaultScript);

  useEffect(() => {
    const requestedScript = searchParams.get("script");
    const isKnownScript = jsList.some((entry) => entry.file === requestedScript);

    setScriptSrc(isKnownScript && requestedScript ? requestedScript : defaultScript);
  }, [searchParams]);

  function changeScript(file: string) {
    return () => {
      setScriptSrc(file);
    }
  }

  const activeScript = jsList.find((entry) => entry.file === script) ?? jsList[0];

  return (
    <div className="p-8 grid grid-cols-4 bg-black flex-grow box-border max-h-full">
      <div className="col-span-1 h-full box-border">
        {/* <AdList className="flex-grow-1" entries={jsList} title="JS Experiments" /> */}
        <div className="flex h-full w-full flex-col items-center justify-center gap-y-2">
          <div className="w-full h-full rounded-xl border border-gray-200 bg-white py-4 px-2">
            <div className="flex items-center justify-between px-2 text-base font-medium text-gray-700">
              <div>JS Experiments</div>
            </div>
            <div className="mt-4">
              <div className="flex w-full flex-col">
                {jsList.map((entry) => (
                  <button
                    key={entry.file}
                    onClick={changeScript(entry.file)}
                    className={`group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 ${
                      script === entry.file ? "bg-green-100" : "hover:bg-green-100"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center rounded-lg text-black ${
                        script === entry.file
                          ? "bg-green-200"
                          : "bg-gray-200 group-hover:bg-green-200"
                      }`}
                    >
                      <span className="tag w-full text-center text-2xl font-medium text-gray-700 group-hover:text-green-900">
                        {React.createElement(entry.icon)}
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between font-light text-gray-600">
                      <p className="text-[15px]">{entry.title}</p>
                      <span className="text-xs font-light text-gray-400">{entry.description}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ml-8 col-span-3 rounded-xl border-white border-2 border-dashed box-border overflow-clip">
        <div className="border-b border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Running <span className="font-semibold text-white">{activeScript.title}</span>
        </div>
        <JSCanvas className="h-full w-full" scriptSrc={`/scripts/${script}`} />
      </div>
    </div>
  );
}
