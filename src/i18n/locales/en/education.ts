const education = {
  education: {
    seo: {
      title: 'What Is Dithering? A Visual Guide to Ordered & Error Diffusion',
      description:
        'Learn how dithering fakes extra gray levels, how Bayer threshold maps work, and when to use ordered vs error diffusion — with examples you can try in the tool.',
    },
    techArticle: {
      headline: 'What Is Dithering? Complete Guide to Ordered & Error Diffusion',
      description:
        'An interactive educational reference guide explaining digital image and video dithering math, covering 30+ algorithms including Floyd-Steinberg, Bayer, and Blue Noise.',
      audienceType: 'Developers, Graphic Designers, Pixel Artists',
      aboutDithering: 'Dithering',
      aboutFloydSteinberg: 'Floyd–Steinberg algorithm',
      aboutErrorDiffusion: 'Error diffusion',
      aboutOrderedDithering: 'Ordered dithering',
    },

    header: {
      title: 'Education',
      navTool: 'Tool',
      navReference: 'Reference',
      navHome: 'Home',
      navEducation: 'Education',
    },

    title: 'Dithering Education',
    heroImageAlt: 'Dithering education hero',

    guide: {
      kicker: 'Education',
      pageTitle: 'Understanding dithering',
      pageLead:
        'Two short chapters on how dithering fakes extra tones, how ordered threshold maps work, and where to experiment in Dithering Studio.',
      hub: {
        back: '← Education hub',
        readPart: 'Read chapter',
        part1Teaser: 'How dot density fakes extra gray, and why a flat threshold loses detail.',
        part2Teaser: 'Bayer matrices, threshold maps, and how they differ from error diffusion.',
      },
      part1: {
        kicker: 'Part 1',
        title: 'What dithering does',
        lead: 'The same story as Damar’s visual essay on dithering, told here in plain text so you can read and experiment side by side.',
        nextCta: 'Continue to Part 2 →',
        seo: {
          title: 'What Dithering Does — Part 1',
          description: 'Learn how dithering simulates extra gray levels with patterns of black and white pixels.',
        },
        blocks: {
          charm: {
            title: 'More shades than you actually have',
            p1: 'Dithering is the trick of simulating extra gray levels (or colors) using only a small set of outputs. Up close you see individual dots or pixels; step back and your eye blends them into smooth tones.',
            p2: 'That is why retro game screens, newspaper print, and lo-fi art all feel related: they make the most of a limited palette by placing light and dark elements deliberately.',
          },
          threshold: {
            title: 'Why a plain threshold looks harsh',
            p1: 'Suppose a display can only show pure black or pure white. The naive approach is to compare each pixel to a single cutoff: darker than middle gray becomes black, lighter becomes white.',
            p2: 'That preserves sharp edges but destroys subtle shadows and highlights. Large areas collapse to flat black or flat white, and gradients turn into ugly stair-steps.',
          },
          pattern: {
            title: 'Patterns instead of flat fills',
            p1: 'Dithering fixes this by nudging some pixels toward the opposite color. A light gray pixel might still become a black dot, but only where the pattern needs more density. Dark areas get more black dots; bright areas get more white ones.',
            p2: 'The average density in each region mimics the original brightness — that is the whole illusion. Drag the slider on the live preview below to see a random algorithm turn a photo into a field of dots while keeping the overall image readable.',
          },
        },
        visualRambling: {
          kicker: 'Interactive essay',
          title: 'Dithering — Part 1 on visualrambling.space',
          body: 'Damar’s scroll-driven piece covers the same foundations with WebGL visuals. We summarize the ideas below in text; open his article when you want the animated walkthrough.',
          credit: 'By Damar · visualrambling.space',
          link: 'Open Part 1 (new tab)',
        },
      },
      part2: {
        kicker: 'Part 2',
        title: 'Ordered dithering & threshold maps',
        lead: 'How repeating threshold grids create Bayer cross-hatches, why tile size matters, and where error diffusion fits in.',
        prevLink: '← Part 1',
        toolCta: 'Open the tool',
        seo: {
          title: 'Ordered Dithering & Threshold Maps — Part 2',
          description: 'How Bayer matrices and threshold maps create ordered dither patterns.',
        },
        blocks: {
          quantize: {
            title: 'Quantization: fewer colors on purpose',
            p1: 'Ordered dithering starts with quantization — mapping many gray levels down to just black and white. One global threshold splits the image in half; multiple thresholds at once produce mixed black and white in a single tone region.',
          },
          map: {
            title: 'Threshold maps tile across the image',
            p1: 'A threshold map is a small grid of values from dark to light. For each pixel you compare its brightness to the value in the matching cell. Brighter than the threshold → white; otherwise → black.',
            p2: 'Repeat that grid across the whole image and you get a dithered result. But if the map is a simple row of thresholds, the output shows ugly stripes — the pattern layout matters as much as the numbers.',
          },
          bayer: {
            title: 'Bayer matrices break up the stripes',
            p1: 'The classic Bayer arrangement scatters thresholds in a cross-hatch order. A 2×2 map gives four distinct patterns; 4×4 gives sixteen, so transitions between shadows and highlights look smoother.',
            p2: 'Larger Bayer sizes (8×8, 16×16…) add even more pattern variants. The look stays crisp and grid-like — perfect for pixel art and UI — but never perfectly photo-smooth.',
          },
          beyond: {
            title: 'Other maps, other textures',
            p1: 'Cluster-dot matrices lean toward round blobs (think newsprint). Void-and-cluster / blue-noise maps spread points more evenly for a finer, less grid-like grain. Same idea — vary density to fake gray — different character.',
            p2: 'Error diffusion (Floyd–Steinberg and friends) skips the repeating map entirely and spreads rounding error to neighbors. That family is covered in our algorithm reference when you want implementation detail.',
          },
        },
        bayerDemo: {
          caption: '4×4 Bayer threshold map (values 0–15)',
          hint: 'Each cell is a threshold. Brighter input pixels turn white when they exceed their cell’s value.',
        },
        compare: {
          title: 'Ordered vs error diffusion',
          body: 'Ordered methods repeat a matrix; error diffusion propagates mistakes outward. Neither is “better” — they suit different aesthetics.',
        },
        visualRambling: {
          kicker: 'Interactive essay',
          title: 'Dithering — Part 2 on visualrambling.space',
          body: 'The second essay explains threshold maps and Bayer matrices visually. Read it alongside the section below !',
          credit: 'By Damar · visualrambling.space',
          link: 'Open Part 2 (new tab)',
        },
      },
      continue: {
        title: 'Go deeper in the tool',
        body: 'Load any image or video clip, pick an algorithm, and export. When you need kernels, complexity notes, or per-algorithm history, use the reference explorer.',
        algorithms: 'Algorithm reference',
        tool: 'Open the image tool',
      },
    },

    strong: {
      dithering: 'Dithering',
      definition: 'Definition:',
      tip: 'Tip:',
      wikipedia: 'Wikipedia',
      ordered: 'Ordered dithering',
      threshold: 'Threshold',
      workingResolution: 'Working resolution',
      palette: 'Palette',
      serpentine: 'Serpentine',
    },

    lead: {
      tail:
        "is a way to simulate more tones and colors than a palette (or display) can show by intentionally adding a structured pattern or noise. It's used to reduce banding in gradients, create retro pixel art looks, and mimic print halftones.",
    },

    cta: {
      openTool: 'Open the tool',
      basics: 'Start with Basics',
      practice: 'Go to Practice',
      tryImage: 'Try it on an image',
      tryVideo: 'Try it on a video',
      exploreAlgorithms: 'Explore algorithms',
    },

    hero: {
      kicker: 'Learn dithering',
      subtitle:
        'Understand ordered matrices, error diffusion, and palettes—then apply what you learn in the tool with companion examples.',
      ctaPart1: 'Start with Part 1',
      ctaAlgorithms: 'Explore algorithms',
      ctaTool: 'Open the tool',
    },

    hubCta: {
      title: 'Ready to try it?',
      body: 'Load an image, pick an algorithm, and export — or keep reading with Part 1.',
    },

    paths: {
      title: 'Choose your path',
      subtitle: 'Three entry points depending on how deep you want to go on the first visit.',
      beginner: {
        title: 'Beginner',
        body: 'Core definitions, the two algorithm families, and a short FAQ—no math required.',
        cta: 'Start with Basics',
      },
      creator: {
        title: 'Practical creator',
        body: 'Recipes for gradients, retro looks, and video—threshold, serpentine, and palette tips.',
        cta: 'Go to Practice',
      },
      technical: {
        title: 'Technical explorer',
        body: 'Per-algorithm reference, kernels, complexity notes, and deep links into the workspace.',
        cta: 'Algorithm reference',
      },
    },

    visual: {
      title: 'See it, don’t just read it',
      subtitle: 'Compare before/after on sample media, then contrast ordered vs error-diffusion textures.',
      beforeAfter: 'Before / after (live preview)',
      patterns: 'Pattern comparison',
      orderedLabel: 'Ordered (Bayer)',
      orderedHint: 'Repeating matrix—fast, crisp, pixel-friendly grid.',
      errorLabel: 'Error diffusion (Floyd–Steinberg)',
      errorHint: 'Error spread to neighbors—often smoother gradients.',
      seeOrdered: 'See Bayer 4×4',
      seeError: 'See Floyd–Steinberg',
    },

    external: {
      title: 'Recommended deep reads',
      intro:
        'The best visual explanations we found live off-site. Read them for intuition, then return here to try the same ideas in-app.',
      part1Title: 'Dithering, part 1',
      part1Desc: 'Foundations and visual intuition for how dither patterns emerge.',
      part2Title: 'Dithering, part 2',
      part2Desc: 'Blue noise, modern ordered approaches, and quality trade-offs.',
      returnCta: 'Back to education hub',
      tryCta: 'Try in the tool',
    },

    preview: {
      title: 'A quick example (random settings)',
      hint: 'Drag the slider',
      loading: 'Generating preview…',
      fallback: 'Preview unavailable on this device.',
    },

    onboarding: {
      title: 'Start here (2 steps)',
      body:
        "If you're new to dithering, follow this short path: learn the core ideas first, then apply them with a few practical recipes.",
      step1: {
        kicker: 'Step 1',
        body:
          'Definition, ordered dithering (Bayer), and error diffusion (Floyd–Steinberg) — just enough to understand what changes when you swap algorithms.',
      },
      step2: {
        kicker: 'Step 2',
        body:
          'A small set of recipes and knobs to get good results fast: threshold, serpentine, palettes, and common artifacts.',
      },
    },

    whatIs: {
      title: 'What is dithering? (Definition)',
      body:
        'In computer graphics, dithering is a technique that approximates missing tones by distributing pixels from the available palette. Instead of a smooth gradient (which may not be possible after quantization), you get a controlled pattern that the eye blends into a perceived intermediate tone.',
      point1: 'Reduces visible banding in gradients',
      point2: 'Makes limited palettes look richer (color dithering)',
      point3: 'Creates a deliberate retro / pixel art texture',
    },

    families: {
      title: 'The two main families',
      ordered: {
        title: 'Ordered dithering (Bayer matrix)',
        body:
          "Ordered dithering compares each pixel’s brightness to a repeating threshold matrix. It's extremely fast and predictable, and its “patterned” look is often desirable for pixel art and stylized graphics.",
        cta: 'See Bayer 4×4',
        point1: 'Best when you want a predictable repeating pattern.',
        point2: 'Common artifact: visible tiles or a “grid” look (matrix size matters).',
      },
      error: {
        title: 'Error diffusion (Floyd–Steinberg)',
        body:
          'Error diffusion quantizes a pixel to the nearest available tone, then spreads the quantization error to neighboring pixels. This usually produces more “natural” textures and smoother gradients than ordered dithering.',
        cta: 'See Floyd–Steinberg',
        point1: 'Great for photos and gradients; tends to hide banding well.',
        point2: 'Common artifacts: worms/streaks or directional noise (serpentine helps).',
      },
      tryInTool: 'Try in tool',
    },

    color: {
      title: 'Color dithering vs grayscale',
      body:
        'Grayscale dithering approximates tones using black/white (or a few gray levels). Color dithering does the same, but with a limited set of colors. The palette you choose strongly affects the look—try a small palette for a retro 8‑bit feel, or a larger palette for smoother color ramps.',
    },

    when: {
      title: 'When to use dithering',
      good: {
        title: 'Great for',
        1: 'Gradients and skies (reduce banding)',
        2: 'Pixel art, retro/CRT aesthetics',
        3: 'Print-like halftone and stipple styles',
      },
      avoid: {
        title: 'Avoid when',
        1: 'You need perfectly smooth tonal transitions',
        2: 'Fine text should remain razor sharp',
        3: 'Noise or patterns would be distracting',
      },
    },

    faq: {
      title: 'FAQ',
      q1: 'Ordered dithering vs error diffusion: what’s the difference?',
      a1:
        'Ordered dithering uses a repeating threshold matrix (fast, patterned, deterministic). Error diffusion propagates quantization error to neighbors (often smoother gradients, more organic noise). Both are valid—choose based on the texture you want.',
      q2: 'What is Floyd–Steinberg dithering?',
      a2:
        'Floyd–Steinberg is a classic error diffusion algorithm that spreads quantization error to nearby pixels with fixed weights. It’s a strong default when you want smooth-looking gradients and a fine-grain texture.',
      q3: 'What is a Bayer matrix?',
      a3:
        'A Bayer matrix is a small ordered threshold pattern (like 4×4 or 8×8) used for ordered dithering. It creates a repeating structure that approximates intermediate tones with a recognizable, pixel-friendly texture.',
    },

    next: {
      title: 'Next: try the techniques',
      body:
        'Pick an image with gradients or skin tones and compare Bayer vs Floyd–Steinberg. Then try a limited palette to see color dithering in action.',
      cta1: 'Open the tool',
      cta2: 'Browse algorithm details',
    },

    basics: {
      seo: {
        title: 'Dithering Basics | Definition, Bayer Matrix & Error Diffusion',
        description:
          'Dithering basics: definition, how dithering reduces banding, and how ordered dithering (Bayer matrix) differs from error diffusion (Floyd–Steinberg).',
      },
      title: 'Basics',
      lead:
        'A quick, clean foundation: what dithering is, what problems it solves, and how the two main families behave.',
      whatIs: {
        bodyTail:
          'is a technique that simulates extra tones by arranging pixels into patterns. In graphics, dithering is commonly used after quantization (reducing colors or grayscale levels) to reduce banding and create a deliberate dither effect.',
      },
      ditherVsDithering: {
        title: 'Dither vs dithering',
        body:
          ': people say “dither” (verb) or “dithering” (noun) for the same idea: using patterns/noise to hide quantization steps. The goal is not to add real detail, but to change how tone steps are perceived.',
      },
      bandings: {
        title: 'Why dithering reduces banding',
        body:
          'Banding happens when a smooth gradient is forced into too few levels (for example, 256 → 16 shades). Dithering spreads those missing tones into a pattern so the eye perceives a smoother transition.',
        point1: 'Quantization reduces available tones/colors; dithering hides the “steps”.',
        point2: 'Different algorithms trade speed, texture, and artifacts.',
      },
      whenToUse: {
        title: 'When to use which',
        ordered: 'Choose ordered dithering when…',
        ordered1: 'You want a clean, repeatable dither pattern (pixel art / UI icons).',
        ordered2: 'You need speed or deterministic results.',
        error: 'Choose error diffusion when…',
        error1: 'You’re dithering images or photos and want smoother gradients.',
        error2: 'You’re trying to hide banding after palette reduction.',
      },
      history: {
        title: 'A very short history',
        body:
          'Dithering shows up anywhere an image must be displayed or printed with fewer tones than it contains. Early computer displays and printers made it essential; today it’s also used as a deliberate artistic texture.',
        body2:
          'Modern tools let you choose between structured ordered patterns and more organic error diffusion—each with its own tradeoffs in speed, texture, and artifacts.',
      },
      keyTerms: {
        title: 'Key terms (quick glossary)',
        quantization: 'Quantization',
        quantizationTail: ': reducing the number of available tones or colors.',
        threshold: 'Threshold',
        thresholdTail:
          ': a cut point used by many dithering algorithms to decide light/dark output.',
        bayer: 'Bayer matrix',
        bayerTail: ': a repeating threshold matrix used for ordered dithering.',
        palette: 'Palette',
        paletteTail:
          ': a fixed set of colors; color dithering approximates your image using only those colors.',
      },
      sources: {
        title: 'Sources & further reading',
      },
      ctaHome: 'Back to Education',
      ctaNext: 'Continue to Practice',
    },

    practice: {
      seo: {
        title: 'Dithering Practice | Settings, Artifacts, and Quick Recipes',
        description:
          'Practical dithering tips: a step-by-step workflow, how each setting affects the result, and how to fix common dithering artifacts in images.',
      },
      title: 'Practice',
      lead:
        'A practical workflow for image dithering: pick an algorithm, tune the controls, fix artifacts, and export clean results.',
      workflow: {
        title: 'A simple 3-step workflow',
        lead:
          'If you’re unsure where to start, this flow gets consistent results fast. It also maps directly to the settings you see in the Image tool.',
        step1: {
          kicker: 'Step 1',
          title: 'Choose the algorithm family',
          body:
            'For photos/gradients, start with error diffusion (Floyd–Steinberg, Sierra variants). For pixel art and clean structure, start with ordered dithering (Bayer matrices, blue noise).',
        },
        step2: {
          kicker: 'Step 2',
          title: 'Get tone and scale right',
          body:
            'Set working resolution for speed vs detail, then adjust contrast/gamma/highlights (and optional blur) so your midtones and edges behave well before dithering.',
        },
        step3: {
          kicker: 'Step 3',
          title: 'Tune settings + export',
          body:
            'Adjust threshold/invert, serpentine options (for diffusion), palette choices, and any algorithm-specific settings. When it looks right, export at original resolution.',
        },
      },
      recipes: {
        title: 'Quick recipes',
        photo: {
          title: 'Photos (natural texture)',
          li1: 'Start with Floyd–Steinberg or a Sierra variant, then tweak threshold.',
          li2: 'Enable serpentine if you see diagonal directional artifacts.',
          li3:
            'Use a small palette (4–16) for stylization; keep it bigger for smoother tones.',
          li4:
            'If shadows look noisy, reduce contrast, adjust midtones (gamma), or add a tiny blur before dithering.',
        },
        pixel: {
          title: 'Pixel art / icons (clean structure)',
          li1: 'Try ordered dithering (Bayer 4×4 or 8×8) for predictable patterns.',
          li2:
            'Keep palettes tight (2–8 colors) and tune threshold to control the pattern density.',
          li3: 'If you see repeating tiles, switch matrix size (4×4 → 8×8 → 16×16).',
        },
      },
      controls: {
        title: 'What the main controls do',
        lead:
          'This list reflects the Image tool controls. Some controls appear only for specific algorithms (for example ASCII ramp or Custom Kernel).',
        algorithm: 'Algorithm',
        algorithmTail:
          ': chooses the dithering method (error diffusion, ordered/Bayer, blue noise, etc.). This changes texture, artifacts, and performance.',
        threshold2:
          ': moves the cut point. Lower values push more pixels toward dark; higher values push more toward light.',
        invert: 'Invert',
        invertTail:
          ': flips tones (dark ↔ light). Useful for negative looks or when your palette is reversed.',
        resolution2:
          ': processing scale for preview/work. Lower is faster and chunkier; higher is sharper and slower. Export can still be done at original resolution.',
        contrast: 'Contrast',
        contrastTail:
          ': pre-adjusts contrast before dithering. Small changes can strongly affect noise in shadows/highlights.',
        midtones: 'Midtones (gamma)',
        midtonesTail:
          ': shifts the brightness curve (not a simple brightness slider). Great for rescuing flat midtones without crushing blacks/whites.',
        highlights: 'Highlights',
        highlightsTail:
          ': pushes bright areas toward white. Helps simplify specular highlights and reduce speckling.',
        blur: 'Blur',
        blurTail:
          ': optional pre-blur to reduce high-frequency noise and help gradients dither more cleanly.',
        palette2:
          ': constrains output colors. Smaller palettes stylize more; larger palettes preserve gradients. Custom palettes let you pick exact colors.',
        serpentine2:
          ': for supported error diffusion algorithms, alternates scan direction each row to reduce directional streaks.',
        serpentinePattern: 'Serpentine pattern',
        serpentinePatternTail:
          ': chooses how serpentine scanning behaves (varies the feel of directional artifacts).',
        errorStrength: 'Error diffusion strength',
        errorStrengthTail:
          ': scales how much error gets diffused. Lower can look cleaner; higher can look sharper but noisier.',
        asciiRamp: 'ASCII ramp',
        asciiRampTail:
          ': only for the ASCII Mosaic algorithm. Defines which characters represent dark → light.',
        customKernel: 'Custom Kernel + divisor',
        customKernelTail:
          ': only for the Custom Kernel algorithm. You define the diffusion matrix and divisor to experiment with new diffusion behaviors.',
        grid: 'Grid overlay',
        gridTail:
          ': preview helper for pixel alignment. It doesn’t change the exported result; it helps you judge pattern scale.',
        gridSize: 'Grid size',
        gridSizeTail:
          ': changes the grid spacing in pixels so you can match the look to your target resolution.',
        presets: 'Presets / randomize / share',
        presetsTail:
          ': save and reuse settings, randomize for inspiration, and copy a share link that encodes your current parameters.',
        export: 'Export',
        exportTail:
          ': download as PNG/JPEG/WebP (and SVG for images). Exports can be generated at full original resolution for best quality.',
      },
      artifacts: {
        title: 'Common artifacts (and what to try)',
        banding: 'Banding',
        bandingTail: ': use error diffusion, try serpentine, and increase working resolution.',
        tiles: 'Visible tiles',
        tilesTail: ': pick a larger ordered matrix or switch to error diffusion.',
        worms: 'Worms / streaks',
        wormsTail: ': enable serpentine, lower contrast a bit, or try a different diffusion kernel.',
      },
      prev: '← Basics',
      ctaExplorer: 'Explore algorithms',
      finish: 'Finish: Open the tool',
    },
  },
};

export default education;
