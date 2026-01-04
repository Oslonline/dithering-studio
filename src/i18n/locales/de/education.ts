const education = {
        education: {
          seo: {
            title: 'Was ist Dithering? Ordered Dithering, Error Diffusion & Floydâ€“Steinberg',
            description:
              'Lerne die Dithering-Definition und die wichtigsten Methoden (Ordered Dithering/Bayer-Matrix und Error Diffusion/Floydâ€“Steinberg). Wann Farbdithering hilft und wie du es online ausprobierst.',
          },

          header: {
            title: 'Education',
            navTool: 'Tool',
            navReference: 'Referenz',
            navHome: 'Home',
            navEducation: 'Education',
          },

          title: 'Dithering Education',
          heroImageAlt: 'Dithering-Education Hero',

          strong: {
            dithering: 'Dithering',
            definition: 'Definition:',
            tip: 'Tipp:',
            wikipedia: 'Wikipedia',
            ordered: 'Ordered Dithering',
            threshold: 'Schwellwert',
            workingResolution: 'ArbeitsauflÃ¶sung',
            palette: 'Palette',
            serpentine: 'Serpentine',
          },

          lead: {
            tail:
              'ist eine Methode, mehr Tonwerte und Farben zu simulieren als eine Palette (oder ein Display) darstellen kann, indem bewusst ein Muster oder Rauschen hinzugefÃ¼gt wird. Es reduziert Banding in VerlÃ¤ufen, erzeugt Retro/Pixel-Art-Looks und imitiert Druck-Halftones.',
          },

          cta: {
            openTool: 'Tool Ã¶ffnen',
            basics: 'Mit Basics starten',
            practice: 'Zu Practice',
            tryImage: 'An einem Bild ausprobieren',
            tryVideo: 'An einem Video ausprobieren',
            exploreAlgorithms: 'Algorithmen erkunden',
          },

          preview: {
            title: 'Ein kurzes Beispiel (zufÃ¤llige Einstellungen)',
            hint: 'Ziehe den Slider',
            loading: 'Vorschau wird erstelltâ€¦',
            fallback: 'Vorschau auf diesem GerÃ¤t nicht verfÃ¼gbar.',
          },

          onboarding: {
            title: 'Starte hier (2 Schritte)',
            body:
              'Wenn du neu bei Dithering bist, folge diesem kurzen Pfad: erst die Grundlagen, dann ein paar praktische Rezepte.',
            step1: {
              kicker: 'Schritt 1',
              body:
                'Definition, Ordered Dithering (Bayer) und Error Diffusion (Floydâ€“Steinberg) â€” genug, um zu verstehen, was sich beim Algorithmuswechsel Ã¤ndert.',
            },
            step2: {
              kicker: 'Schritt 2',
              body:
                'Ein kleines Set an Rezepten und Reglern fÃ¼r schnelle Ergebnisse: Schwellwert, Serpentine, Paletten und typische Artefakte.',
            },
          },

          whatIs: {
            title: 'Was ist Dithering? (Definition)',
            body:
              'In der Computergrafik ist Dithering eine Technik, fehlende Tonwerte zu approximieren, indem Pixel aus der verfÃ¼gbaren Palette verteilt werden. Statt eines glatten Verlaufs (der nach Quantisierung oft nicht mÃ¶glich ist) entsteht ein kontrolliertes Muster, das das Auge als Zwischenton wahrnimmt.',
            point1: 'Reduziert sichtbares Banding in VerlÃ¤ufen',
            point2: 'Macht limitierte Paletten reicher (Farbdithering)',
            point3: 'Erzeugt eine Retro-/Pixel-Art-Textur',
          },

          families: {
            title: 'Die zwei Hauptfamilien',
            ordered: {
              title: 'Ordered Dithering (Bayer-Matrix)',
              body:
                'Ordered Dithering vergleicht die Helligkeit jedes Pixels mit einer sich wiederholenden Schwellwertmatrix. Es ist extrem schnell und vorhersehbar; der â€žpatternâ€œ-Look ist oft fÃ¼r Pixel Art und stylisierte Grafiken gewÃ¼nscht.',
              cta: 'Bayer 4Ã—4 ansehen',
              point1: 'Ideal, wenn du ein wiederholbares, kontrolliertes Muster willst.',
              point2: 'Typisches Artefakt: sichtbare Tiles bzw. â€žGridâ€œ-Look (MatrixgrÃ¶ÃŸe zÃ¤hlt).',
            },
            error: {
              title: 'Error Diffusion (Floydâ€“Steinberg)',
              body:
                'Error Diffusion quantisiert einen Pixel und verteilt den Quantisierungsfehler auf Nachbarn. Das wirkt oft â€žorganischerâ€œ und liefert glattere VerlÃ¤ufe als Ordered Dithering.',
              cta: 'Floydâ€“Steinberg ansehen',
              point1: 'Sehr gut fÃ¼r Fotos und VerlÃ¤ufe; versteckt Banding oft gut.',
              point2: 'Artefakte: WÃ¼rmer/Streifen oder gerichtetes Rauschen (Serpentine hilft).',
            },
            tryInTool: 'Im Tool ausprobieren',
          },

          color: {
            title: 'Farbdithering vs Graustufen',
            body:
              'Graustufen-Dithering approximiert Tonwerte mit Schwarz/WeiÃŸ (oder wenigen Graustufen). Farbdithering macht das Gleiche mit einer begrenzten Farbpalette. Die gewÃ¤hlte Palette prÃ¤gt den Look stark: kleine Paletten wirken 8â€‘bit, grÃ¶ÃŸere Paletten machen Farbrampen weicher.',
          },

          when: {
            title: 'Wann Dithering verwenden',
            good: {
              title: 'Ideal fÃ¼r',
              1: 'VerlÃ¤ufe und Himmel (Banding reduzieren)',
              2: 'Pixel Art, Retro/CRT-Ã„sthetik',
              3: 'Print-artige Halftone- und Stipple-Stile',
            },
            avoid: {
              title: 'Vermeiden, wenn',
              1: 'Perfekt glatte TonÃ¼bergÃ¤nge nÃ¶tig sind',
              2: 'Feiner Text extrem scharf bleiben muss',
              3: 'Rauschen oder Muster stÃ¶ren wÃ¼rden',
            },
          },

          faq: {
            title: 'FAQ',
            q1: 'Ordered Dithering vs Error Diffusion: was ist der Unterschied?',
            a1:
              'Ordered Dithering nutzt eine wiederholte Schwellwertmatrix (schnell, gemustert, deterministisch). Error Diffusion verteilt Fehler auf Nachbarn (oft glatter, organischer). WÃ¤hle je nach gewÃ¼nschter Textur.',
            q2: 'Was ist Floydâ€“Steinberg Dithering?',
            a2:
              'Floydâ€“Steinberg ist ein klassischer Error-Diffusion-Algorithmus mit festen Gewichten. Ein guter Standard fÃ¼r glatte VerlÃ¤ufe und feines Korn.',
            q3: 'Was ist eine Bayer-Matrix?',
            a3:
              'Eine Bayer-Matrix ist ein kleines geordnetes Schwellwertmuster (4Ã—4, 8Ã—8, â€¦) fÃ¼r Ordered Dithering. Es erzeugt eine wiederholte Struktur mit gut erkennbarer, pixel-freundlicher Textur.',
          },

          next: {
            title: 'Als NÃ¤chstes: Techniken ausprobieren',
            body:
              'Nimm ein Bild mit VerlÃ¤ufen und vergleiche Bayer vs Floydâ€“Steinberg. Danach probiere eine limitierte Palette, um Farbdithering zu sehen.',
            cta1: 'Tool Ã¶ffnen',
            cta2: 'Algorithmusdetails ansehen',
          },

          basics: {
            seo: {
              title: 'Dithering Basics | Definition, Bayer-Matrix & Error Diffusion',
              description:
                'Dithering-Basics: Definition, warum Dithering Banding reduziert, und wie sich Ordered Dithering (Bayer) von Error Diffusion (Floydâ€“Steinberg) unterscheidet.',
            },
            title: 'Basics',
            lead:
              'Ein sauberes Fundament: was Dithering ist, welches Problem es lÃ¶st und wie sich die zwei Hauptfamilien verhalten.',
            whatIs: {
              bodyTail:
                'ist eine Technik, zusÃ¤tzliche Tonwerte zu simulieren, indem Pixel in Muster angeordnet werden. In der Grafik wird Dithering hÃ¤ufig nach Quantisierung (Reduktion von Farben/Graustufen) genutzt, um Banding zu verringern und einen Dither-Effekt zu erzeugen.',
            },
            ditherVsDithering: {
              title: 'Dither vs dithering',
              body:
                ': beide meinen dasselbe: Muster/Rauschen nutzen, um Quantisierungsstufen zu kaschieren. Das Ziel ist nicht echte Detailsteigerung, sondern eine andere Wahrnehmung der Tonstufen.',
            },
            bandings: {
              title: 'Warum Dithering Banding reduziert',
              body:
                'Banding entsteht, wenn ein glatter Verlauf in zu wenige Stufen gezwungen wird (z. B. 256 â†’ 16). Dithering verteilt fehlende Tonwerte in ein Muster, sodass das Auge einen glatteren Ãœbergang wahrnimmt.',
              point1: 'Quantisierung reduziert Tonwerte/Farben; Dithering versteckt die â€žStufenâ€œ.',
              point2: 'Algorithmen tauschen Geschwindigkeit, Textur und Artefakte gegeneinander aus.',
            },
            whenToUse: {
              title: 'Wann welche Methode',
              ordered: 'Ordered Dithering wÃ¤hlen, wennâ€¦',
              ordered1: 'Du ein klares, wiederholbares Muster willst (Pixel Art / UI-Icons).',
              ordered2: 'Du Geschwindigkeit oder deterministische Ergebnisse brauchst.',
              error: 'Error Diffusion wÃ¤hlen, wennâ€¦',
              error1: 'Du Fotos/Images ditherst und glattere VerlÃ¤ufe willst.',
              error2: 'Du Banding nach Palettenreduktion verstecken mÃ¶chtest.',
            },
            history: {
              title: 'Eine sehr kurze Geschichte',
              body:
                'Dithering taucht Ã¼berall dort auf, wo Bilder mit weniger Tonwerten dargestellt oder gedruckt werden mÃ¼ssen. FrÃ¼he Displays und Drucker machten es essenziell; heute ist es auch eine bewusste Stil-Textur.',
              body2:
                'Moderne Tools erlauben die Wahl zwischen strukturierten Ordered-Mustern und organischer Error Diffusion â€” mit unterschiedlichen Trade-offs bei Geschwindigkeit, Textur und Artefakten.',
            },
            keyTerms: {
              title: 'Begriffe (kurzes Glossar)',
              quantization: 'Quantisierung',
              quantizationTail: ': Reduktion der verfÃ¼gbaren Tonwerte/Farben.',
              threshold: 'Schwellwert',
              thresholdTail: ': Cutoff, um hell/dunkel zu entscheiden (bei vielen Algorithmen).',
              bayer: 'Bayer-Matrix',
              bayerTail: ': wiederholte Schwellwertmatrix fÃ¼r Ordered Dithering.',
              palette: 'Palette',
              paletteTail:
                ': feste Farbmenge; Farbdithering approximiert das Bild nur mit diesen Farben.',
            },
            sources: {
              title: 'Quellen & weiterfÃ¼hrendes',
            },
            ctaHome: 'ZurÃ¼ck zur Education',
            ctaNext: 'Weiter zu Practice',
          },

          practice: {
            seo: {
              title: 'Dithering Practice | Einstellungen, Artefakte & schnelle Rezepte',
              description:
                'Praxis-Tipps: ein Workflow, was die Einstellungen machen, und wie man typische Dithering-Artefakte in Bildern behebt.',
            },
            title: 'Practice',
            lead:
              'Ein praktischer Workflow: Algorithmus wÃ¤hlen, Regler feinjustieren, Artefakte beheben und sauber exportieren.',
            workflow: {
              title: 'Ein einfacher 3â€‘Schrittâ€‘Workflow',
              lead:
                'Wenn du unsicher bist, liefert dieser Ablauf schnell konsistente Ergebnisse. Er passt direkt zu den Controls im Image-Tool.',
              step1: {
                kicker: 'Schritt 1',
                title: 'Algorithmusfamilie wÃ¤hlen',
                body:
                  'FÃ¼r Fotos/VerlÃ¤ufe starte mit Error Diffusion (Floydâ€“Steinberg, Sierra). FÃ¼r Pixel Art und klare Struktur starte mit Ordered Dithering (Bayer, Blue Noise).',
              },
              step2: {
                kicker: 'Schritt 2',
                title: 'Ton und Skalierung einstellen',
                body:
                  'ArbeitsauflÃ¶sung fÃ¼r Speed vs Detail setzen, dann Kontrast/Gamma/Highlights (und optional Blur) anpassen, damit MitteltÃ¶ne und Kanten vor dem Dithering stimmen.',
              },
              step3: {
                kicker: 'Schritt 3',
                title: 'Feintuning + Export',
                body:
                  'Schwellwert/Inversion, Serpentine (bei Diffusion), Palette und algorithmusspezifische Optionen anpassen. Wenn es passt: Export in OriginalauflÃ¶sung.',
              },
            },
            recipes: {
              title: 'Schnelle Rezepte',
              photo: {
                title: 'Fotos (natÃ¼rliche Textur)',
                li1: 'Mit Floydâ€“Steinberg oder einer Sierra-Variante starten, dann Schwellwert tweaken.',
                li2: 'Serpentine aktivieren, wenn diagonale Artefakte sichtbar sind.',
                li3:
                  'Kleine Palette (4â€“16) fÃ¼r Stylization; grÃ¶ÃŸere Palette fÃ¼r weichere Tonwerte.',
                li4:
                  'Wenn Schatten zu noisy sind: Kontrast senken, Midtones (Gamma) anpassen oder leichtes Blur hinzufÃ¼gen.',
              },
              pixel: {
                title: 'Pixel Art / Icons (saubere Struktur)',
                li1: 'Ordered Dithering (Bayer 4Ã—4 oder 8Ã—8) fÃ¼r vorhersehbare Muster testen.',
                li2:
                  'Paletten klein halten (2â€“8 Farben) und Schwellwert nutzen, um Musterdichte zu steuern.',
                li3: 'Bei sichtbarem Tiling MatrixgrÃ¶ÃŸe wechseln (4Ã—4 â†’ 8Ã—8 â†’ 16Ã—16).',
              },
            },
            controls: {
              title: 'Was die wichtigsten Controls tun',
              lead:
                'Diese Liste entspricht den Controls im Image-Tool. Einige erscheinen nur bei bestimmten Algorithmen (z. B. ASCII-Ramp oder Custom Kernel).',
              algorithm: 'Algorithmus',
              algorithmTail:
                ': wÃ¤hlt die Methode (Error Diffusion, Bayer/Ordered, Blue Noise, usw.). Das Ã¤ndert Textur, Artefakte und Performance.',
              threshold2:
                ': verschiebt den Cutoff. Niedriger â†’ mehr dunkle Pixel; hÃ¶her â†’ mehr helle Pixel.',
              invert: 'Invert',
              invertTail:
                ': invertiert Tonwerte (dunkel â†” hell). Praktisch fÃ¼r Negativ-Looks oder umgedrehte Paletten.',
              resolution2:
                ': Verarbeitungsskala fÃ¼r Preview/Work. Niedriger = schneller und grÃ¶ber; hÃ¶her = schÃ¤rfer und langsamer. Export kann trotzdem in OriginalauflÃ¶sung erfolgen.',
              contrast: 'Kontrast',
              contrastTail:
                ': Voranpassung des Kontrasts vor dem Dithering. Kleine Ã„nderungen kÃ¶nnen Schatten/Highlights stark beeinflussen.',
              midtones: 'Midtones (Gamma)',
              midtonesTail:
                ': verschiebt die Helligkeitskurve. Gut, um MitteltÃ¶ne zu retten, ohne Schwarz/WeiÃŸ zu zerstÃ¶ren.',
              highlights: 'Highlights',
              highlightsTail:
                ': schiebt helle Bereiche Richtung WeiÃŸ. Kann Speckling reduzieren.',
              blur: 'Blur',
              blurTail:
                ': optionales Vor-Blur, um Hochfrequenzrauschen zu reduzieren und VerlÃ¤ufe sauberer zu dithern.',
              palette2:
                ': begrenzt Ausgabefarben. Kleine Paletten stylisieren stÃ¤rker; grÃ¶ÃŸere erhalten VerlÃ¤ufe. Custom Palettes erlauben exakte Farben.',
              serpentine2:
                ': bei unterstÃ¼tzter Error Diffusion wechselt die Scanrichtung pro Zeile und reduziert gerichtete Streifen.',
              serpentinePattern: 'Serpentine-Muster',
              serpentinePatternTail:
                ': bestimmt, wie Serpentine scannt (beeinflusst gerichtete Artefakte).',
              errorStrength: 'Error-Diffusion-StÃ¤rke',
              errorStrengthTail:
                ': skaliert, wie viel Fehler verteilt wird. Niedriger kann cleaner wirken; hÃ¶her schÃ¤rfer, aber noisier.',
              asciiRamp: 'ASCII-Ramp',
              asciiRampTail:
                ': nur fÃ¼r ASCII Mosaic. Legt fest, welche Zeichen dunkel â†’ hell darstellen.',
              customKernel: 'Custom Kernel + Divisor',
              customKernelTail:
                ': nur fÃ¼r Custom Kernel. Du definierst Matrix und Divisor, um neue Diffusionsverhalten zu testen.',
              grid: 'Grid Overlay',
              gridTail:
                ': Preview-Hilfe fÃ¼r Pixel-Alignment. Ã„ndert nicht den Export; hilft beim Beurteilen der Musterskala.',
              gridSize: 'Grid Size',
              gridSizeTail:
                ': Ã¤ndert den Grid-Abstand in Pixeln fÃ¼r die ZielauflÃ¶sung.',
              presets: 'Presets / Randomize / Share',
              presetsTail:
                ': Settings speichern, randomisieren und einen Share-Link kopieren, der Parameter kodiert.',
              export: 'Export',
              exportTail:
                ': Download als PNG/JPEG/WebP (und SVG fÃ¼r Bilder). Export kann in OriginalauflÃ¶sung erzeugt werden.',
            },
            artifacts: {
              title: 'Typische Artefakte (und was hilft)',
              banding: 'Banding',
              bandingTail: ': Error Diffusion nutzen, Serpentine testen und ArbeitsauflÃ¶sung erhÃ¶hen.',
              tiles: 'Sichtbare Tiles',
              tilesTail: ': grÃ¶ÃŸere Ordered-Matrix wÃ¤hlen oder zu Error Diffusion wechseln.',
              worms: 'WÃ¼rmer / Streifen',
              wormsTail: ': Serpentine aktivieren, Kontrast leicht senken oder anderes Diffusions-Kernel testen.',
            },
            prev: 'â† Basics',
            ctaExplorer: 'Algorithmen erkunden',
            finish: 'Fertig: Tool Ã¶ffnen',
          },
        },
      };

export default education;


