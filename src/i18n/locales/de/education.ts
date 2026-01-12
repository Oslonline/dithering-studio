const education = {
        education: {
          seo: {
            title: 'Was ist Dithering? Ordered Dithering, Error Diffusion & Floyd–Steinberg',
            description:
              'Lerne die Dithering-Definition und die wichtigsten Methoden (Ordered Dithering/Bayer-Matrix und Error Diffusion/Floyd–Steinberg). Wann Farbdithering hilft und wie du es online ausprobierst.',
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
            workingResolution: 'Arbeitsauflösung',
            palette: 'Palette',
            serpentine: 'Serpentine',
          },

          lead: {
            tail:
              'ist eine Methode, mehr Tonwerte und Farben zu simulieren als eine Palette (oder ein Display) darstellen kann, indem bewusst ein Muster oder Rauschen hinzugefügt wird. Es reduziert Banding in Verläufen, erzeugt Retro/Pixel-Art-Looks und imitiert Druck-Halftones.',
          },

          cta: {
            openTool: 'Tool öffnen',
            basics: 'Mit Basics starten',
            practice: 'Zu Practice',
            tryImage: 'An einem Bild ausprobieren',
            tryVideo: 'An einem Video ausprobieren',
            exploreAlgorithms: 'Algorithmen erkunden',
          },

          preview: {
            title: 'Ein kurzes Beispiel (zufällige Einstellungen)',
            hint: 'Ziehe den Slider',
            loading: 'Vorschau wird erstellt…',
            fallback: 'Vorschau auf diesem Gerät nicht verfügbar.',
          },

          onboarding: {
            title: 'Starte hier (2 Schritte)',
            body:
              'Wenn du neu bei Dithering bist, folge diesem kurzen Pfad: erst die Grundlagen, dann ein paar praktische Rezepte.',
            step1: {
              kicker: 'Schritt 1',
              body:
                'Definition, Ordered Dithering (Bayer) und Error Diffusion (Floyd–Steinberg) — genug, um zu verstehen, was sich beim Algorithmuswechsel ändert.',
            },
            step2: {
              kicker: 'Schritt 2',
              body:
                'Ein kleines Set an Rezepten und Reglern für schnelle Ergebnisse: Schwellwert, Serpentine, Paletten und typische Artefakte.',
            },
          },

          whatIs: {
            title: 'Was ist Dithering? (Definition)',
            body:
              'In der Computergrafik ist Dithering eine Technik, fehlende Tonwerte zu approximieren, indem Pixel aus der verfügbaren Palette verteilt werden. Statt eines glatten Verlaufs (der nach Quantisierung oft nicht möglich ist) entsteht ein kontrolliertes Muster, das das Auge als Zwischenton wahrnimmt.',
            point1: 'Reduziert sichtbares Banding in Verläufen',
            point2: 'Macht limitierte Paletten reicher (Farbdithering)',
            point3: 'Erzeugt eine Retro-/Pixel-Art-Textur',
          },

          families: {
            title: 'Die zwei Hauptfamilien',
            ordered: {
              title: 'Ordered Dithering (Bayer-Matrix)',
              body:
                'Ordered Dithering vergleicht die Helligkeit jedes Pixels mit einer sich wiederholenden Schwellwertmatrix. Es ist extrem schnell und vorhersehbar; der „pattern“-Look ist oft für Pixel Art und stylisierte Grafiken gewünscht.',
              cta: 'Bayer 4×4 ansehen',
              point1: 'Ideal, wenn du ein wiederholbares, kontrolliertes Muster willst.',
              point2: 'Typisches Artefakt: sichtbare Tiles bzw. „Grid“-Look (Matrixgröße zählt).',
            },
            error: {
              title: 'Error Diffusion (Floyd–Steinberg)',
              body:
                'Error Diffusion quantisiert einen Pixel und verteilt den Quantisierungsfehler auf Nachbarn. Das wirkt oft „organischer“ und liefert glattere Verläufe als Ordered Dithering.',
              cta: 'Floyd–Steinberg ansehen',
              point1: 'Sehr gut für Fotos und Verläufe; versteckt Banding oft gut.',
              point2: 'Artefakte: Würmer/Streifen oder gerichtetes Rauschen (Serpentine hilft).',
            },
            tryInTool: 'Im Tool ausprobieren',
          },

          color: {
            title: 'Farbdithering vs Graustufen',
            body:
              'Graustufen-Dithering approximiert Tonwerte mit Schwarz/Weiß (oder wenigen Graustufen). Farbdithering macht das Gleiche mit einer begrenzten Farbpalette. Die gewählte Palette prägt den Look stark: kleine Paletten wirken 8‑bit, größere Paletten machen Farbrampen weicher.',
          },

          when: {
            title: 'Wann Dithering verwenden',
            good: {
              title: 'Ideal für',
              1: 'Verläufe und Himmel (Banding reduzieren)',
              2: 'Pixel Art, Retro/CRT-Ästhetik',
              3: 'Print-artige Halftone- und Stipple-Stile',
            },
            avoid: {
              title: 'Vermeiden, wenn',
              1: 'Perfekt glatte Tonübergänge nötig sind',
              2: 'Feiner Text extrem scharf bleiben muss',
              3: 'Rauschen oder Muster stören würden',
            },
          },

          faq: {
            title: 'FAQ',
            q1: 'Ordered Dithering vs Error Diffusion: was ist der Unterschied?',
            a1:
              'Ordered Dithering nutzt eine wiederholte Schwellwertmatrix (schnell, gemustert, deterministisch). Error Diffusion verteilt Fehler auf Nachbarn (oft glatter, organischer). Wähle je nach gewünschter Textur.',
            q2: 'Was ist Floyd–Steinberg Dithering?',
            a2:
              'Floyd–Steinberg ist ein klassischer Error-Diffusion-Algorithmus mit festen Gewichten. Ein guter Standard für glatte Verläufe und feines Korn.',
            q3: 'Was ist eine Bayer-Matrix?',
            a3:
              'Eine Bayer-Matrix ist ein kleines geordnetes Schwellwertmuster (4×4, 8×8, …) für Ordered Dithering. Es erzeugt eine wiederholte Struktur mit gut erkennbarer, pixel-freundlicher Textur.',
          },

          next: {
            title: 'Als Nächstes: Techniken ausprobieren',
            body:
              'Nimm ein Bild mit Verläufen und vergleiche Bayer vs Floyd–Steinberg. Danach probiere eine limitierte Palette, um Farbdithering zu sehen.',
            cta1: 'Tool öffnen',
            cta2: 'Algorithmusdetails ansehen',
          },

          basics: {
            seo: {
              title: 'Dithering Basics | Definition, Bayer-Matrix & Error Diffusion',
              description:
                'Dithering-Basics: Definition, warum Dithering Banding reduziert, und wie sich Ordered Dithering (Bayer) von Error Diffusion (Floyd–Steinberg) unterscheidet.',
            },
            title: 'Basics',
            lead:
              'Ein sauberes Fundament: was Dithering ist, welches Problem es löst und wie sich die zwei Hauptfamilien verhalten.',
            whatIs: {
              bodyTail:
                'ist eine Technik, zusätzliche Tonwerte zu simulieren, indem Pixel in Muster angeordnet werden. In der Grafik wird Dithering häufig nach Quantisierung (Reduktion von Farben/Graustufen) genutzt, um Banding zu verringern und einen Dither-Effekt zu erzeugen.',
            },
            ditherVsDithering: {
              title: 'Dither vs dithering',
              body:
                ': beide meinen dasselbe: Muster/Rauschen nutzen, um Quantisierungsstufen zu kaschieren. Das Ziel ist nicht echte Detailsteigerung, sondern eine andere Wahrnehmung der Tonstufen.',
            },
            bandings: {
              title: 'Warum Dithering Banding reduziert',
              body:
                'Banding entsteht, wenn ein glatter Verlauf in zu wenige Stufen gezwungen wird (z. B. 256 → 16). Dithering verteilt fehlende Tonwerte in ein Muster, sodass das Auge einen glatteren Übergang wahrnimmt.',
              point1: 'Quantisierung reduziert Tonwerte/Farben; Dithering versteckt die „Stufen“.',
              point2: 'Algorithmen tauschen Geschwindigkeit, Textur und Artefakte gegeneinander aus.',
            },
            whenToUse: {
              title: 'Wann welche Methode',
              ordered: 'Ordered Dithering wählen, wenn…',
              ordered1: 'Du ein klares, wiederholbares Muster willst (Pixel Art / UI-Icons).',
              ordered2: 'Du Geschwindigkeit oder deterministische Ergebnisse brauchst.',
              error: 'Error Diffusion wählen, wenn…',
              error1: 'Du Fotos/Images ditherst und glattere Verläufe willst.',
              error2: 'Du Banding nach Palettenreduktion verstecken möchtest.',
            },
            history: {
              title: 'Eine sehr kurze Geschichte',
              body:
                'Dithering taucht überall dort auf, wo Bilder mit weniger Tonwerten dargestellt oder gedruckt werden müssen. Frühe Displays und Drucker machten es essenziell; heute ist es auch eine bewusste Stil-Textur.',
              body2:
                'Moderne Tools erlauben die Wahl zwischen strukturierten Ordered-Mustern und organischer Error Diffusion — mit unterschiedlichen Trade-offs bei Geschwindigkeit, Textur und Artefakten.',
            },
            keyTerms: {
              title: 'Begriffe (kurzes Glossar)',
              quantization: 'Quantisierung',
              quantizationTail: ': Reduktion der verfügbaren Tonwerte/Farben.',
              threshold: 'Schwellwert',
              thresholdTail: ': Cutoff, um hell/dunkel zu entscheiden (bei vielen Algorithmen).',
              bayer: 'Bayer-Matrix',
              bayerTail: ': wiederholte Schwellwertmatrix für Ordered Dithering.',
              palette: 'Palette',
              paletteTail:
                ': feste Farbmenge; Farbdithering approximiert das Bild nur mit diesen Farben.',
            },
            sources: {
              title: 'Quellen & weiterführendes',
            },
            ctaHome: 'Zurück zur Education',
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
              'Ein praktischer Workflow: Algorithmus wählen, Regler feinjustieren, Artefakte beheben und sauber exportieren.',
            workflow: {
              title: 'Ein einfacher 3‑Schritt‑Workflow',
              lead:
                'Wenn du unsicher bist, liefert dieser Ablauf schnell konsistente Ergebnisse. Er passt direkt zu den Controls im Image-Tool.',
              step1: {
                kicker: 'Schritt 1',
                title: 'Algorithmusfamilie wählen',
                body:
                  'Für Fotos/Verläufe starte mit Error Diffusion (Floyd–Steinberg, Sierra). Für Pixel Art und klare Struktur starte mit Ordered Dithering (Bayer, Blue Noise).',
              },
              step2: {
                kicker: 'Schritt 2',
                title: 'Ton und Skalierung einstellen',
                body:
                  'Arbeitsauflösung für Speed vs Detail setzen, dann Kontrast/Gamma/Highlights (und optional Blur) anpassen, damit Mitteltöne und Kanten vor dem Dithering stimmen.',
              },
              step3: {
                kicker: 'Schritt 3',
                title: 'Feintuning + Export',
                body:
                  'Schwellwert/Inversion, Serpentine (bei Diffusion), Palette und algorithmusspezifische Optionen anpassen. Wenn es passt: Export in Originalauflösung.',
              },
            },
            recipes: {
              title: 'Schnelle Rezepte',
              photo: {
                title: 'Fotos (natürliche Textur)',
                li1: 'Mit Floyd–Steinberg oder einer Sierra-Variante starten, dann Schwellwert tweaken.',
                li2: 'Serpentine aktivieren, wenn diagonale Artefakte sichtbar sind.',
                li3:
                  'Kleine Palette (4–16) für Stylization; größere Palette für weichere Tonwerte.',
                li4:
                  'Wenn Schatten zu noisy sind: Kontrast senken, Midtones (Gamma) anpassen oder leichtes Blur hinzufügen.',
              },
              pixel: {
                title: 'Pixel Art / Icons (saubere Struktur)',
                li1: 'Ordered Dithering (Bayer 4×4 oder 8×8) für vorhersehbare Muster testen.',
                li2:
                  'Paletten klein halten (2–8 Farben) und Schwellwert nutzen, um Musterdichte zu steuern.',
                li3: 'Bei sichtbarem Tiling Matrixgröße wechseln (4×4 → 8×8 → 16×16).',
              },
            },
            controls: {
              title: 'Was die wichtigsten Controls tun',
              lead:
                'Diese Liste entspricht den Controls im Image-Tool. Einige erscheinen nur bei bestimmten Algorithmen (z. B. ASCII-Ramp oder Custom Kernel).',
              algorithm: 'Algorithmus',
              algorithmTail:
                ': wählt die Methode (Error Diffusion, Bayer/Ordered, Blue Noise, usw.). Das ändert Textur, Artefakte und Performance.',
              threshold2:
                ': verschiebt den Cutoff. Niedriger → mehr dunkle Pixel; höher → mehr helle Pixel.',
              invert: 'Invert',
              invertTail:
                ': invertiert Tonwerte (dunkel ↔ hell). Praktisch für Negativ-Looks oder umgedrehte Paletten.',
              resolution2:
                ': Verarbeitungsskala für Preview/Work. Niedriger = schneller und gröber; höher = schärfer und langsamer. Export kann trotzdem in Originalauflösung erfolgen.',
              contrast: 'Kontrast',
              contrastTail:
                ': Voranpassung des Kontrasts vor dem Dithering. Kleine Änderungen können Schatten/Highlights stark beeinflussen.',
              midtones: 'Midtones (Gamma)',
              midtonesTail:
                ': verschiebt die Helligkeitskurve. Gut, um Mitteltöne zu retten, ohne Schwarz/Weiß zu zerstören.',
              highlights: 'Highlights',
              highlightsTail:
                ': schiebt helle Bereiche Richtung Weiß. Kann Speckling reduzieren.',
              blur: 'Blur',
              blurTail:
                ': optionales Vor-Blur, um Hochfrequenzrauschen zu reduzieren und Verläufe sauberer zu dithern.',
              palette2:
                ': begrenzt Ausgabefarben. Kleine Paletten stylisieren stärker; größere erhalten Verläufe. Custom Palettes erlauben exakte Farben.',
              serpentine2:
                ': bei unterstützter Error Diffusion wechselt die Scanrichtung pro Zeile und reduziert gerichtete Streifen.',
              serpentinePattern: 'Serpentine-Muster',
              serpentinePatternTail:
                ': bestimmt, wie Serpentine scannt (beeinflusst gerichtete Artefakte).',
              errorStrength: 'Error-Diffusion-Stärke',
              errorStrengthTail:
                ': skaliert, wie viel Fehler verteilt wird. Niedriger kann cleaner wirken; höher schärfer, aber noisier.',
              asciiRamp: 'ASCII-Ramp',
              asciiRampTail:
                ': nur für ASCII Mosaic. Legt fest, welche Zeichen dunkel → hell darstellen.',
              customKernel: 'Custom Kernel + Divisor',
              customKernelTail:
                ': nur für Custom Kernel. Du definierst Matrix und Divisor, um neue Diffusionsverhalten zu testen.',
              grid: 'Grid Overlay',
              gridTail:
                ': Preview-Hilfe für Pixel-Alignment. Ändert nicht den Export; hilft beim Beurteilen der Musterskala.',
              gridSize: 'Grid Size',
              gridSizeTail:
                ': ändert den Grid-Abstand in Pixeln für die Zielauflösung.',
              presets: 'Presets / Randomize / Share',
              presetsTail:
                ': Settings speichern, randomisieren und einen Share-Link kopieren, der Parameter kodiert.',
              export: 'Export',
              exportTail:
                ': Download als PNG/JPEG/WebP (und SVG für Bilder). Export kann in Originalauflösung erzeugt werden.',
            },
            artifacts: {
              title: 'Typische Artefakte (und was hilft)',
              banding: 'Banding',
              bandingTail: ': Error Diffusion nutzen, Serpentine testen und Arbeitsauflösung erhöhen.',
              tiles: 'Sichtbare Tiles',
              tilesTail: ': größere Ordered-Matrix wählen oder zu Error Diffusion wechseln.',
              worms: 'Würmer / Streifen',
              wormsTail: ': Serpentine aktivieren, Kontrast leicht senken oder anderes Diffusions-Kernel testen.',
            },
            prev: '← Basics',
            ctaExplorer: 'Algorithmen erkunden',
            finish: 'Fertig: Tool öffnen',
          },
        },
      };

export default education;


