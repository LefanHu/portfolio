import RunawayButton from "@/components/runawayButton";
import Link from "next/link";

export default function SwiftGallery() {
  return (
    <div>
      <div className="text-black">easter egg! hehe</div>
      <div className="text-black">
        {/* spiritually... i&apos;ll always be the first to wish you a happy
        birthday */}
        update: happy birthday!
      </div>
      {/* <p className="text-black">(p.s. i finished it)</p> */}

      <div className=" relative">
        <div>
          <Link
            className="text-blue-500 underline"
            href="/silly-goose/sneak-attac"
          >
            sneak attac!!!
          </Link>
        </div>
        <div>
          <Link
            className="text-blue-500 underline"
            href={process.env.NEXT_PUBLIC_SNEAK_ATTAC_2!}
          >
            sneak attac again!!!
          </Link>
        </div>
      </div>
      <RunawayButton href="/silly-goose/happy-birthday" />
    </div>
  );
}
