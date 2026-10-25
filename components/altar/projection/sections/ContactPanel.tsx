import { about } from "@/lib/portfolio/about";
import { contact } from "@/lib/portfolio/contact";
import { Label, linkTarget } from "./parts";

const strip = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

const LINKS = [
  { name: "GitHub", href: contact.github, detail: strip(contact.github) },
  { name: "LinkedIn", href: contact.linkedin, detail: strip(contact.linkedin) },
];

export default function ContactPanel() {
  return (
    <div className="ap-contact">
      <section className="ap-card ap-contact__main" data-wire="box">
        <Label>Email</Label>
        <a className="ap-email" href={`mailto:${contact.email}`} data-wire="text">
          {contact.email}
        </a>
        <p className="ap-lead" data-wire="text">
          {about.coop}
        </p>
        <a className="ap-btn" href={contact.resumeHref} {...linkTarget(contact.resumeHref)} data-wire="box">
          Resume (PDF) ↗
        </a>
      </section>
      <div className="ap-contact__links">
        {LINKS.map((l) => (
          <a key={l.name} className="ap-card ap-linkrow" href={l.href} {...linkTarget(l.href)} data-wire="box">
            <span className="ap-card__title" data-wire="text">
              {l.name}
            </span>
            <span className="ap-meta" data-wire="text">
              {l.detail} ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
