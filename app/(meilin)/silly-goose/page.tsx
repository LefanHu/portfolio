import RunawayButton from "@/components/runawayButton";
import Link from "next/link";

export default function SwiftGallery() {
  return (
    <div>
      <div className="text-black">easter egg! hehe</div>
      <div className="text-black">
        spiritually... i&apos;ll always be the first to wish you a happy birthday
      </div>
      <p>(p.s. i finished it)</p>

      <Link className="text-blue-500 underline" href="/silly-goose/sneak-attac">
        sneak attac!!!
      </Link>
      <RunawayButton href="/silly-goose/happy-birthday" />
    </div>
  );
}
