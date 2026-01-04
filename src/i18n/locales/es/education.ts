const education = {
      education: {
        seo: {
          title: 'Â¿QuÃ© es el dithering? Dithering ordenado, difusiÃ³n de error y Floydâ€“Steinberg',
          description:
            'Aprende la definiciÃ³n de dithering y los mÃ©todos principales (dithering ordenado/matriz Bayer y difusiÃ³n de error/Floydâ€“Steinberg). CuÃ¡ndo usar dithering de color y cÃ³mo probarlo online.',
        },

        header: {
          title: 'EducaciÃ³n',
          navTool: 'Herramienta',
          navReference: 'Referencia',
          navHome: 'Inicio',
          navEducation: 'EducaciÃ³n',
        },

        title: 'EducaciÃ³n de dithering',
        heroImageAlt: 'Banner de educaciÃ³n sobre dithering',

        strong: {
          dithering: 'Dithering',
          definition: 'DefiniciÃ³n:',
          tip: 'Consejo:',
          wikipedia: 'Wikipedia',
          ordered: 'Dithering ordenado',
          threshold: 'Umbral',
          workingResolution: 'ResoluciÃ³n de trabajo',
          palette: 'Paleta',
          serpentine: 'Serpentine',
        },

        lead: {
          tail:
            'es una forma de simular mÃ¡s tonos y colores de los que una paleta (o pantalla) puede mostrar, aÃ±adiendo intencionalmente un patrÃ³n o ruido. Se usa para reducir banding en degradados, crear estÃ©tica retro/pixel art y imitar halftones de impresiÃ³n.',
        },

        cta: {
          openTool: 'Abrir la herramienta',
          basics: 'Empezar con BÃ¡sicos',
          practice: 'Ir a PrÃ¡ctica',
          tryImage: 'Probar con una imagen',
          tryVideo: 'Probar con un video',
          exploreAlgorithms: 'Explorar algoritmos',
        },

        preview: {
          title: 'Un ejemplo rÃ¡pido (ajustes aleatorios)',
          hint: 'Arrastra el deslizador',
          loading: 'Generando vista previaâ€¦',
          fallback: 'Vista previa no disponible en este dispositivo.',
        },

        onboarding: {
          title: 'Empieza aquÃ­ (2 pasos)',
          body:
            'Si eres nuevo en dithering, sigue este camino corto: aprende las ideas clave y luego aplÃ­calas con algunas recetas prÃ¡cticas.',
          step1: {
            kicker: 'Paso 1',
            body:
              'DefiniciÃ³n, dithering ordenado (Bayer) y difusiÃ³n de error (Floydâ€“Steinberg) â€” lo justo para entender quÃ© cambia al cambiar de algoritmo.',
          },
          step2: {
            kicker: 'Paso 2',
            body:
              'Un conjunto pequeÃ±o de recetas y controles para obtener buenos resultados rÃ¡pido: umbral, serpentine, paletas y artefactos comunes.',
          },
        },

        whatIs: {
          title: 'Â¿QuÃ© es el dithering? (DefiniciÃ³n)',
          body:
            'En grÃ¡ficos por computadora, el dithering es una tÃ©cnica que aproxima tonos faltantes distribuyendo pÃ­xeles de una paleta disponible. En lugar de un degradado suave (que puede no ser posible tras cuantizar), se obtiene un patrÃ³n controlado que el ojo mezcla como un tono intermedio.',
          point1: 'Reduce el banding visible en degradados',
          point2: 'Hace que paletas limitadas se vean mÃ¡s ricas (dithering de color)',
          point3: 'Crea una textura retro / pixel art',
        },

        families: {
          title: 'Las dos familias principales',
          ordered: {
            title: 'Dithering ordenado (matriz Bayer)',
            body:
              'El dithering ordenado compara el brillo de cada pÃ­xel con una matriz de umbrales repetida. Es extremadamente rÃ¡pido y predecible, y su â€œlookâ€ con patrÃ³n suele ser deseable en pixel art.',
            cta: 'Ver Bayer 4Ã—4',
            point1: 'Ideal si quieres un patrÃ³n repetible y controlado.',
            point2: 'Artefacto comÃºn: tiles visibles o aspecto de â€œrejillaâ€ (importa el tamaÃ±o de la matriz).',
          },
          error: {
            title: 'DifusiÃ³n de error (Floydâ€“Steinberg)',
            body:
              'La difusiÃ³n de error cuantiza un pÃ­xel y reparte el error de cuantizaciÃ³n entre pÃ­xeles vecinos. Suele producir texturas mÃ¡s â€œnaturalesâ€ y degradados mÃ¡s suaves que el dithering ordenado.',
            cta: 'Ver Floydâ€“Steinberg',
            point1: 'Muy buena para fotos y degradados; oculta bien el banding.',
            point2: 'Artefactos: â€œwormsâ€/rayas o ruido direccional (serpentine ayuda).',
          },
          tryInTool: 'Probar en la herramienta',
        },

        color: {
          title: 'Dithering de color vs escala de grises',
          body:
            'El dithering en escala de grises aproxima tonos usando negro/blanco (o pocos grises). El dithering de color hace lo mismo con un conjunto limitado de colores. La paleta elegida cambia mucho el resultado: usa una paleta pequeÃ±a para un look 8â€‘bit, o una mÃ¡s grande para rampas de color mÃ¡s suaves.',
        },

        when: {
          title: 'CuÃ¡ndo usar dithering',
          good: {
            title: 'Ideal para',
            1: 'Degradados y cielos (reducir banding)',
            2: 'Pixel art, estÃ©tica retro/CRT',
            3: 'Estilos tipo halftone y stipple de impresiÃ³n',
          },
          avoid: {
            title: 'Evitar cuando',
            1: 'Necesitas transiciones perfectamente suaves',
            2: 'El texto fino debe quedar muy nÃ­tido',
            3: 'El ruido o los patrones distraerÃ­an',
          },
        },

        faq: {
          title: 'FAQ',
          q1: 'Dithering ordenado vs difusiÃ³n de error: Â¿cuÃ¡l es la diferencia?',
          a1:
            'El dithering ordenado usa una matriz repetida (rÃ¡pido, con patrÃ³n, determinista). La difusiÃ³n de error reparte el error a vecinos (a menudo mÃ¡s suave y orgÃ¡nico). Elige segÃºn la textura que quieras.',
          q2: 'Â¿QuÃ© es el dithering de Floydâ€“Steinberg?',
          a2:
            'Floydâ€“Steinberg es un algoritmo clÃ¡sico de difusiÃ³n de error que reparte el error con pesos fijos. Es un buen valor por defecto si quieres degradados suaves y una textura fina.',
          q3: 'Â¿QuÃ© es una matriz Bayer?',
          a3:
            'Una matriz Bayer es un patrÃ³n pequeÃ±o de umbrales ordenados (4Ã—4, 8Ã—8, etc.) para dithering ordenado. Crea una estructura repetitiva con una textura reconocible, muy Ãºtil en pixel art.',
        },

        next: {
          title: 'Siguiente: prueba las tÃ©cnicas',
          body:
            'Elige una imagen con degradados y compara Bayer vs Floydâ€“Steinberg. Luego prueba una paleta limitada para ver el dithering de color en acciÃ³n.',
          cta1: 'Abrir la herramienta',
          cta2: 'Ver detalles de algoritmos',
        },

        basics: {
          seo: {
            title: 'BÃ¡sicos de dithering | DefiniciÃ³n, matriz Bayer y difusiÃ³n de error',
            description:
              'BÃ¡sicos: definiciÃ³n, cÃ³mo reduce el banding y diferencias entre dithering ordenado (Bayer) y difusiÃ³n de error (Floydâ€“Steinberg).',
          },
          title: 'BÃ¡sicos',
          lead:
            'Una base rÃ¡pida: quÃ© es, quÃ© problema resuelve y cÃ³mo se comportan las dos familias principales.',
          whatIs: {
            bodyTail:
              'es una tÃ©cnica que simula tonos extra organizando pÃ­xeles en patrones. Se usa a menudo tras cuantizar (reducir colores o niveles de grises) para reducir banding y crear un efecto de dithering.',
          },
          ditherVsDithering: {
            title: 'Dither vs dithering',
            body:
              ': se usa â€œditherâ€ (verbo) o â€œditheringâ€ (sustantivo) para la misma idea: usar patrones/ruido para ocultar escalones de cuantizaciÃ³n. No aÃ±ade detalle real; cambia cÃ³mo se perciben los pasos de tono.',
          },
          bandings: {
            title: 'Por quÃ© el dithering reduce el banding',
            body:
              'El banding aparece cuando un degradado suave se fuerza a pocos niveles (por ejemplo, 256 â†’ 16). El dithering reparte los tonos faltantes en un patrÃ³n para que el ojo perciba una transiciÃ³n mÃ¡s suave.',
            point1: 'La cuantizaciÃ³n reduce tonos/colores; el dithering oculta los â€œescalonesâ€.',
            point2: 'Cada algoritmo intercambia velocidad, textura y artefactos.',
          },
          whenToUse: {
            title: 'CuÃ¡ndo usar cuÃ¡l',
            ordered: 'Elige dithering ordenado cuandoâ€¦',
            ordered1: 'Quieres un patrÃ³n limpio y repetible (pixel art / iconos UI).',
            ordered2: 'Necesitas velocidad o resultados deterministas.',
            error: 'Elige difusiÃ³n de error cuandoâ€¦',
            error1: 'Ditherizas fotos/imÃ¡genes y quieres degradados mÃ¡s suaves.',
            error2: 'Intentas ocultar banding tras reducir la paleta.',
          },
          history: {
            title: 'Una historia muy breve',
            body:
              'El dithering aparece cuando una imagen debe mostrarse o imprimirse con menos tonos que el original. En pantallas e impresoras antiguas era esencial; hoy tambiÃ©n se usa como textura artÃ­stica.',
            body2:
              'Las herramientas modernas permiten elegir entre patrones ordenados y difusiÃ³n de error mÃ¡s orgÃ¡nica, con diferentes compromisos de velocidad, textura y artefactos.',
          },
          keyTerms: {
            title: 'TÃ©rminos clave (mini glosario)',
            quantization: 'CuantizaciÃ³n',
            quantizationTail: ': reducir la cantidad de tonos o colores disponibles.',
            threshold: 'Umbral',
            thresholdTail:
              ': punto de corte usado por muchos algoritmos para decidir salida clara/oscura.',
            bayer: 'Matriz Bayer',
            bayerTail: ': matriz de umbrales repetida usada en dithering ordenado.',
            palette: 'Paleta',
            paletteTail:
              ': conjunto fijo de colores; el dithering de color aproxima la imagen usando solo esos colores.',
          },
          sources: {
            title: 'Fuentes y lecturas',
          },
          ctaHome: 'Volver a EducaciÃ³n',
          ctaNext: 'Continuar a PrÃ¡ctica',
        },

        practice: {
          seo: {
            title: 'PrÃ¡ctica de dithering | Ajustes, artefactos y recetas rÃ¡pidas',
            description:
              'Consejos prÃ¡cticos: flujo paso a paso, quÃ© hace cada ajuste y cÃ³mo corregir artefactos comunes de dithering en imÃ¡genes.',
          },
          title: 'PrÃ¡ctica',
          lead:
            'Un flujo prÃ¡ctico: elige un algoritmo, ajusta controles, corrige artefactos y exporta resultados limpios.',
          workflow: {
            title: 'Un flujo simple de 3 pasos',
            lead:
              'Si no sabes por dÃ³nde empezar, este flujo da resultados consistentes. TambiÃ©n coincide con los controles de la herramienta de Imagen.',
            step1: {
              kicker: 'Paso 1',
              title: 'Elige la familia de algoritmos',
              body:
                'Para fotos/degradados, empieza con difusiÃ³n de error (Floydâ€“Steinberg, Sierra). Para pixel art y estructura limpia, empieza con ordenado (Bayer, blue noise).',
            },
            step2: {
              kicker: 'Paso 2',
              title: 'Ajusta tono y escala',
              body:
                'Configura la resoluciÃ³n de trabajo para equilibrar velocidad y detalle, y ajusta contraste/gamma/altas luces (y un blur opcional) antes de ditherizar.',
            },
            step3: {
              kicker: 'Paso 3',
              title: 'Ajusta y exporta',
              body:
                'Ajusta umbral/invertir, opciones serpentine (difusiÃ³n), paleta y opciones especÃ­ficas del algoritmo. Cuando quede bien, exporta a resoluciÃ³n original.',
            },
          },
          recipes: {
            title: 'Recetas rÃ¡pidas',
            photo: {
              title: 'Fotos (textura natural)',
              li1: 'Empieza con Floydâ€“Steinberg o una Sierra y ajusta el umbral.',
              li2: 'Activa serpentine si ves artefactos diagonales direccionales.',
              li3:
                'Usa paleta pequeÃ±a (4â€“16) para estilizar; mantÃ©n mÃ¡s grande para tonos mÃ¡s suaves.',
              li4:
                'Si las sombras se ven ruidosas, reduce contraste, ajusta midtones (gamma) o aÃ±ade un blur ligero.',
            },
            pixel: {
              title: 'Pixel art / iconos (estructura limpia)',
              li1: 'Prueba ordenado (Bayer 4Ã—4 u 8Ã—8) para patrones predecibles.',
              li2:
                'MantÃ©n paletas pequeÃ±as (2â€“8 colores) y ajusta umbral para controlar densidad.',
              li3: 'Si ves tiles repetidos, cambia el tamaÃ±o (4Ã—4 â†’ 8Ã—8 â†’ 16Ã—16).',
            },
          },
          controls: {
            title: 'QuÃ© hacen los controles principales',
            lead:
              'Esta lista refleja los controles de la herramienta de Imagen. Algunos aparecen solo en algoritmos concretos (por ejemplo, rampa ASCII o Kernel personalizado).',
            algorithm: 'Algoritmo',
            algorithmTail:
              ': elige el mÃ©todo (difusiÃ³n de error, Bayer/ordenado, blue noise, etc.). Cambia textura, artefactos y rendimiento.',
            threshold2:
              ': mueve el punto de corte. Valores mÃ¡s bajos â†’ mÃ¡s pÃ­xeles oscuros; valores mÃ¡s altos â†’ mÃ¡s pÃ­xeles claros.',
            invert: 'Invertir',
            invertTail:
              ': invierte tonos (oscuro â†” claro). Ãštil para look negativo o paletas invertidas.',
            resolution2:
              ': escala de procesamiento para vista previa/trabajo. MÃ¡s baja = mÃ¡s rÃ¡pido y mÃ¡s â€œcuadriculadoâ€; mÃ¡s alta = mÃ¡s nÃ­tido y mÃ¡s lento. Puedes exportar a resoluciÃ³n original.',
            contrast: 'Contraste',
            contrastTail:
              ': preajuste de contraste antes del dithering. Cambios pequeÃ±os pueden afectar mucho el ruido en sombras/luces.',
            midtones: 'Midtones (gamma)',
            midtonesTail:
              ': ajusta la curva de brillo. Muy Ãºtil para recuperar medios tonos sin aplastar negros/blancos.',
            highlights: 'Altas luces',
            highlightsTail:
              ': empuja Ã¡reas brillantes hacia blanco. Ayuda a simplificar brillos y reducir â€œspecklingâ€.',
            blur: 'Blur',
            blurTail:
              ': blur opcional previo para reducir ruido de alta frecuencia y mejorar degradados.',
            palette2:
              ': limita colores de salida. Paletas pequeÃ±as estilizan; paletas grandes preservan gradientes. Paletas personalizadas permiten colores exactos.',
            serpentine2:
              ': para difusiÃ³n de error compatible, alterna direcciÃ³n por fila para reducir rayas direccionales.',
            serpentinePattern: 'PatrÃ³n serpentine',
            serpentinePatternTail:
              ': elige cÃ³mo se comporta el escaneo serpentine (afecta artefactos direccionales).',
            errorStrength: 'Intensidad de difusiÃ³n de error',
            errorStrengthTail:
              ': escala cuÃ¡nto error se difunde. MÃ¡s bajo puede verse mÃ¡s limpio; mÃ¡s alto mÃ¡s nÃ­tido pero mÃ¡s ruidoso.',
            asciiRamp: 'Rampa ASCII',
            asciiRampTail:
              ': solo para ASCII Mosaic. Define quÃ© caracteres representan oscuro â†’ claro.',
            customKernel: 'Kernel personalizado + divisor',
            customKernelTail:
              ': solo para Kernel personalizado. Define la matriz y divisor para experimentar con difusiÃ³n.',
            grid: 'Rejilla',
            gridTail:
              ': ayuda visual para alineaciÃ³n. No cambia la exportaciÃ³n; ayuda a juzgar escala del patrÃ³n.',
            gridSize: 'TamaÃ±o de rejilla',
            gridSizeTail:
              ': cambia el espaciado en pÃ­xeles para que coincida con tu resoluciÃ³n objetivo.',
            presets: 'Presets / aleatorio / compartir',
            presetsTail:
              ': guarda y reutiliza ajustes, randomiza para inspiraciÃ³n y copia un enlace que codifica los parÃ¡metros actuales.',
            export: 'Exportar',
            exportTail:
              ': descarga PNG/JPEG/WebP (y SVG para imÃ¡genes). La exportaciÃ³n puede generarse a resoluciÃ³n original para mÃ¡xima calidad.',
          },
          artifacts: {
            title: 'Artefactos comunes (y quÃ© probar)',
            banding: 'Banding',
            bandingTail: ': usa difusiÃ³n de error, prueba serpentine y sube la resoluciÃ³n de trabajo.',
            tiles: 'Tiles visibles',
            tilesTail: ': elige una matriz ordenada mÃ¡s grande o cambia a difusiÃ³n de error.',
            worms: 'Worms / rayas',
            wormsTail: ': activa serpentine, baja un poco el contraste o prueba otro kernel de difusiÃ³n.',
          },
          prev: 'â† BÃ¡sicos',
          ctaExplorer: 'Explorar algoritmos',
          finish: 'Final: abrir la herramienta',
        },
      },
    };

export default education;


