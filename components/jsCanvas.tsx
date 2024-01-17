'use client'

import { RefObject, useEffect, useRef } from 'react';
import Script from 'next/script.js';

interface JSCanvasProps {
    scriptSrc: string
    className?: string
    ref?: RefObject<HTMLDivElement>
}

export default function JSCanvas(props: JSCanvasProps) {
    const canvasContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Function to create and append the script
        const loadScript = () => {
            if (!canvasContainerRef.current) return;

            // Clear existing script if it exists
            const existingScript = canvasContainerRef.current.querySelector('script');
            if (existingScript) {
                existingScript.remove();
            }

            // Create a new script element
            const script = document.createElement('script');
            script.src = props.scriptSrc;
            script.async = true;
            script.onload = () => {
                console.log(`Script loaded: ${props.scriptSrc}`);
                // You can put any code here that needs to run after the script is loaded
            };

            // Append the script to the container
            canvasContainerRef.current.appendChild(script);
        };

        loadScript();

        // Cleanup function to remove the script when the component unmounts or before the next script loads
        return () => {
            if (!canvasContainerRef.current) return;

            const existingScript = canvasContainerRef.current.querySelector('script');
            if (existingScript) {
                existingScript.remove();
            }
        };
    }, [props.scriptSrc]);

    return (
        <div ref={props.ref} id="canvasContainer" className={props.className}>
            <canvas id="jsCanvas" />
            <script id="canvasScript" />
            {/* <Script id="canvasScript" src={props.scriptSrc} strategy='lazyOnload' /> */}
        </div>
    )
}