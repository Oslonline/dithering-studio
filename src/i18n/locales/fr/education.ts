const education = {
        education: {
          seo: {
            title: 'Qu’est-ce que le dithering ? Dithering ordonné, diffusion d’erreur & Floyd–Steinberg',
            description:
              'Découvrez la définition du dithering et les principales méthodes (dithering ordonné/matrice de Bayer et diffusion d’erreur/Floyd–Steinberg). Quand utiliser le dithering couleur et comment l’essayer en ligne.',
          },

          header: {
            title: 'Éducation',
            navTool: 'Outil',
            navReference: 'Référence',
            navHome: 'Accueil',
            navEducation: 'Éducation',
          },

          title: 'Éducation au dithering',
          heroImageAlt: 'Bannière éducation au dithering',

          strong: {
            dithering: 'Dithering',
            definition: 'Définition :',
            tip: 'Astuce :',
            wikipedia: 'Wikipédia',
            ordered: 'Dithering ordonné',
            threshold: 'Seuil',
            workingResolution: 'Résolution de travail',
            palette: 'Palette',
            serpentine: 'Serpentin',
          },

          lead: {
            tail:
              "est une façon de simuler plus de tons et de couleurs qu’une palette (ou un écran) ne peut en afficher, en ajoutant volontairement un motif ou du bruit. Il sert à réduire le banding dans les dégradés, à créer un rendu rétro/pixel art et à imiter les trames d’impression.",
          },

          cta: {
            openTool: 'Ouvrir l’outil',
            basics: 'Commencer par Bases',
            practice: 'Aller à Pratique',
            tryImage: 'Essayer sur une image',
            tryVideo: 'Essayer sur une vidéo',
            exploreAlgorithms: 'Explorer les algorithmes',
          },

          preview: {
            title: 'Un exemple rapide (réglages aléatoires)',
            hint: 'Faites glisser le curseur',
            loading: 'Génération de l’aperçu…',
            fallback: 'Aperçu indisponible sur cet appareil.',
          },

          onboarding: {
            title: 'Commencez ici (2 étapes)',
            body:
              'Si vous débutez, suivez ce petit parcours : apprenez les notions clés, puis appliquez-les avec quelques recettes pratiques.',
            step1: {
              kicker: 'Étape 1',
              body:
                'Définition, dithering ordonné (Bayer) et diffusion d’erreur (Floyd–Steinberg) — juste ce qu’il faut pour comprendre ce qui change en passant d’un algorithme à l’autre.',
            },
            step2: {
              kicker: 'Étape 2',
              body:
                'Un petit ensemble de recettes et de réglages pour de bons résultats rapidement : seuil, serpentin, palettes et artefacts courants.',
            },
          },

          whatIs: {
            title: 'Qu’est-ce que le dithering ? (Définition)',
            body:
              'En infographie, le dithering est une technique qui approxime des tons manquants en répartissant des pixels issus d’une palette limitée. Au lieu d’un dégradé lisse (souvent impossible après quantification), on obtient un motif contrôlé que l’œil mélange en un ton intermédiaire.',
            point1: 'Réduit le banding visible dans les dégradés',
            point2: 'Rend les palettes limitées plus riches (dithering couleur)',
            point3: 'Crée une texture rétro / pixel art',
          },

          families: {
            title: 'Les deux grandes familles',
            ordered: {
              title: 'Dithering ordonné (matrice de Bayer)',
              body:
                'Le dithering ordonné compare la luminosité de chaque pixel à une matrice de seuils répétée. C’est extrêmement rapide et prévisible, et son rendu « structuré » est souvent recherché pour le pixel art.',
              cta: 'Voir Bayer 4×4',
              point1: 'Idéal si vous voulez un motif répétitif et maîtrisé.',
              point2: 'Artefact courant : tuilage visible ou effet « grille » (la taille de matrice compte).',
            },
            error: {
              title: 'Diffusion d’erreur (Floyd–Steinberg)',
              body:
                'La diffusion d’erreur quantifie un pixel puis diffuse l’erreur de quantification vers les voisins. Le résultat est souvent plus « organique » et les dégradés paraissent plus lisses qu’en dithering ordonné.',
              cta: 'Voir Floyd–Steinberg',
              point1: 'Très bon pour les photos et les dégradés ; masque bien le banding.',
              point2: 'Artefacts : « vers »/stries ou bruit directionnel (le mode serpentin aide).',
            },
            tryInTool: 'Essayer dans l’outil',
          },

          color: {
            title: 'Dithering couleur vs niveaux de gris',
            body:
              'Le dithering en niveaux de gris approxime des tons avec du noir/blanc (ou quelques gris). Le dithering couleur fait la même chose avec un nombre limité de couleurs. La palette choisie influence fortement le rendu : petite palette pour un look 8‑bit, grande palette pour des dégradés plus doux.',
          },

          when: {
            title: 'Quand utiliser le dithering',
            good: {
              title: 'Idéal pour',
              1: 'Dégradés et ciels (réduire le banding)',
              2: 'Pixel art, esthétique rétro/CRT',
              3: 'Styles halftone et stipple façon impression',
            },
            avoid: {
              title: 'À éviter si',
              1: 'Vous avez besoin de transitions parfaitement lisses',
              2: 'Un texte fin doit rester très net',
              3: 'Le bruit ou les motifs seraient gênants',
            },
          },

          faq: {
            title: 'FAQ',
            q1: 'Dithering ordonné vs diffusion d’erreur : quelle différence ?',
            a1:
              'Le dithering ordonné utilise une matrice de seuil répétée (rapide, structuré, déterministe). La diffusion d’erreur propage l’erreur vers les voisins (souvent plus doux, plus organique). Choisissez selon la texture souhaitée.',
            q2: 'Qu’est-ce que le dithering de Floyd–Steinberg ?',
            a2:
              'Floyd–Steinberg est un algorithme classique de diffusion d’erreur qui répartit l’erreur de quantification sur des pixels voisins avec des poids fixes. C’est un bon choix par défaut pour des dégradés plus lisses.',
            q3: 'Qu’est-ce qu’une matrice de Bayer ?',
            a3:
              'Une matrice de Bayer est un petit motif de seuil ordonné (4×4, 8×8, etc.) utilisé en dithering ordonné. Elle crée une structure répétitive qui donne une texture reconnaissable, souvent appréciée en pixel art.',
          },

          next: {
            title: 'Ensuite : essayez les techniques',
            body:
              'Choisissez une image avec des dégradés et comparez Bayer vs Floyd–Steinberg. Puis testez une palette limitée pour voir le dithering couleur en action.',
            cta1: 'Ouvrir l’outil',
            cta2: 'Voir les détails des algorithmes',
          },

          basics: {
            seo: {
              title: 'Bases du dithering | Définition, matrice de Bayer & diffusion d’erreur',
              description:
                'Les bases du dithering : définition, réduction du banding, et différences entre dithering ordonné (Bayer) et diffusion d’erreur (Floyd–Steinberg).',
            },
            title: 'Bases',
            lead:
              'Une base claire : ce qu’est le dithering, quel problème il résout, et comment se comportent les deux familles principales.',
            whatIs: {
              bodyTail:
                'est une technique qui simule des tons supplémentaires en organisant les pixels en motifs. En infographie, on l’utilise souvent après quantification (réduction des couleurs ou des niveaux de gris) pour réduire le banding et créer un effet de trame.',
            },
            ditherVsDithering: {
              title: 'Dither vs dithering',
              body:
                ': on dit “dither” (verbe) ou “dithering” (nom) pour la même idée : utiliser un motif/bruit pour masquer les marches dues à la quantification. Le but n’est pas d’ajouter du détail réel, mais de changer la perception des paliers.',
            },
            bandings: {
              title: 'Pourquoi le dithering réduit le banding',
              body:
                'Le banding apparaît lorsqu’un dégradé lisse est forcé dans trop peu de niveaux (par ex. 256 → 16). Le dithering répartit ces tons manquants dans un motif pour donner l’illusion d’une transition plus lisse.',
              point1: 'La quantification réduit les tons/couleurs ; le dithering masque les “marches”.',
              point2: 'Chaque algorithme échange vitesse, texture et artefacts.',
            },
            whenToUse: {
              title: 'Quand utiliser quoi',
              ordered: 'Choisissez le dithering ordonné si…',
              ordered1: 'Vous voulez un motif propre et répétable (pixel art / icônes UI).',
              ordered2: 'Vous avez besoin de vitesse ou de résultats déterministes.',
              error: 'Choisissez la diffusion d’erreur si…',
              error1: 'Vous ditherisez des images/photos et voulez des dégradés plus doux.',
              error2: 'Vous essayez de masquer le banding après réduction de palette.',
            },
            history: {
              title: 'Une très courte histoire',
              body:
                'Le dithering apparaît partout où une image doit être affichée ou imprimée avec moins de tons que l’original. Les premiers écrans et imprimantes l’ont rendu indispensable ; aujourd’hui, c’est aussi une texture artistique.',
              body2:
                'Les outils modernes permettent de choisir entre motifs ordonnés et diffusion d’erreur plus organique, chacun avec ses compromis (vitesse, texture, artefacts).',
            },
            keyTerms: {
              title: 'Termes clés (mini glossaire)',
              quantization: 'Quantification',
              quantizationTail: ' : réduction du nombre de tons ou de couleurs disponibles.',
              threshold: 'Seuil',
              thresholdTail:
                ' : valeur de coupure utilisée pour décider clair/foncé dans de nombreux algorithmes.',
              bayer: 'Matrice de Bayer',
              bayerTail: ' : matrice de seuils répétée utilisée en dithering ordonné.',
              palette: 'Palette',
              paletteTail:
                ' : ensemble fixe de couleurs ; le dithering couleur n’utilise que ces couleurs pour approximer l’image.',
            },
            sources: {
              title: 'Sources & lecture',
            },
            ctaHome: 'Retour à Éducation',
            ctaNext: 'Continuer vers Pratique',
          },

          practice: {
            seo: {
              title: 'Pratique du dithering | Réglages, artefacts et recettes rapides',
              description:
                'Conseils pratiques : workflow en 3 étapes, impact des réglages, et comment corriger les artefacts de dithering sur vos images.',
            },
            title: 'Pratique',
            lead:
              'Un workflow concret : choisir l’algorithme, régler les contrôles, corriger les artefacts, puis exporter en qualité optimale.',
            workflow: {
              title: 'Un workflow simple en 3 étapes',
              lead:
                'Si vous ne savez pas par où commencer, ce flux donne de bons résultats rapidement. Il correspond aux réglages visibles dans l’outil Image.',
              step1: {
                kicker: 'Étape 1',
                title: 'Choisir la famille d’algorithmes',
                body:
                  'Pour les photos/dégradés, commencez par la diffusion d’erreur (Floyd–Steinberg, variantes Sierra). Pour le pixel art et une structure propre, commencez par le dithering ordonné (Bayer, blue noise).',
              },
              step2: {
                kicker: 'Étape 2',
                title: 'Soigner le ton et l’échelle',
                body:
                  'Réglez la résolution de travail (vitesse vs détail), puis ajustez contraste/gamma/hautes lumières (et un léger flou) pour stabiliser les tons avant le dithering.',
              },
              step3: {
                kicker: 'Étape 3',
                title: 'Ajuster + exporter',
                body:
                  'Réglez seuil/inversion, options serpentin (diffusion), palette, et réglages spécifiques. Quand le rendu est bon, exportez à la résolution originale.',
              },
            },
            recipes: {
              title: 'Recettes rapides',
              photo: {
                title: 'Photos (texture naturelle)',
                li1: 'Commencez avec Floyd–Steinberg ou une variante Sierra, puis ajustez le seuil.',
                li2: 'Activez le serpentin si vous voyez des stries directionnelles.',
                li3:
                  'Petite palette (4–16) pour styliser ; palette plus large pour conserver des tons doux.',
                li4:
                  'Si les ombres sont trop bruitées, réduisez le contraste, ajustez les midtones (gamma) ou ajoutez un léger flou.',
              },
              pixel: {
                title: 'Pixel art / icônes (structure propre)',
                li1: 'Essayez le dithering ordonné (Bayer 4×4 ou 8×8) pour un motif prévisible.',
                li2:
                  'Gardez une palette serrée (2–8 couleurs) et ajustez le seuil pour contrôler la densité du motif.',
                li3: 'Si le tuilage est visible, changez la taille de matrice (4×4 → 8×8 → 16×16).',
              },
            },
            controls: {
              title: 'À quoi servent les principaux réglages',
              lead:
                'Cette liste reflète les contrôles de l’outil Image. Certains réglages n’apparaissent que pour certains algorithmes (par ex. rampe ASCII ou noyau personnalisé).',
              algorithm: 'Algorithme',
              algorithmTail:
                ' : choisit la méthode (diffusion d’erreur, Bayer, blue noise, etc.). Cela change la texture, les artefacts et les performances.',
              threshold2:
                ' : déplace le point de coupure. Plus bas → plus de pixels sombres ; plus haut → plus de pixels clairs.',
              invert: 'Inverser',
              invertTail:
                ' : inverse les tons (sombre ↔ clair). Utile pour un rendu négatif ou une palette inversée.',
              resolution2:
                ' : échelle de traitement pour l’aperçu. Plus bas = plus rapide et plus “grossier”; plus haut = plus net et plus lent. L’export peut rester à la résolution originale.',
              contrast: 'Contraste',
              contrastTail:
                ' : pré-ajuste le contraste avant dithering. De petits changements peuvent fortement affecter le bruit dans les ombres/hautes lumières.',
              midtones: 'Midtones (gamma)',
              midtonesTail:
                ' : modifie la courbe de luminosité. Pratique pour récupérer les tons moyens sans écraser noirs/blancs.',
              highlights: 'Hautes lumières',
              highlightsTail:
                ' : pousse les zones claires vers le blanc. Peut réduire le “grain” sur les reflets.',
              blur: 'Flou',
              blurTail:
                ' : flou optionnel avant dithering pour lisser le bruit et améliorer les dégradés.',
              palette2:
                ' : limite les couleurs de sortie. Petite palette = rendu plus stylisé; grande palette = tons plus fidèles. Les palettes personnalisées permettent des couleurs exactes.',
              serpentine2:
                ' : pour certaines diffusions d’erreur, alterne le sens de balayage à chaque ligne pour réduire les stries.',
              serpentinePattern: 'Motif serpentin',
              serpentinePatternTail:
                ' : choisit le comportement du serpentin (influe sur les artefacts directionnels).',
              errorStrength: 'Intensité de diffusion d’erreur',
              errorStrengthTail:
                ' : règle la quantité d’erreur diffusée. Plus bas = plus propre; plus haut = plus net mais plus bruité.',
              asciiRamp: 'Rampe ASCII',
              asciiRampTail:
                ' : seulement pour ASCII Mosaic. Définit les caractères du sombre → clair.',
              customKernel: 'Noyau personnalisé + diviseur',
              customKernelTail:
                ' : seulement pour Noyau personnalisé. Vous définissez la matrice et le diviseur pour expérimenter.',
              grid: 'Grille',
              gridTail:
                ' : aide visuelle d’alignement. N’affecte pas l’export; aide à juger l’échelle du motif.',
              gridSize: 'Taille de grille',
              gridSizeTail:
                ' : change l’espacement en pixels pour correspondre à votre résolution cible.',
              presets: 'Presets / aléatoire / partage',
              presetsTail:
                ' : enregistrez des réglages, randomisez pour l’inspiration et copiez un lien de partage qui encode les paramètres.',
              export: 'Export',
              exportTail:
                ' : téléchargez en PNG/JPEG/WebP (et SVG pour les images). L’export peut être généré à la résolution originale pour une meilleure qualité.',
            },
            artifacts: {
              title: 'Artefacts courants (et quoi essayer)',
              banding: 'Banding',
              bandingTail: ' : utilisez la diffusion d’erreur, activez le serpentin et augmentez la résolution de travail.',
              tiles: 'Tuilage visible',
              tilesTail: ' : choisissez une matrice ordonnée plus grande ou passez à la diffusion d’erreur.',
              worms: 'Vers / stries',
              wormsTail: ' : activez le serpentin, baissez un peu le contraste ou changez de noyau de diffusion.',
            },
            prev: '← Bases',
            ctaExplorer: 'Explorer les algorithmes',
            finish: 'Fin : ouvrir l’outil',
          },
        },
      };

export default education;


