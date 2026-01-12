const education = {
      education: {
        seo: {
          title: 'Dithering क्या है? Ordered dithering, error diffusion और Floyd–Steinberg',
          description:
            'Dithering की परिभाषा, ordered dithering (Bayer matrix) बनाम error diffusion (Floyd–Steinberg), color dithering कब उपयोगी है, और इसे ऑनलाइन कैसे आज़माएँ।',
        },

        header: {
          title: 'Education',
          navTool: 'Tool',
          navReference: 'Reference',
          navHome: 'Home',
          navEducation: 'Education',
        },

        title: 'Dithering सीखें',
        heroImageAlt: 'Dithering education banner',

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
            '— एक तकनीक है जो सीमित टोन/रंगों में भी अधिक smooth shading का illusion देती है, जानबूझकर pattern/noise जोड़कर। यह gradients में banding कम करती है और retro/pixel‑art जैसा texture बना सकती है।',
        },

        cta: {
          openTool: 'Tool खोलें',
          basics: 'Basics से शुरू करें',
          practice: 'Practice पर जाएँ',
          tryImage: 'इमेज पर ट्राय करें',
          tryVideo: 'वीडियो पर ट्राय करें',
          exploreAlgorithms: 'Algorithms देखें',
        },

        preview: {
          title: 'Quick preview (random settings)',
          hint: 'Slider drag करें',
          loading: 'Preview बन रहा है…',
          fallback: 'इस device पर preview उपलब्ध नहीं है।',
        },

        onboarding: {
          title: 'Start here (2 steps)',
          body:
            'यदि आप नए हैं, तो पहले basics समझें, फिर कुछ practical recipes के साथ tool में practice करें।',
          step1: {
            kicker: 'Step 1',
            body:
              'Definition + ordered dithering (Bayer) + error diffusion (Floyd–Steinberg): इतना समझने से algorithms के differences साफ़ हो जाते हैं।',
          },
          step2: {
            kicker: 'Step 2',
            body:
              'Practical knobs: threshold, serpentine, palette और common artifacts को जल्दी पहचानना।',
          },
        },

        whatIs: {
          title: 'Dithering क्या है? (Definition)',
          body:
            'Computer graphics में dithering एक technique है जो कम colors/tones के साथ भी intermediate tones का illusion देती है। यह pixels को pattern में arrange करके gradients की “steps” को visually smooth बनाती है।',
          point1: 'Gradients में banding कम करता है',
          point2: 'Limited palette में colors का बेहतर approximation (color dithering)',
          point3: 'Retro / pixel‑art texture',
        },

        families: {
          title: 'दो मुख्य families',
          ordered: {
            title: 'Ordered dithering (Bayer matrix)',
            body:
              'Ordered dithering एक repeating threshold matrix का उपयोग करता है। यह fast और deterministic होता है, और pixel‑art में इसका structure अक्सर desirable होता है।',
            cta: 'Bayer 4×4 देखें',
            point1: 'जब आपको predictable/repeatable pattern चाहिए।',
            point2: 'Typical artifact: visible tiling / grid structure (matrix size से control होता है)।',
          },
          error: {
            title: 'Error diffusion (Floyd–Steinberg)',
            body:
              'Error diffusion हर pixel पर quantization करके error को neighbors में spread करता है। यह अक्सर ordered dithering से ज्यादा organic और smooth gradient देता है।',
            cta: 'Floyd–Steinberg देखें',
            point1: 'Photos और gradients के लिए great; banding को अच्छे से hide करता है।',
            point2: 'Artifacts: worms/streaks या directional noise (serpentine मदद करता है)।',
          },
          tryInTool: 'Tool में try करें',
        },

        color: {
          title: 'Color dithering बनाम grayscale',
          body:
            'Grayscale dithering black/white (या कुछ grays) के बीच choose करता है। Color dithering एक limited palette से colors चुनकर original colors का approximation करता है। Palette जितनी छोटी, उतना “8‑bit” look।',
        },

        when: {
          title: 'कब dithering उपयोग करें',
          good: {
            title: 'Best for',
            1: 'Gradients और skies (banding reduction)',
            2: 'Pixel‑art, retro/CRT aesthetics',
            3: 'Print‑style looks: halftone और stipple',
          },
          avoid: {
            title: 'Avoid when',
            1: 'आपको perfectly smooth tones चाहिए',
            2: 'Very thin text को ultra‑sharp रखना है',
            3: 'Noise/pattern distract कर सकता है',
          },
        },

        faq: {
          title: 'FAQ',
          q1: 'Ordered dithering vs error diffusion: difference?',
          a1:
            'Ordered dithering fixed threshold matrix (fast, structured, deterministic) पर आधारित है। Error diffusion error को neighbors में distribute करता है (often smoother/organic). आप जिस texture को चाहते हैं, उसी के अनुसार चुनें।',
          q2: 'Floyd–Steinberg dithering क्या है?',
          a2:
            'Floyd–Steinberg एक classic error diffusion algorithm है जिसमें fixed weights होते हैं। यह gradients/photos के लिए एक अच्छा default option है।',
          q3: 'Bayer matrix क्या है?',
          a3:
            'Bayer matrix ordered thresholds का छोटा repeating table है (जैसे 4×4, 8×8)। यह characteristic pixel pattern बनाता है।',
        },

        next: {
          title: 'Next: techniques try करें',
          body:
            'Gradients वाली image पर Bayer और Floyd–Steinberg compare करें। फिर palette limit करके color dithering देखें।',
          cta1: 'Tool खोलें',
          cta2: 'Algorithm details देखें',
        },

        basics: {
          seo: {
            title: 'Dithering basics | Definition, Bayer matrix और error diffusion',
            description:
              'Dithering का basic guide: definition, banding कैसे कम होता है, और ordered dithering (Bayer) बनाम error diffusion (Floyd–Steinberg).',
          },
          title: 'Basics',
          lead:
            'Short foundation: dithering क्या है, यह किस problem को solve करता है, और दो मुख्य algorithm families कैसे behave करती हैं।',
          whatIs: {
            bodyTail:
              '— pixels को pattern में arrange करके intermediate tones का illusion बनाता है। यह अक्सर quantization (colors/levels कम करना) के बाद लगाया जाता है, ताकि banding कम हो और intentional dither look मिले।',
          },
          ditherVsDithering: {
            title: 'Dither vs dithering',
            body:
              ': ये essentially same idea हैं—quantization steps को hide करने के लिए pattern/noise का use। Goal वास्तविक detail जोड़ना नहीं, perception बदलना है।',
          },
          bandings: {
            title: 'Dithering banding क्यों कम करता है',
            body:
              'Banding तब दिखता है जब smooth gradient को कम levels में map करना पड़ता है। Dithering missing tones को space में distribute करता है, जिससे gradient ज्यादा smooth महसूस होता है।',
            point1: 'Quantization tones/colors कम करता है; dithering “steps” को hide करता है।',
            point2: 'Algorithms speed, texture और artifacts में अलग होते हैं।',
          },
          whenToUse: {
            title: 'कब क्या choose करें',
            ordered: 'Ordered dithering चुनें जब…',
            ordered1: 'आपको clean repeatable pattern चाहिए (pixel‑art / UI icons)।',
            ordered2: 'Speed या deterministic output important हो।',
            error: 'Error diffusion चुनें जब…',
            error1: 'Photos/gradients में smoother look चाहिए।',
            error2: 'Palette reduce करने के बाद banding को ज्यादा effectively hide करना हो।',
          },
          history: {
            title: 'Very short history',
            body:
              'Dithering का उपयोग तब से होता आया है जब displays/printers में tones limited थे। आज भी यह quality (banding reduction) और style (retro texture) दोनों के लिए इस्तेमाल होता है।',
            body2:
              'Modern tools में structured ordered patterns और organic error diffusion के बीच choose किया जा सकता है।',
          },
          keyTerms: {
            title: 'Key terms (mini glossary)',
            quantization: 'Quantization',
            quantizationTail: ': available tones/colors की संख्या कम करना।',
            threshold: 'Threshold',
            thresholdTail: ': cut‑off value जो light/dark निर्णय प्रभावित करता है।',
            bayer: 'Bayer matrix',
            bayerTail: ': ordered dithering के लिए repeating threshold matrix।',
            palette: 'Palette',
            paletteTail: ': fixed color set; color dithering इसी set से colors चुनता है।',
          },
          sources: {
            title: 'Sources / reading',
          },
          ctaHome: 'Education पर वापस',
          ctaNext: 'Next: Practice',
        },

        practice: {
          seo: {
            title: 'Dithering practice | Controls, artifacts और quick recipes',
            description:
              'Practical guide: workflow, main controls क्या करते हैं, और common dithering artifacts को कैसे fix करें।',
          },
          title: 'Practice',
          lead:
            'Practical workflow: algorithm चुनें, parameters tune करें, artifacts fix करें, और clean export करें।',
          workflow: {
            title: '3‑step workflow',
            lead:
              'अगर आप unsure हैं, यह plan जल्दी stable results देता है और Image tool controls के अनुसार है।',
            step1: {
              kicker: 'Step 1',
              title: 'Algorithm family choose करें',
              body:
                'Photos/gradients के लिए error diffusion (Floyd–Steinberg, Sierra) से शुरू करें। Pixel‑art/structure के लिए ordered dithering (Bayer, blue noise) चुनें।',
            },
            step2: {
              kicker: 'Step 2',
              title: 'Tone + scale सेट करें',
              body:
                'Working resolution (speed vs detail) set करें; फिर contrast/midtones/highlights (और optional blur) adjust करें ताकि input stable हो।',
            },
            step3: {
              kicker: 'Step 3',
              title: 'Fine‑tune + export',
              body:
                'Threshold/invert, serpentine (diffusion के लिए), palette और algorithm‑specific settings tune करें। फिर original resolution export करें।',
            },
          },
          recipes: {
            title: 'Quick recipes',
            photo: {
              title: 'Photo (natural texture)',
              li1: 'Floyd–Steinberg या Sierra से शुरू करें और threshold tweak करें।',
              li2: 'Directional artifacts दिखें तो serpentine on करें।',
              li3: 'Palette 4–16 stylized look देती है; larger palette smoothness बढ़ाती है।',
              li4:
                'Shadows noisy हों तो contrast कम करें, midtones adjust करें, या थोड़ा blur जोड़ें।',
            },
            pixel: {
              title: 'Pixel‑art / icons (clean structure)',
              li1: 'Ordered dithering (Bayer 4×4 या 8×8) try करें।',
              li2: 'Small palette (2–8 colors) रखें; threshold से pattern density control करें।',
              li3: 'Visible tiling हो तो matrix size बढ़ाएँ (4×4 → 8×8 → 16×16)।',
            },
          },
          controls: {
            title: 'Main controls क्या करते हैं',
            lead:
              'यह list Image tool के controls से match करती है। कुछ controls केवल specific algorithms के लिए दिखते हैं (जैसे ASCII ramp या Custom Kernel)।',
            algorithm: 'Algorithm',
            algorithmTail:
              ': method choose करता है (error diffusion, Bayer/ordered, blue noise, आदि)। Texture, artifacts और performance बदलते हैं।',
            threshold2: ': cut‑off shift करता है। Lower → ज्यादा dark; higher → ज्यादा light.',
            invert: 'Invert',
            invertTail: ': tones swap करता है (dark ↔ light)। Negative look/alternate palette के लिए useful।',
            resolution2:
              ': preview processing scale। Lower = faster + chunkier; higher = sharper + slower। Export original resolution पर possible है।',
            contrast: 'Contrast',
            contrastTail: ': dithering से पहले contrast adjust करता है। छोटे changes shadows/highlights noise पर बड़ा असर डालते हैं।',
            midtones: 'Midtones (gamma)',
            midtonesTail: ': brightness curve shift करता है—midtones tune करने के लिए best knob।',
            highlights: 'Highlights',
            highlightsTail: ': bright areas को push करता है; highlights में “speckle” कम कर सकता है।',
            blur: 'Blur',
            blurTail: ': optional pre‑blur जिससे gradients clean और stable dither होते हैं।',
            palette2:
              ': output colors limit करता है। Smaller palette = ज्यादा stylized; larger = smoother tones। Custom palette exact colors देती है।',
            serpentine2: ': supported error diffusion में direction alternate करके directional streaks कम करता है।',
            serpentinePattern: 'Serpentine pattern',
            serpentinePatternTail: ': serpentine behavior define करता है (directional artifacts affect होते हैं)।',
            errorStrength: 'Error diffusion strength',
            errorStrengthTail: ': error कितनी मात्रा में distribute हो, इसे scale करता है।',
            asciiRamp: 'ASCII ramp',
            asciiRampTail: ': केवल ASCII Mosaic के लिए। Dark→light mapping के लिए symbols set।',
            customKernel: 'Custom Kernel + divisor',
            customKernelTail: ': केवल Custom Kernel के लिए। Matrix और divisor specify करके experiment करें।',
            grid: 'Grid',
            gridTail: ': preview aid; export पर असर नहीं।',
            gridSize: 'Grid size',
            gridSizeTail: ': pixels में grid spacing बदलता है।',
            presets: 'Presets / randomize / share',
            presetsTail: ': settings save करें, randomize करें, और shareable link copy करें।',
            export: 'Export',
            exportTail: ': PNG/JPEG/WebP (और images के लिए SVG)। Original resolution export supported है।',
          },
          artifacts: {
            title: 'Common artifacts (और क्या try करें)',
            banding: 'Banding',
            bandingTail: ': error diffusion use करें, serpentine on करें, और working resolution बढ़ाएँ।',
            tiles: 'Visible tiles',
            tilesTail: ': larger ordered matrix चुनें या error diffusion पर switch करें।',
            worms: 'Worms / streaks',
            wormsTail: ': serpentine on करें, contrast थोड़ा कम करें, या दूसरा diffusion kernel try करें।',
          },
          prev: '← Basics',
          ctaExplorer: 'Algorithms explore करें',
          finish: 'Done: tool खोलें',
        },
      },
    };

export default education;


