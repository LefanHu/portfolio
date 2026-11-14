import Link from "next/link";
import { about } from "@/lib/portfolio/about";
import { contact } from "@/lib/portfolio/contact";
import { CONTAINER } from "@/components/ui/layout";

const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-body underline decoration-line-strong hover:text-rune hover:decoration-rune";

export default function SiteFooter() {
  return (
    <footer data-site-footer className="mt-24 border-t border-line">
      <div className={`${CONTAINER} flex flex-col gap-6 py-10 text-sm sm:flex-row sm:items-end sm:justify-between`}>
        <div>
          <p className="font-display text-xl font-extrabold text-ink">{about.name}</p>
          <p className="mt-1 text-mute">
            Computer Engineering, {about.education.school}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-6">
            <li>
              <a className={linkClass} href={`mailto:${contact.email}`}>
                Email
              </a>
            </li>
            <li>
              <a className={linkClass} href={contact.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a className={linkClass} href={contact.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <Link className={linkClass} href="/project-gallery">
                All projects
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/js">
                Playground
              </Link>
            </li>
            <li>
              <Link className={linkClass} href="/altar">
                3D altar
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
