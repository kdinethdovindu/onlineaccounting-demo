type PortalSubHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  accent: "blue" | "lime";
};

export default function PortalSubHero({
  eyebrow,
  title,
  description,
  accent,
}: PortalSubHeroProps) {
  const accentText = accent === "lime" ? "text-[#9ae22d]" : "text-[#2b67ff]";
  const accentLine = accent === "lime" ? "bg-[#9ae22d]" : "bg-[#2b67ff]";

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#08111d_0%,#10233a_55%,#13263e_100%)] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px] opacity-15" />

      <div className="relative mx-auto w-full max-w-[1400px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="max-w-4xl">
          <p className={`text-sm font-semibold tracking-[0.2em] ${accentText}`}>
            {eyebrow}
          </p>

          <h1 className="mt-4 text-4xl font-extrabold uppercase leading-tight sm:text-5xl">
            {title}
          </h1>

          <div className={`mt-5 h-1 w-28 rounded-full ${accentLine}`} />

          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/75 sm:text-base lg:text-lg">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}