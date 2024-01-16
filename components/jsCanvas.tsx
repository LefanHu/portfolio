'use client'

import { useEffect, useRef } from 'react';
import Script from 'next/script.js';

interface JSCanvasProps {
    scriptSrc: string
    className?: string
}

export default function JSCanvas(props: JSCanvasProps) {
    // const canvasRef = useRef<HTMLCanvasElement>(null);

    // useEffect(() => {
    //     import(props.scriptSrc).then((script) => {
    //         if (canvasRef.current) {
    //             script.initialize();
    //         }
    //     });
    // }, [props.scriptSrc]);

    return (
        <div id="canvasContainer" className={props.className}>
            <canvas id="jsCanvas" />
            <Script id="canvasScript" src='/scripts/balls.js' strategy='lazyOnload' />
        </div>
    )
}