const education = {
      education: {
        seo: {
          title: '¿Qué es el dithering? Dithering ordenado, difusión de error y Floyd–Steinberg',
          description:
            'Aprende la definición de dithering y los métodos principales (dithering ordenado/matriz Bayer y difusión de error/Floyd–Steinberg). Cuándo usar dithering de color y cómo probarlo online.',
        },

        header: {
          title: 'Educación',
          navTool: 'Herramienta',
          navReference: 'Referencia',
          navHome: 'Inicio',
          navEducation: 'Educación',
        },

        title: 'Educación de dithering',
        heroImageAlt: 'Banner de educación sobre dithering',

        strong: {
          dithering: 'Dithering',
          definition: 'Definición:',
          tip: 'Consejo:',
          wikipedia: 'Wikipedia',
          ordered: 'Dithering ordenado',
          threshold: 'Umbral',
          workingResolution: 'Resolución de trabajo',
          palette: 'Paleta',
          serpentine: 'Serpentine',
        },

        lead: {
          tail:
            'es una forma de simular más tonos y colores de los que una paleta (o pantalla) puede mostrar, añadiendo intencionalmente un patrón o ruido. Se usa para reducir banding en degradados, crear estética retro/pixel art y imitar halftones de impresión.',
        },

        cta: {
          openTool: 'Abrir la herramienta',
          basics: 'Empezar con Básicos',
          practice: 'Ir a Práctica',
          tryImage: 'Probar con una imagen',
          tryVideo: 'Probar con un video',
          exploreAlgorithms: 'Explorar algoritmos',
        },

        preview: {
          title: 'Un ejemplo rápido (ajustes aleatorios)',
          hint: 'Arrastra el deslizador',
          loading: 'Generando vista previa…',
          fallback: 'Vista previa no disponible en este dispositivo.',
        },

        onboarding: {
          title: 'Empieza aquí (2 pasos)',
          body:
            'Si eres nuevo en dithering, sigue este camino corto: aprende las ideas clave y luego aplícalas con algunas recetas prácticas.',
          step1: {
            kicker: 'Paso 1',
            body:
              'Definición, dithering ordenado (Bayer) y difusión de error (Floyd–Steinberg) — lo justo para entender qué cambia al cambiar de algoritmo.',
          },
          step2: {
            kicker: 'Paso 2',
            body:
              'Un conjunto pequeño de recetas y controles para obtener buenos resultados rápido: umbral, serpentine, paletas y artefactos comunes.',
          },
        },

        whatIs: {
          title: '¿Qué es el dithering? (Definición)',
          body:
            'En gráficos por computadora, el dithering es una técnica que aproxima tonos faltantes distribuyendo píxeles de una paleta disponible. En lugar de un degradado suave (que puede no ser posible tras cuantizar), se obtiene un patrón controlado que el ojo mezcla como un tono intermedio.',
          point1: 'Reduce el banding visible en degradados',
          point2: 'Hace que paletas limitadas se vean más ricas (dithering de color)',
          point3: 'Crea una textura retro / pixel art',
        },

        families: {
          title: 'Las dos familias principales',
          ordered: {
            title: 'Dithering ordenado (matriz Bayer)',
            body:
              'El dithering ordenado compara el brillo de cada píxel con una matriz de umbrales repetida. Es extremadamente rápido y predecible, y su “look” con patrón suele ser deseable en pixel art.',
            cta: 'Ver Bayer 4×4',
            point1: 'Ideal si quieres un patrón repetible y controlado.',
            point2: 'Artefacto común: tiles visibles o aspecto de “rejilla” (importa el tamaño de la matriz).',
          },
          error: {
            title: 'Difusión de error (Floyd–Steinberg)',
            body:
              'La difusión de error cuantiza un píxel y reparte el error de cuantización entre píxeles vecinos. Suele producir texturas más “naturales” y degradados más suaves que el dithering ordenado.',
            cta: 'Ver Floyd–Steinberg',
            point1: 'Muy buena para fotos y degradados; oculta bien el banding.',
            point2: 'Artefactos: “worms”/rayas o ruido direccional (serpentine ayuda).',
          },
          tryInTool: 'Probar en la herramienta',
        },

        color: {
          title: 'Dithering de color vs escala de grises',
          body:
            'El dithering en escala de grises aproxima tonos usando negro/blanco (o pocos grises). El dithering de color hace lo mismo con un conjunto limitado de colores. La paleta elegida cambia mucho el resultado: usa una paleta pequeña para un look 8‑bit, o una más grande para rampas de color más suaves.',
        },

        when: {
          title: 'Cuándo usar dithering',
          good: {
            title: 'Ideal para',
            1: 'Degradados y cielos (reducir banding)',
            2: 'Pixel art, estética retro/CRT',
            3: 'Estilos tipo halftone y stipple de impresión',
          },
          avoid: {
            title: 'Evitar cuando',
            1: 'Necesitas transiciones perfectamente suaves',
            2: 'El texto fino debe quedar muy nítido',
            3: 'El ruido o los patrones distraerían',
          },
        },

        faq: {
          title: 'FAQ',
          q1: 'Dithering ordenado vs difusión de error: ¿cuál es la diferencia?',
          a1:
            'El dithering ordenado usa una matriz repetida (rápido, con patrón, determinista). La difusión de error reparte el error a vecinos (a menudo más suave y orgánico). Elige según la textura que quieras.',
          q2: '¿Qué es el dithering de Floyd–Steinberg?',
          a2:
            'Floyd–Steinberg es un algoritmo clásico de difusión de error que reparte el error con pesos fijos. Es un buen valor por defecto si quieres degradados suaves y una textura fina.',
          q3: '¿Qué es una matriz Bayer?',
          a3:
            'Una matriz Bayer es un patrón pequeño de umbrales ordenados (4×4, 8×8, etc.) para dithering ordenado. Crea una estructura repetitiva con una textura reconocible, muy útil en pixel art.',
        },

        next: {
          title: 'Siguiente: prueba las técnicas',
          body:
            'Elige una imagen con degradados y compara Bayer vs Floyd–Steinberg. Luego prueba una paleta limitada para ver el dithering de color en acción.',
          cta1: 'Abrir la herramienta',
          cta2: 'Ver detalles de algoritmos',
        },

        basics: {
          seo: {
            title: 'Básicos de dithering | Definición, matriz Bayer y difusión de error',
            description:
              'Básicos: definición, cómo reduce el banding y diferencias entre dithering ordenado (Bayer) y difusión de error (Floyd–Steinberg).',
          },
          title: 'Básicos',
          lead:
            'Una base rápida: qué es, qué problema resuelve y cómo se comportan las dos familias principales.',
          whatIs: {
            bodyTail:
              'es una técnica que simula tonos extra organizando píxeles en patrones. Se usa a menudo tras cuantizar (reducir colores o niveles de grises) para reducir banding y crear un efecto de dithering.',
          },
          ditherVsDithering: {
            title: 'Dither vs dithering',
            body:
              ': se usa “dither” (verbo) o “dithering” (sustantivo) para la misma idea: usar patrones/ruido para ocultar escalones de cuantización. No añade detalle real; cambia cómo se perciben los pasos de tono.',
          },
          bandings: {
            title: 'Por qué el dithering reduce el banding',
            body:
              'El banding aparece cuando un degradado suave se fuerza a pocos niveles (por ejemplo, 256 → 16). El dithering reparte los tonos faltantes en un patrón para que el ojo perciba una transición más suave.',
            point1: 'La cuantización reduce tonos/colores; el dithering oculta los “escalones”.',
            point2: 'Cada algoritmo intercambia velocidad, textura y artefactos.',
          },
          whenToUse: {
            title: 'Cuándo usar cuál',
            ordered: 'Elige dithering ordenado cuando…',
            ordered1: 'Quieres un patrón limpio y repetible (pixel art / iconos UI).',
            ordered2: 'Necesitas velocidad o resultados deterministas.',
            error: 'Elige difusión de error cuando…',
            error1: 'Ditherizas fotos/imágenes y quieres degradados más suaves.',
            error2: 'Intentas ocultar banding tras reducir la paleta.',
          },
          history: {
            title: 'Una historia muy breve',
            body:
              'El dithering aparece cuando una imagen debe mostrarse o imprimirse con menos tonos que el original. En pantallas e impresoras antiguas era esencial; hoy también se usa como textura artística.',
            body2:
              'Las herramientas modernas permiten elegir entre patrones ordenados y difusión de error más orgánica, con diferentes compromisos de velocidad, textura y artefactos.',
          },
          keyTerms: {
            title: 'Términos clave (mini glosario)',
            quantization: 'Cuantización',
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
          ctaHome: 'Volver a Educación',
          ctaNext: 'Continuar a Práctica',
        },

        practice: {
          seo: {
            title: 'Práctica de dithering | Ajustes, artefactos y recetas rápidas',
            description:
              'Consejos prácticos: flujo paso a paso, qué hace cada ajuste y cómo corregir artefactos comunes de dithering en imágenes.',
          },
          title: 'Práctica',
          lead:
            'Un flujo práctico: elige un algoritmo, ajusta controles, corrige artefactos y exporta resultados limpios.',
          workflow: {
            title: 'Un flujo simple de 3 pasos',
            lead:
              'Si no sabes por dónde empezar, este flujo da resultados consistentes. También coincide con los controles de la herramienta de Imagen.',
            step1: {
              kicker: 'Paso 1',
              title: 'Elige la familia de algoritmos',
              body:
                'Para fotos/degradados, empieza con difusión de error (Floyd–Steinberg, Sierra). Para pixel art y estructura limpia, empieza con ordenado (Bayer, blue noise).',
            },
            step2: {
              kicker: 'Paso 2',
              title: 'Ajusta tono y escala',
              body:
                'Configura la resolución de trabajo para equilibrar velocidad y detalle, y ajusta contraste/gamma/altas luces (y un blur opcional) antes de ditherizar.',
            },
            step3: {
              kicker: 'Paso 3',
              title: 'Ajusta y exporta',
              body:
                'Ajusta umbral/invertir, opciones serpentine (difusión), paleta y opciones específicas del algoritmo. Cuando quede bien, exporta a resolución original.',
            },
          },
          recipes: {
            title: 'Recetas rápidas',
            photo: {
              title: 'Fotos (textura natural)',
              li1: 'Empieza con Floyd–Steinberg o una Sierra y ajusta el umbral.',
              li2: 'Activa serpentine si ves artefactos diagonales direccionales.',
              li3:
                'Usa paleta pequeña (4–16) para estilizar; mantén más grande para tonos más suaves.',
              li4:
                'Si las sombras se ven ruidosas, reduce contraste, ajusta midtones (gamma) o añade un blur ligero.',
            },
            pixel: {
              title: 'Pixel art / iconos (estructura limpia)',
              li1: 'Prueba ordenado (Bayer 4×4 u 8×8) para patrones predecibles.',
              li2:
                'Mantén paletas pequeñas (2–8 colores) y ajusta umbral para controlar densidad.',
              li3: 'Si ves tiles repetidos, cambia el tamaño (4×4 → 8×8 → 16×16).',
            },
          },
          controls: {
            title: 'Qué hacen los controles principales',
            lead:
              'Esta lista refleja los controles de la herramienta de Imagen. Algunos aparecen solo en algoritmos concretos (por ejemplo, rampa ASCII o Kernel personalizado).',
            algorithm: 'Algoritmo',
            algorithmTail:
              ': elige el método (difusión de error, Bayer/ordenado, blue noise, etc.). Cambia textura, artefactos y rendimiento.',
            threshold2:
              ': mueve el punto de corte. Valores más bajos → más píxeles oscuros; valores más altos → más píxeles claros.',
            invert: 'Invertir',
            invertTail:
              ': invierte tonos (oscuro ↔ claro). Útil para look negativo o paletas invertidas.',
            resolution2:
              ': escala de procesamiento para vista previa/trabajo. Más baja = más rápido y más “cuadriculado”; más alta = más nítido y más lento. Puedes exportar a resolución original.',
            contrast: 'Contraste',
            contrastTail:
              ': preajuste de contraste antes del dithering. Cambios pequeños pueden afectar mucho el ruido en sombras/luces.',
            midtones: 'Midtones (gamma)',
            midtonesTail:
              ': ajusta la curva de brillo. Muy útil para recuperar medios tonos sin aplastar negros/blancos.',
            highlights: 'Altas luces',
            highlightsTail:
              ': empuja áreas brillantes hacia blanco. Ayuda a simplificar brillos y reducir “speckling”.',
            blur: 'Blur',
            blurTail:
              ': blur opcional previo para reducir ruido de alta frecuencia y mejorar degradados.',
            palette2:
              ': limita colores de salida. Paletas pequeñas estilizan; paletas grandes preservan gradientes. Paletas personalizadas permiten colores exactos.',
            serpentine2:
              ': para difusión de error compatible, alterna dirección por fila para reducir rayas direccionales.',
            serpentinePattern: 'Patrón serpentine',
            serpentinePatternTail:
              ': elige cómo se comporta el escaneo serpentine (afecta artefactos direccionales).',
            errorStrength: 'Intensidad de difusión de error',
            errorStrengthTail:
              ': escala cuánto error se difunde. Más bajo puede verse más limpio; más alto más nítido pero más ruidoso.',
            asciiRamp: 'Rampa ASCII',
            asciiRampTail:
              ': solo para ASCII Mosaic. Define qué caracteres representan oscuro → claro.',
            customKernel: 'Kernel personalizado + divisor',
            customKernelTail:
              ': solo para Kernel personalizado. Define la matriz y divisor para experimentar con difusión.',
            grid: 'Rejilla',
            gridTail:
              ': ayuda visual para alineación. No cambia la exportación; ayuda a juzgar escala del patrón.',
            gridSize: 'Tamaño de rejilla',
            gridSizeTail:
              ': cambia el espaciado en píxeles para que coincida con tu resolución objetivo.',
            presets: 'Presets / aleatorio / compartir',
            presetsTail:
              ': guarda y reutiliza ajustes, randomiza para inspiración y copia un enlace que codifica los parámetros actuales.',
            export: 'Exportar',
            exportTail:
              ': descarga PNG/JPEG/WebP (y SVG para imágenes). La exportación puede generarse a resolución original para máxima calidad.',
          },
          artifacts: {
            title: 'Artefactos comunes (y qué probar)',
            banding: 'Banding',
            bandingTail: ': usa difusión de error, prueba serpentine y sube la resolución de trabajo.',
            tiles: 'Tiles visibles',
            tilesTail: ': elige una matriz ordenada más grande o cambia a difusión de error.',
            worms: 'Worms / rayas',
            wormsTail: ': activa serpentine, baja un poco el contraste o prueba otro kernel de difusión.',
          },
          prev: '← Básicos',
          ctaExplorer: 'Explorar algoritmos',
          finish: 'Final: abrir la herramienta',
        },
      },
    };

export default education;


