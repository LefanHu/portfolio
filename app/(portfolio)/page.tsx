import ContactForm from "@/components/ContactForm";
import Experiences from "@/components/portfolio/PortfolioExperiences";
import Hero from "@/components/portfolio/Hero";
import HomeDeferredSections from "@/components/portfolio/HomeDeferredSections";
import FavProjects from "@/components/portfolio/PortfolioProjects";
import Constellation from "@/components/site/Constellation";
import { CONTAINER, SECTION_GAP } from "@/components/ui/layout";

export default function Home() {
  return (
    <>
      <Constellation />
      <div className={`${CONTAINER} ${SECTION_GAP}`}>
        <Hero />
        <FavProjects />
        <Experiences />
        <HomeDeferredSections />
        <ContactForm />
      </div>
    </>
  );
}
