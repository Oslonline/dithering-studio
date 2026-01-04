const education = {
        education: {
          seo: {
            title: 'Quâ€™est-ce que le dithering ? Dithering ordonnÃ©, diffusion dâ€™erreur & Floydâ€“Steinberg',
            description:
              'DÃ©couvrez la dÃ©finition du dithering et les principales mÃ©thodes (dithering ordonnÃ©/matrice de Bayer et diffusion dâ€™erreur/Floydâ€“Steinberg). Quand utiliser le dithering couleur et comment lâ€™essayer en ligne.',
          },

          header: {
            title: 'Ã‰ducation',
            navTool: 'Outil',
            navReference: 'RÃ©fÃ©rence',
            navHome: 'Accueil',
            navEducation: 'Ã‰ducation',
          },

          title: 'Ã‰ducation au dithering',
          heroImageAlt: 'BanniÃ¨re Ã©ducation au dithering',

          strong: {
            dithering: 'Dithering',
            definition: 'DÃ©finition :',
            tip: 'Astuce :',
            wikipedia: 'WikipÃ©dia',
            ordered: 'Dithering ordonnÃ©',
            threshold: 'Seuil',
            workingResolution: 'RÃ©solution de travail',
            palette: 'Palette',
            serpentine: 'Serpentin',
          },

          lead: {
            tail:
              "est une faÃ§on de simuler plus de tons et de couleurs quâ€™une palette (ou un Ã©cran) ne peut en afficher, en ajoutant volontairement un motif ou du bruit. Il sert Ã  rÃ©duire le banding dans les dÃ©gradÃ©s, Ã  crÃ©er un rendu rÃ©tro/pixel art et Ã  imiter les trames dâ€™impression.",
          },

          cta: {
            openTool: 'Ouvrir lâ€™outil',
            basics: 'Commencer par Bases',
            practice: 'Aller Ã  Pratique',
            tryImage: 'Essayer sur une image',
            tryVideo: 'Essayer sur une vidÃ©o',
            exploreAlgorithms: 'Explorer les algorithmes',
          },

          preview: {
            title: 'Un exemple rapide (rÃ©glages alÃ©atoires)',
            hint: 'Faites glisser le curseur',
            loading: 'GÃ©nÃ©ration de lâ€™aperÃ§uâ€¦',
            fallback: 'AperÃ§u indisponible sur cet appareil.',
          },

          onboarding: {
            title: 'Commencez ici (2 Ã©tapes)',
            body:
              'Si vous dÃ©butez, suivez ce petit parcours : apprenez les notions clÃ©s, puis appliquez-les avec quelques recettes pratiques.',
            step1: {
              kicker: 'Ã‰tape 1',
              body:
                'DÃ©finition, dithering ordonnÃ© (Bayer) et diffusion dâ€™erreur (Floydâ€“Steinberg) â€” juste ce quâ€™il faut pour comprendre ce qui change en passant dâ€™un algorithme Ã  lâ€™autre.',
            },
            step2: {
              kicker: 'Ã‰tape 2',
              body:
                'Un petit ensemble de recettes et de rÃ©glages pour de bons rÃ©sultats rapidement : seuil, serpentin, palettes et artefacts courants.',
            },
          },

          whatIs: {
            title: 'Quâ€™est-ce que le dithering ? (DÃ©finition)',
            body:
              'En infographie, le dithering est une technique qui approxime des tons manquants en rÃ©partissant des pixels issus dâ€™une palette limitÃ©e. Au lieu dâ€™un dÃ©gradÃ© lisse (souvent impossible aprÃ¨s quantification), on obtient un motif contrÃ´lÃ© que lâ€™Å“il mÃ©lange en un ton intermÃ©diaire.',
            point1: 'RÃ©duit le banding visible dans les dÃ©gradÃ©s',
            point2: 'Rend les palettes limitÃ©es plus riches (dithering couleur)',
            point3: 'CrÃ©e une texture rÃ©tro / pixel art',
          },

          families: {
            title: 'Les deux grandes familles',
            ordered: {
              title: 'Dithering ordonnÃ© (matrice de Bayer)',
              body:
                'Le dithering ordonnÃ© compare la luminositÃ© de chaque pixel Ã  une matrice de seuils rÃ©pÃ©tÃ©e. Câ€™est extrÃªmement rapide et prÃ©visible, et son rendu Â« structurÃ© Â» est souvent recherchÃ© pour le pixel art.',
              cta: 'Voir Bayer 4Ã—4',
              point1: 'IdÃ©al si vous voulez un motif rÃ©pÃ©titif et maÃ®trisÃ©.',
              point2: 'Artefact courant : tuilage visible ou effet Â« grille Â» (la taille de matrice compte).',
            },
            error: {
              title: 'Diffusion dâ€™erreur (Floydâ€“Steinberg)',
              body:
                'La diffusion dâ€™erreur quantifie un pixel puis diffuse lâ€™erreur de quantification vers les voisins. Le rÃ©sultat est souvent plus Â« organique Â» et les dÃ©gradÃ©s paraissent plus lisses quâ€™en dithering ordonnÃ©.',
              cta: 'Voir Floydâ€“Steinberg',
              point1: 'TrÃ¨s bon pour les photos et les dÃ©gradÃ©s ; masque bien le banding.',
              point2: 'Artefacts : Â« vers Â»/stries ou bruit directionnel (le mode serpentin aide).',
            },
            tryInTool: 'Essayer dans lâ€™outil',
          },

          color: {
            title: 'Dithering couleur vs niveaux de gris',
            body:
              'Le dithering en niveaux de gris approxime des tons avec du noir/blanc (ou quelques gris). Le dithering couleur fait la mÃªme chose avec un nombre limitÃ© de couleurs. La palette choisie influence fortement le rendu : petite palette pour un look 8â€‘bit, grande palette pour des dÃ©gradÃ©s plus doux.',
          },

          when: {
            title: 'Quand utiliser le dithering',
            good: {
              title: 'IdÃ©al pour',
              1: 'DÃ©gradÃ©s et ciels (rÃ©duire le banding)',
              2: 'Pixel art, esthÃ©tique rÃ©tro/CRT',
              3: 'Styles halftone et stipple faÃ§on impression',
            },
            avoid: {
              title: 'Ã€ Ã©viter si',
              1: 'Vous avez besoin de transitions parfaitement lisses',
              2: 'Un texte fin doit rester trÃ¨s net',
              3: 'Le bruit ou les motifs seraient gÃªnants',
            },
          },

          faq: {
            title: 'FAQ',
            q1: 'Dithering ordonnÃ© vs diffusion dâ€™erreur : quelle diffÃ©rence ?',
            a1:
              'Le dithering ordonnÃ© utilise une matrice de seuil rÃ©pÃ©tÃ©e (rapide, structurÃ©, dÃ©terministe). La diffusion dâ€™erreur propage lâ€™erreur vers les voisins (souvent plus doux, plus organique). Choisissez selon la texture souhaitÃ©e.',
            q2: 'Quâ€™est-ce que le dithering de Floydâ€“Steinberg ?',
            a2:
              'Floydâ€“Steinberg est un algorithme classique de diffusion dâ€™erreur qui rÃ©partit lâ€™erreur de quantification sur des pixels voisins avec des poids fixes. Câ€™est un bon choix par dÃ©faut pour des dÃ©gradÃ©s plus lisses.',
            q3: 'Quâ€™est-ce quâ€™une matrice de Bayer ?',
            a3:
              'Une matrice de Bayer est un petit motif de seuil ordonnÃ© (4Ã—4, 8Ã—8, etc.) utilisÃ© en dithering ordonnÃ©. Elle crÃ©e une structure rÃ©pÃ©titive qui donne une texture reconnaissable, souvent apprÃ©ciÃ©e en pixel art.',
          },

          next: {
            title: 'Ensuite : essayez les techniques',
            body:
              'Choisissez une image avec des dÃ©gradÃ©s et comparez Bayer vs Floydâ€“Steinberg. Puis testez une palette limitÃ©e pour voir le dithering couleur en action.',
            cta1: 'Ouvrir lâ€™outil',
            cta2: 'Voir les dÃ©tails des algorithmes',
          },

          basics: {
            seo: {
              title: 'Bases du dithering | DÃ©finition, matrice de Bayer & diffusion dâ€™erreur',
              description:
                'Les bases du dithering : dÃ©finition, rÃ©duction du banding, et diffÃ©rences entre dithering ordonnÃ© (Bayer) et diffusion dâ€™erreur (Floydâ€“Steinberg).',
            },
            title: 'Bases',
            lead:
              'Une base claire : ce quâ€™est le dithering, quel problÃ¨me il rÃ©sout, et comment se comportent les deux familles principales.',
            whatIs: {
              bodyTail:
                'est une technique qui simule des tons supplÃ©mentaires en organisant les pixels en motifs. En infographie, on lâ€™utilise souvent aprÃ¨s quantification (rÃ©duction des couleurs ou des niveaux de gris) pour rÃ©duire le banding et crÃ©er un effet de trame.',
            },
            ditherVsDithering: {
              title: 'Dither vs dithering',
              body:
                ': on dit â€œditherâ€ (verbe) ou â€œditheringâ€ (nom) pour la mÃªme idÃ©e : utiliser un motif/bruit pour masquer les marches dues Ã  la quantification. Le but nâ€™est pas dâ€™ajouter du dÃ©tail rÃ©el, mais de changer la perception des paliers.',
            },
            bandings: {
              title: 'Pourquoi le dithering rÃ©duit le banding',
              body:
                'Le banding apparaÃ®t lorsquâ€™un dÃ©gradÃ© lisse est forcÃ© dans trop peu de niveaux (par ex. 256 â†’ 16). Le dithering rÃ©partit ces tons manquants dans un motif pour donner lâ€™illusion dâ€™une transition plus lisse.',
              point1: 'La quantification rÃ©duit les tons/couleurs ; le dithering masque les â€œmarchesâ€.',
              point2: 'Chaque algorithme Ã©change vitesse, texture et artefacts.',
            },
            whenToUse: {
              title: 'Quand utiliser quoi',
              ordered: 'Choisissez le dithering ordonnÃ© siâ€¦',
              ordered1: 'Vous voulez un motif propre et rÃ©pÃ©table (pixel art / icÃ´nes UI).',
              ordered2: 'Vous avez besoin de vitesse ou de rÃ©sultats dÃ©terministes.',
              error: 'Choisissez la diffusion dâ€™erreur siâ€¦',
              error1: 'Vous ditherisez des images/photos et voulez des dÃ©gradÃ©s plus doux.',
              error2: 'Vous essayez de masquer le banding aprÃ¨s rÃ©duction de palette.',
            },
            history: {
              title: 'Une trÃ¨s courte histoire',
              body:
                'Le dithering apparaÃ®t partout oÃ¹ une image doit Ãªtre affichÃ©e ou imprimÃ©e avec moins de tons que lâ€™original. Les premiers Ã©crans et imprimantes lâ€™ont rendu indispensable ; aujourdâ€™hui, câ€™est aussi une texture artistique.',
              body2:
                'Les outils modernes permettent de choisir entre motifs ordonnÃ©s et diffusion dâ€™erreur plus organique, chacun avec ses compromis (vitesse, texture, artefacts).',
            },
            keyTerms: {
              title: 'Termes clÃ©s (mini glossaire)',
              quantization: 'Quantification',
              quantizationTail: ' : rÃ©duction du nombre de tons ou de couleurs disponibles.',
              threshold: 'Seuil',
              thresholdTail:
                ' : valeur de coupure utilisÃ©e pour dÃ©cider clair/foncÃ© dans de nombreux algorithmes.',
              bayer: 'Matrice de Bayer',
              bayerTail: ' : matrice de seuils rÃ©pÃ©tÃ©e utilisÃ©e en dithering ordonnÃ©.',
              palette: 'Palette',
              paletteTail:
                ' : ensemble fixe de couleurs ; le dithering couleur nâ€™utilise que ces couleurs pour approximer lâ€™image.',
            },
            sources: {
              title: 'Sources & lecture',
            },
            ctaHome: 'Retour Ã  Ã‰ducation',
            ctaNext: 'Continuer vers Pratique',
          },

          practice: {
            seo: {
              title: 'Pratique du dithering | RÃ©glages, artefacts et recettes rapides',
              description:
                'Conseils pratiques : workflow en 3 Ã©tapes, impact des rÃ©glages, et comment corriger les artefacts de dithering sur vos images.',
            },
            title: 'Pratique',
            lead:
              'Un workflow concret : choisir lâ€™algorithme, rÃ©gler les contrÃ´les, corriger les artefacts, puis exporter en qualitÃ© optimale.',
            workflow: {
              title: 'Un workflow simple en 3 Ã©tapes',
              lead:
                'Si vous ne savez pas par oÃ¹ commencer, ce flux donne de bons rÃ©sultats rapidement. Il correspond aux rÃ©glages visibles dans lâ€™outil Image.',
              step1: {
                kicker: 'Ã‰tape 1',
                title: 'Choisir la famille dâ€™algorithmes',
                body:
                  'Pour les photos/dÃ©gradÃ©s, commencez par la diffusion dâ€™erreur (Floydâ€“Steinberg, variantes Sierra). Pour le pixel art et une structure propre, commencez par le dithering ordonnÃ© (Bayer, blue noise).',
              },
              step2: {
                kicker: 'Ã‰tape 2',
                title: 'Soigner le ton et lâ€™Ã©chelle',
                body:
                  'RÃ©glez la rÃ©solution de travail (vitesse vs dÃ©tail), puis ajustez contraste/gamma/hautes lumiÃ¨res (et un lÃ©ger flou) pour stabiliser les tons avant le dithering.',
              },
              step3: {
                kicker: 'Ã‰tape 3',
                title: 'Ajuster + exporter',
                body:
                  'RÃ©glez seuil/inversion, options serpentin (diffusion), palette, et rÃ©glages spÃ©cifiques. Quand le rendu est bon, exportez Ã  la rÃ©solution originale.',
              },
            },
            recipes: {
              title: 'Recettes rapides',
              photo: {
                title: 'Photos (texture naturelle)',
                li1: 'Commencez avec Floydâ€“Steinberg ou une variante Sierra, puis ajustez le seuil.',
                li2: 'Activez le serpentin si vous voyez des stries directionnelles.',
                li3:
                  'Petite palette (4â€“16) pour styliser ; palette plus large pour conserver des tons doux.',
                li4:
                  'Si les ombres sont trop bruitÃ©es, rÃ©duisez le contraste, ajustez les midtones (gamma) ou ajoutez un lÃ©ger flou.',
              },
              pixel: {
                title: 'Pixel art / icÃ´nes (structure propre)',
                li1: 'Essayez le dithering ordonnÃ© (Bayer 4Ã—4 ou 8Ã—8) pour un motif prÃ©visible.',
                li2:
                  'Gardez une palette serrÃ©e (2â€“8 couleurs) et ajustez le seuil pour contrÃ´ler la densitÃ© du motif.',
                li3: 'Si le tuilage est visible, changez la taille de matrice (4Ã—4 â†’ 8Ã—8 â†’ 16Ã—16).',
              },
            },
            controls: {
              title: 'Ã€ quoi servent les principaux rÃ©glages',
              lead:
                'Cette liste reflÃ¨te les contrÃ´les de lâ€™outil Image. Certains rÃ©glages nâ€™apparaissent que pour certains algorithmes (par ex. rampe ASCII ou noyau personnalisÃ©).',
              algorithm: 'Algorithme',
              algorithmTail:
                ' : choisit la mÃ©thode (diffusion dâ€™erreur, Bayer, blue noise, etc.). Cela change la texture, les artefacts et les performances.',
              threshold2:
                ' : dÃ©place le point de coupure. Plus bas â†’ plus de pixels sombres ; plus haut â†’ plus de pixels clairs.',
              invert: 'Inverser',
              invertTail:
                ' : inverse les tons (sombre â†” clair). Utile pour un rendu nÃ©gatif ou une palette inversÃ©e.',
              resolution2:
                ' : Ã©chelle de traitement pour lâ€™aperÃ§u. Plus bas = plus rapide et plus â€œgrossierâ€; plus haut = plus net et plus lent. Lâ€™export peut rester Ã  la rÃ©solution originale.',
              contrast: 'Contraste',
              contrastTail:
                ' : prÃ©-ajuste le contraste avant dithering. De petits changements peuvent fortement affecter le bruit dans les ombres/hautes lumiÃ¨res.',
              midtones: 'Midtones (gamma)',
              midtonesTail:
                ' : modifie la courbe de luminositÃ©. Pratique pour rÃ©cupÃ©rer les tons moyens sans Ã©craser noirs/blancs.',
              highlights: 'Hautes lumiÃ¨res',
              highlightsTail:
                ' : pousse les zones claires vers le blanc. Peut rÃ©duire le â€œgrainâ€ sur les reflets.',
              blur: 'Flou',
              blurTail:
                ' : flou optionnel avant dithering pour lisser le bruit et amÃ©liorer les dÃ©gradÃ©s.',
              palette2:
                ' : limite les couleurs de sortie. Petite palette = rendu plus stylisÃ©; grande palette = tons plus fidÃ¨les. Les palettes personnalisÃ©es permettent des couleurs exactes.',
              serpentine2:
                ' : pour certaines diffusions dâ€™erreur, alterne le sens de balayage Ã  chaque ligne pour rÃ©duire les stries.',
              serpentinePattern: 'Motif serpentin',
              serpentinePatternTail:
                ' : choisit le comportement du serpentin (influe sur les artefacts directionnels).',
              errorStrength: 'IntensitÃ© de diffusion dâ€™erreur',
              errorStrengthTail:
                ' : rÃ¨gle la quantitÃ© dâ€™erreur diffusÃ©e. Plus bas = plus propre; plus haut = plus net mais plus bruitÃ©.',
              asciiRamp: 'Rampe ASCII',
              asciiRampTail:
                ' : seulement pour ASCII Mosaic. DÃ©finit les caractÃ¨res du sombre â†’ clair.',
              customKernel: 'Noyau personnalisÃ© + diviseur',
              customKernelTail:
                ' : seulement pour Noyau personnalisÃ©. Vous dÃ©finissez la matrice et le diviseur pour expÃ©rimenter.',
              grid: 'Grille',
              gridTail:
                ' : aide visuelle dâ€™alignement. Nâ€™affecte pas lâ€™export; aide Ã  juger lâ€™Ã©chelle du motif.',
              gridSize: 'Taille de grille',
              gridSizeTail:
                ' : change lâ€™espacement en pixels pour correspondre Ã  votre rÃ©solution cible.',
              presets: 'Presets / alÃ©atoire / partage',
              presetsTail:
                ' : enregistrez des rÃ©glages, randomisez pour lâ€™inspiration et copiez un lien de partage qui encode les paramÃ¨tres.',
              export: 'Export',
              exportTail:
                ' : tÃ©lÃ©chargez en PNG/JPEG/WebP (et SVG pour les images). Lâ€™export peut Ãªtre gÃ©nÃ©rÃ© Ã  la rÃ©solution originale pour une meilleure qualitÃ©.',
            },
            artifacts: {
              title: 'Artefacts courants (et quoi essayer)',
              banding: 'Banding',
              bandingTail: ' : utilisez la diffusion dâ€™erreur, activez le serpentin et augmentez la rÃ©solution de travail.',
              tiles: 'Tuilage visible',
              tilesTail: ' : choisissez une matrice ordonnÃ©e plus grande ou passez Ã  la diffusion dâ€™erreur.',
              worms: 'Vers / stries',
              wormsTail: ' : activez le serpentin, baissez un peu le contraste ou changez de noyau de diffusion.',
            },
            prev: 'â† Bases',
            ctaExplorer: 'Explorer les algorithmes',
            finish: 'Fin : ouvrir lâ€™outil',
          },
        },
      };

export default education;


