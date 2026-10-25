import { interestImages, interests } from "@/lib/portfolio/interests";
import { WireImage } from "./parts";

export default function InterestsPanel() {
  return (
    <div className="ap-interests">
      <div className="ap-strip">
        {interestImages.map((img) => (
          <WireImage key={img.src} src={img.src} alt={img.alt} />
        ))}
      </div>
      <div className="ap-grid3">
        {interests.map((i) => (
          <section key={i.name} className="ap-card" data-wire="box">
            <h3 className="ap-card__title" data-wire="text">
              {i.name}
            </h3>
            <p className="ap-body" data-wire="text">
              {i.description}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
