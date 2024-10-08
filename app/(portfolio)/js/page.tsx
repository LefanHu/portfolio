'use client'

import JSCanvas from "@/components/jsCanvas";
import { WindowIcon } from "@heroicons/react/24/outline";
import React, { RefObject, useEffect, useRef, useState } from "react";

interface AdListEntry {
  title: string,
  description: string,
  icon: React.ElementType
}

const jsList: AdListEntry[] = [
  {
    title: "balls.js",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "hue_effect.js",
    description: "some description",
    icon: WindowIcon
  },
  {
    title: "experiment #3",
    description: "some description",
    icon: WindowIcon
  },
]

export default function JSPage() {
  const [script, setScriptSrc] = useState("ball.js");
  const canvasComponentRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

  function changeScript(buttonLabel: string) {
    return (event: React.MouseEvent) => {
      setScriptSrc(buttonLabel)
      console.log(buttonLabel)
    }
  }

  useEffect(
    () => {
      canvasComponentRef.current?.remove();
    }, [script]
  );

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
                  <button key={entry.title} onClick={changeScript(entry.title)} className="group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 hover:bg-green-100">
                    <div className="flex h-12 w-12 items-center rounded-lg bg-gray-200 text-black group-hover:bg-green-200">
                      <span className="tag w-full text-center text-2xl font-medium text-gray-700 group-hover:text-green-900">
                        <entry.icon />
                      </span>
                    </div>
                    <div className="flex flex-col items-start justify-between font-light text-gray-600">
                      <p className="text-[15px]">{entry.title}</p>
                      <span className="text-xs font-light text-gray-400">{entry.description}</span>
                    </div>
                  </button>
                ))}
                <h3 className="my-2 px-4 text-[15px] text-gray-400">More</h3>
                <button className="group flex items-center gap-x-5 rounded-md px-2.5 py-2 transition-all duration-75 hover:bg-green-100">
                  <div className="flex h-12 w-12 items-center rounded-lg bg-gray-200 text-black group-hover:bg-green-200">
                    <span className="tag w-full text-center text-xl font-medium text-gray-700 group-hover:text-green-900">
                      {/* <svg className="mx-auto h-6 w-6" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg> */}
                    </span>
                  </div>
                  <div className="flex flex-col items-start justify-between font-light text-gray-600">
                    <p className="text-[15px]">Bullet list</p>
                    <span className="text-xs font-light text-gray-400">Create a simple bullet list</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ml-8 col-span-3 rounded-xl border-white border-2 border-dashed box-border overflow-clip">
        <JSCanvas ref={canvasComponentRef} className="w-full h-full" scriptSrc={`/scripts/${script}`} />
      </div>
    </div>
  )
}
