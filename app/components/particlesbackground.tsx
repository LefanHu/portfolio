'use client'

import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import {
  type Container,
  type ISourceOptions,
  MoveDirection,
  OutMode,
} from "@tsparticles/engine";
// import { loadAll } from "@/tsparticles/all"; // if you are going to use `loadAll`, install the "@tsparticles/all" package too.
import { loadFull } from "tsparticles"; // if you are going to use `loadFull`, install the "tsparticles" package too.
// import { loadSlim } from "@tsparticles/slim"; // if you are going to use `loadSlim`, install the "@tsparticles/slim" package too.
// import { loadBasic } from "@tsparticles/basic"; // if you are going to use `loadBasic`, install the "@tsparticles/basic" package too.

export default function ParticlesBackground() {
  const [init, setInit] = useState(false);

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      await loadFull(engine);
    //   await loadSlim(engine);
      //await loadBasic(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const options: ISourceOptions = useMemo(
    () => ({
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 120,
      interactivity: {
        events: {
          onClick: {
            enable: true,
            mode: "push",
          },
          onHover: {
            enable: true,
            mode: "repulse",
          },
        },
        modes: {
          push: {
            quantity: 4,
          },
          repulse: {
            distance: 200,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: "#ffffff",
        },
        links: {
          color: "#ffffff",
          distance: 150,
          enable: true,
          opacity: 0.5,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "out",
          },
          random: false,
          speed: 6,
          straight: false,
        },
        number: {
          density: {
            enable: true,
          },
          value: 80,
        },
        opacity: {
          value: 0.5,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 5 },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (init) {
    return (
      <Particles
        id="tsparticles"
        particlesLoaded={particlesLoaded}
        options={options}
      />
    );
  }

  return <></>;
};

// let options = {
//     background: {
//         color: {
//             value: "#342718",
//         },
//         opacity: 0,
//     },
//     fpsLimit: 120,
//     fullScreen: {
//         enable: true,
//         zIndex: 1,
//     },
//     interactivity: {
//         detectsOn: "canvas",
//         events: {
//             onClick: {
//                 enable: true,
//                 mode: "bubble",
//             },
//             onHover: {
//                 enable: false,
//                 mode: "bubble",
//                 parallax: {
//                     enable: false,
//                     force: 60,
//                     smooth: 10,
//                 },
//             },
//             resize: {
//                 enable: true,
//                 delay: .5,
//             }
//         },
//         modes: {
//             push: {
//                 quantity: 4,
//             },
//             repulse: {
//                 distance: 200,
//                 duration: 0.4,
//             },
//             bubble: {
//                 distance: 100,
//                 duration: 10,
//                 opacity: .8,
//                 size: 15,
//             },
//             trail: {
//                 delay: 1,
//                 quantity: 1,
//             }
//         },
//     },
//     particles: {
//         color: {
//             value: "#fde68a",
//         },
//         links: {
//             color: "#ffffff",
//             distance: 150,
//             enable: false,
//             opacity: 0.5,
//             width: 0,
//         },
//         collisions: {
//             enable: false,
//         },
//         move: {
//             angle: {
//                 offset: 0,
//                 value: 25,
//             },
//             direction: "top",
//             enable: true,
//             outModes: {
//                 default: "out",
//             },
//             random: false,
//             speed: 1.5,
//             straight: false,
//         },
//         number: {
//             density: {
//                 enable: true,
//                 area: 1000,
//             },
//             value: 40,
//         },
//         opacity: {
//             random: {
//                 enable: true,
//                 minimumValue: .1,
//             },
//             value: 0.5,

//         },
//         shape: {
//             type: "circle",
//         },
//         size: {
//             value: { min: 1, max: 5 },
//         },
//         twinkle: {
//             particles: {
//                 enable: true,
//                 frequency: .5,
//                 opacity: 1
//             }
//         },
//         wobble: {
//             distance: 3,
//             enable: true,
//             speed: {
//                 angle: 50,
//                 move: 10,
//             }
//         }
//     },
//     detectRetina: true,
// }

// export default function ParticlesBackground() {
//     const init = useCallback(async (engine: Engine) => {
//         await loadAll(engine)
//     }, []);

//     return (
//         <Particles options={{options}}/>
//     );
// }