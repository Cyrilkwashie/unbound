import { InnerPage } from "@/components/InnerPage";

const CHANNELS = [
  {
    label: "EMAIL",
    value: "hello@unbound.studio",
    href: "mailto:hello@unbound.studio",
  },
  {
    label: "INSTAGRAM",
    value: "@unbound",
    href: "https://instagram.com/unbound",
  },
  {
    label: "TIKTOK",
    value: "@unbound",
    href: "https://www.tiktok.com/@unbound",
  },
] as const;

export default function ContactPage() {
  return (
    <InnerPage
      title="CONTACT"
      kicker="THE HOUSE"
      description="UNBOUND — email and socials."
    >
      <section className="border-t border-ivory/10 px-5 py-16 md:px-10 md:py-24">
        <p className="max-w-md font-serif text-2xl italic text-ivory md:text-3xl">
          Write. Follow. Stay close to the line.
        </p>

        <ul className="mt-20">
          {CHANNELS.map((channel) => (
            <li key={channel.label} className="border-t border-ivory/10 last:border-b">
              <a
                href={channel.href}
                target={channel.href.startsWith("http") ? "_blank" : undefined}
                rel={channel.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex flex-col gap-3 py-8 md:flex-row md:items-baseline md:justify-between md:py-10"
                data-cursor="VIEW"
              >
                <span className="text-[10px] tracking-[0.32em] text-mist">{channel.label}</span>
                <span className="font-display text-[clamp(1.6rem,4vw,3.2rem)] tracking-[0.08em] text-ivory transition-colors duration-500 group-hover:text-mist">
                  {channel.value}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </InnerPage>
  );
}
