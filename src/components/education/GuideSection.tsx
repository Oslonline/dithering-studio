"use client";

type GuideBlock = {
  title: string;
  paragraphs: string[];
};

export default function GuideSection({
  kicker,
  title,
  lead,
  blocks,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  blocks: GuideBlock[];
  children?: React.ReactNode;
}) {
  return (
    <article className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500">{kicker}</p>
        <h1 className="font-anton text-3xl tracking-tight text-gray-100 sm:text-4xl">{title}</h1>
        {lead ? <p className="max-w-2xl text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">{lead}</p> : null}
      </header>

      <div className="space-y-8">
        {blocks.map((block) => (
          <div key={block.title} className="space-y-3">
            <h2 className="text-[13px] font-medium tracking-wide text-gray-200 sm:text-[14px]">{block.title}</h2>
            {block.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="max-w-2xl text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
                {paragraph}
              </p>
            ))}
          </div>
        ))}
      </div>

      {children}
    </article>
  );
}
