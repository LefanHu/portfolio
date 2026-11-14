import ButtonLink from "@/components/ui/ButtonLink";
import CopyButton from "@/components/ui/CopyButton";
import Panel from "@/components/ui/Panel";
import SectionHeading from "@/components/ui/SectionHeading";
import { DocumentIcon, GitHubIcon, InstagramIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { contact } from "@/lib/portfolio/contact";
import { SITE_ANCHORS } from "@/lib/portfolioProjects";

/**
 * The page's closing section: the email address (to read, select, copy or
 * open in a mail client), then the other places to find the owner.
 */
export default function ContactForm() {
  return (
    <section id={SITE_ANCHORS.contact} aria-labelledby="contact-title">
      <SectionHeading section="contact" title="Contact" id="contact-title">
        Email is the best way to reach me, about a co-op role or anything on this site.
      </SectionHeading>

      <Panel className="mt-8 grid gap-x-10 gap-y-6 p-5 sm:mt-10 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="select-all wrap-anywhere font-display text-heading font-bold text-ink">{contact.email}</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <ButtonLink href={`mailto:${contact.email}`} variant="primary" icon={<MailIcon />}>
              Email me
            </ButtonLink>
            <CopyButton value={contact.email}>Copy address</CopyButton>
          </div>
        </div>

        {/* One column on the narrowest phones, two from 390px, a wrapping row from sm. */}
        <ul
          aria-label="Profiles and résumé"
          className="grid gap-3 border-t border-line pt-6 min-[390px]:grid-cols-2 sm:flex sm:flex-wrap lg:max-w-sm lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0"
        >
          <li>
            <ButtonLink href={contact.github} icon={<GitHubIcon />} className="w-full sm:w-auto">
              GitHub
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href={contact.linkedin} icon={<LinkedInIcon />} className="w-full sm:w-auto">
              LinkedIn
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href={contact.instagram} icon={<InstagramIcon />} className="w-full sm:w-auto">
              Instagram
            </ButtonLink>
          </li>
          <li>
            <ButtonLink href={contact.resumeHref} icon={<DocumentIcon />} newTab className="w-full sm:w-auto">
              Résumé (PDF)
            </ButtonLink>
          </li>
        </ul>
      </Panel>
    </section>
  );
}
