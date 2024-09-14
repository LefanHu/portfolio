"use client";

import Image from "next/image";
import styles from "./SlidingCards.module.css";
import { useState } from "react";

interface CardData {
  name: string;
  imgSrc: string;
  description: string;
}

export default function SlidingCards(props: { cards: CardData[] }) {
  const [checkedIndex, setCheckedIndex] = useState<number | null>(null);

  const handleMouseEnter = (index: number) => {
    setCheckedIndex(index);
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 p-5 flex flex-row justify-center items-center">
      <div className="h-[400px] flex flex-nowrap">
        {props.cards.map((card: CardData, index: number) => (
          <div key={index}>
            <input
              type="radio"
              name="slide"
              id={"c" + (index + 1)}
              className={styles.input}
              checked={checkedIndex === index}
              onChange={() => {}}
            />
            <label
              className={styles.card}
              htmlFor={"c" + (index + 1)}
              onMouseEnter={() => handleMouseEnter(index)}
            >
              <div className={styles.row}>
                <div className={styles.icon}>{index + 1}</div>
                <div className={styles.description}>
                  <h4 className={styles.h4}>{card.name}</h4>
                  <p>{card.description}</p>
                </div>
              </div>
              <Image
                src={card.imgSrc}
                alt={card.name}
                width={900}
                height={600}
                className="absolute object-cover h-full w-full z-[-1]"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
