import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import {
  generateHreflangTags,
  getCanonicalUrlWithLang,
  getOgUrl,
  getSocialImageUrl,
} from "../../utils/seo";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

const EDUCATION_PRACTICE_PATH = "/Education/Practice";

const EducationPractice: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  const pageTitle = t("education.practice.seo.title", {
    defaultValue: "Dithering Practice | Settings, Artifacts, and Quick Recipes",
  });
  const pageDescription = t("education.practice.seo.description", {
    defaultValue:
      "Practical dithering tips: a step-by-step workflow, how each setting affects the result, and how to fix common dithering artifacts in images.",
  });

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl(EDUCATION_PRACTICE_PATH, i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={i18n.language} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={getSocialImageUrl()} />

        <link
          rel="canonical"
          href={getCanonicalUrlWithLang(EDUCATION_PRACTICE_PATH, i18n.language)}
        />
        {generateHreflangTags(EDUCATION_PRACTICE_PATH)}
      </Helmet>

      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header page="education" />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-6 py-12">
            <header className="space-y-4">
              <h1 className="font-anton text-3xl leading-tight text-gray-100">
                {t("education.practice.title", { defaultValue: "Practice" })}
              </h1>
              <p className="text-[12px] leading-relaxed text-gray-400">
                {t("education.practice.lead", {
                  defaultValue:
                    "A practical workflow for image dithering: pick an algorithm, tune the controls, fix artifacts, and export clean results.",
                })}
              </p>
            </header>

            <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            <section className="space-y-10">
              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.practice.workflow.title", { defaultValue: "A simple 3-step workflow" })}
                </h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.practice.workflow.lead", {
                    defaultValue:
                      "If you’re unsure where to start, this flow gets consistent results fast. It also maps directly to the settings you see in the Image tool.",
                  })}
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <p className="font-mono text-[10px] tracking-wide text-gray-500">
                      {t("education.practice.workflow.step1.kicker", { defaultValue: "Step 1" })}
                    </p>
                    <h3 className="mt-1 text-[12px] text-gray-200">
                      <strong className="font-semibold">
                        {t("education.practice.workflow.step1.title", { defaultValue: "Choose the algorithm family" })}
                      </strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.practice.workflow.step1.body", {
                        defaultValue:
                          "For photos/gradients, start with error diffusion (Floyd–Steinberg, Sierra variants). For pixel art and clean structure, start with ordered dithering (Bayer matrices, blue noise).",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <p className="font-mono text-[10px] tracking-wide text-gray-500">
                      {t("education.practice.workflow.step2.kicker", { defaultValue: "Step 2" })}
                    </p>
                    <h3 className="mt-1 text-[12px] text-gray-200">
                      <strong className="font-semibold">
                        {t("education.practice.workflow.step2.title", { defaultValue: "Get tone and scale right" })}
                      </strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.practice.workflow.step2.body", {
                        defaultValue:
                          "Set working resolution for speed vs detail, then adjust contrast/gamma/highlights (and optional blur) so your midtones and edges behave well before dithering.",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <p className="font-mono text-[10px] tracking-wide text-gray-500">
                      {t("education.practice.workflow.step3.kicker", { defaultValue: "Step 3" })}
                    </p>
                    <h3 className="mt-1 text-[12px] text-gray-200">
                      <strong className="font-semibold">
                        {t("education.practice.workflow.step3.title", { defaultValue: "Tune settings + export" })}
                      </strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.practice.workflow.step3.body", {
                        defaultValue:
                          "Adjust threshold/invert, serpentine options (for diffusion), palette choices, and any algorithm-specific settings. When it looks right, export at original resolution.",
                      })}
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.practice.recipes.title", { defaultValue: "Quick recipes" })}
                </h2>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] text-gray-200">
                      <strong className="font-semibold">
                        {t("education.practice.recipes.photo.title", {
                          defaultValue: "Photos (natural texture)",
                        })}
                      </strong>
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>
                        {t("education.practice.recipes.photo.li1", {
                          defaultValue:
                            "Start with Floyd–Steinberg or a Sierra variant, then tweak threshold.",
                        })}
                      </li>
                      <li>
                        {t("education.practice.recipes.photo.li2", {
                          defaultValue:
                            "Enable serpentine if you see diagonal directional artifacts.",
                        })}
                      </li>
                      <li>
                        {t("education.practice.recipes.photo.li3", {
                          defaultValue:
                            "Use a small palette (4–16) for stylization; keep it bigger for smoother tones.",
                        })}
                      </li>
                      <li>
                        {t("education.practice.recipes.photo.li4", {
                          defaultValue:
                            "If shadows look noisy, reduce contrast, adjust midtones (gamma), or add a tiny blur before dithering.",
                        })}
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] text-gray-200">
                      <strong className="font-semibold">
                        {t("education.practice.recipes.pixel.title", {
                          defaultValue: "Pixel art / icons (clean structure)",
                        })}
                      </strong>
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>
                        {t("education.practice.recipes.pixel.li1", {
                          defaultValue:
                            "Try ordered dithering (Bayer 4×4 or 8×8) for predictable patterns.",
                        })}
                      </li>
                      <li>
                        {t("education.practice.recipes.pixel.li2", {
                          defaultValue:
                            "Keep palettes tight (2–8 colors) and tune threshold to control the pattern density.",
                        })}
                      </li>
                      <li>
                        {t("education.practice.recipes.pixel.li3", {
                          defaultValue:
                            "If you see repeating tiles, switch matrix size (4×4 → 8×8 → 16×16).",
                        })}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.practice.controls.title", { defaultValue: "What the main controls do" })}
                </h2>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                  <p className="text-[12px] leading-relaxed text-gray-400">
                    {t("education.practice.controls.lead", {
                      defaultValue:
                        "This list reflects the Image tool controls. Some controls appear only for specific algorithms (for example ASCII ramp or Custom Kernel).",
                    })}
                  </p>

                  <div className="mt-4 grid gap-3 text-[12px] leading-relaxed text-gray-400 md:grid-cols-2">
                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.algorithm", { defaultValue: "Algorithm" })}
                        </strong>
                        {t("education.practice.controls.algorithmTail", {
                          defaultValue:
                            ": chooses the dithering method (error diffusion, ordered/Bayer, blue noise, etc.). This changes texture, artifacts, and performance.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.strong.threshold", { defaultValue: "Threshold" })}
                        </strong>
                        {t("education.practice.controls.threshold2", {
                          defaultValue:
                            ": moves the cut point. Lower values push more pixels toward dark; higher values push more toward light.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.invert", { defaultValue: "Invert" })}
                        </strong>
                        {t("education.practice.controls.invertTail", {
                          defaultValue:
                            ": flips tones (dark ↔ light). Useful for negative looks or when your palette is reversed.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.strong.workingResolution", { defaultValue: "Working resolution" })}
                        </strong>
                        {t("education.practice.controls.resolution2", {
                          defaultValue:
                            ": processing scale for preview/work. Lower is faster and chunkier; higher is sharper and slower. Export can still be done at original resolution.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.contrast", { defaultValue: "Contrast" })}
                        </strong>
                        {t("education.practice.controls.contrastTail", {
                          defaultValue:
                            ": pre-adjusts contrast before dithering. Small changes can strongly affect noise in shadows/highlights.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.midtones", { defaultValue: "Midtones (gamma)" })}
                        </strong>
                        {t("education.practice.controls.midtonesTail", {
                          defaultValue:
                            ": shifts the brightness curve (not a simple brightness slider). Great for rescuing flat midtones without crushing blacks/whites.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.highlights", { defaultValue: "Highlights" })}
                        </strong>
                        {t("education.practice.controls.highlightsTail", {
                          defaultValue:
                            ": pushes bright areas toward white. Helps simplify specular highlights and reduce speckling.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.blur", { defaultValue: "Blur" })}
                        </strong>
                        {t("education.practice.controls.blurTail", {
                          defaultValue:
                            ": optional pre-blur to reduce high-frequency noise and help gradients dither more cleanly.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.strong.palette", { defaultValue: "Palette" })}
                        </strong>
                        {t("education.practice.controls.palette2", {
                          defaultValue:
                            ": constrains output colors. Smaller palettes stylize more; larger palettes preserve gradients. Custom palettes let you pick exact colors.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.strong.serpentine", { defaultValue: "Serpentine" })}
                        </strong>
                        {t("education.practice.controls.serpentine2", {
                          defaultValue:
                            ": for supported error diffusion algorithms, alternates scan direction each row to reduce directional streaks.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.serpentinePattern", { defaultValue: "Serpentine pattern" })}
                        </strong>
                        {t("education.practice.controls.serpentinePatternTail", {
                          defaultValue:
                            ": chooses how serpentine scanning behaves (varies the feel of directional artifacts).",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.errorStrength", { defaultValue: "Error diffusion strength" })}
                        </strong>
                        {t("education.practice.controls.errorStrengthTail", {
                          defaultValue:
                            ": scales how much error gets diffused. Lower can look cleaner; higher can look sharper but noisier.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.asciiRamp", { defaultValue: "ASCII ramp" })}
                        </strong>
                        {t("education.practice.controls.asciiRampTail", {
                          defaultValue:
                            ": only for the ASCII Mosaic algorithm. Defines which characters represent dark → light.",
                        })}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.customKernel", { defaultValue: "Custom Kernel + divisor" })}
                        </strong>
                        {t("education.practice.controls.customKernelTail", {
                          defaultValue:
                            ": only for the Custom Kernel algorithm. You define the diffusion matrix and divisor to experiment with new diffusion behaviors.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.grid", { defaultValue: "Grid overlay" })}
                        </strong>
                        {t("education.practice.controls.gridTail", {
                          defaultValue:
                            ": preview helper for pixel alignment. It doesn’t change the exported result; it helps you judge pattern scale.",
                        })}
                      </p>
                    </div>

                    <div>
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.gridSize", { defaultValue: "Grid size" })}
                        </strong>
                        {t("education.practice.controls.gridSizeTail", {
                          defaultValue:
                            ": changes the grid spacing in pixels so you can match the look to your target resolution.",
                        })}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.presets", { defaultValue: "Presets / randomize / share" })}
                        </strong>
                        {t("education.practice.controls.presetsTail", {
                          defaultValue:
                            ": save and reuse settings, randomize for inspiration, and copy a share link that encodes your current parameters.",
                        })}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <p>
                        <strong className="font-semibold text-gray-200">
                          {t("education.practice.controls.export", { defaultValue: "Export" })}
                        </strong>
                        {t("education.practice.controls.exportTail", {
                          defaultValue:
                            ": download as PNG/JPEG/WebP (and SVG for images). Exports can be generated at full original resolution for best quality.",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.practice.artifacts.title", { defaultValue: "Common artifacts (and what to try)" })}
                </h2>
                <ul className="list-disc space-y-2 pl-5 text-[12px] text-gray-400">
                  <li>
                    <strong className="font-semibold text-gray-200">
                      {t("education.practice.artifacts.banding", { defaultValue: "Banding" })}
                    </strong>
                    {t("education.practice.artifacts.bandingTail", {
                      defaultValue:
                        ": use error diffusion, try serpentine, and increase working resolution.",
                    })}
                  </li>
                  <li>
                    <strong className="font-semibold text-gray-200">
                      {t("education.practice.artifacts.tiles", { defaultValue: "Visible tiles" })}
                    </strong>
                    {t("education.practice.artifacts.tilesTail", {
                      defaultValue:
                        ": pick a larger ordered matrix or switch to error diffusion.",
                    })}
                  </li>
                  <li>
                    <strong className="font-semibold text-gray-200">
                      {t("education.practice.artifacts.worms", { defaultValue: "Worms / streaks" })}
                    </strong>
                    {t("education.practice.artifacts.wormsTail", {
                      defaultValue:
                        ": enable serpentine, lower contrast a bit, or try a different diffusion kernel.",
                    })}
                  </li>
                </ul>
              </section>

              <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

              <section className="flex flex-wrap items-center justify-between gap-2">
                <Link
                  to={withLangPrefix("/Education/Basics", activeLang)}
                  className="clean-btn px-4 py-2 text-[11px]"
                >
                  {t("education.practice.prev", { defaultValue: "← Basics" })}
                </Link>
                <Link
                  to={withLangPrefix("/Education/Algorithms", activeLang)}
                  className="clean-btn px-4 py-2 text-[11px]"
                >
                  {t("education.practice.ctaExplorer", { defaultValue: "Explore algorithms" })}
                </Link>
                <Link
                  to={withLangPrefix("/Dithering/Image", activeLang)}
                  className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
                >
                  {t("education.practice.finish", { defaultValue: "Finish: Open the tool" })}
                </Link>
              </section>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default EducationPractice;
