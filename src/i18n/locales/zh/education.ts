const education = {
        education: {
          seo: {
            title: '什么是抖动？有序抖动、误差扩散与 Floyd–Steinberg',
            description:
              '学习抖动的定义与常见方法：有序抖动（拜耳矩阵）和误差扩散（Floyd–Steinberg）。了解何时使用彩色抖动，并在线快速试用。',
          },

          header: {
            title: '学习',
            navTool: '工具',
            navReference: '参考',
            navHome: '首页',
            navEducation: '学习',
          },

          title: '抖动学习',
          heroImageAlt: '抖动学习横幅',

          strong: {
            dithering: '抖动',
            definition: '定义：',
            tip: '提示：',
            wikipedia: '维基百科',
            ordered: '有序抖动',
            threshold: '阈值',
            workingResolution: '工作分辨率',
            palette: '调色板',
            serpentine: '蛇形扫描',
          },

          lead: {
            tail:
              '是一种通过刻意加入图案或噪点，来模拟比调色板（或显示设备）能够呈现更多的色调与颜色的方法。它常用于减少渐变色带、营造复古像素风，或模拟印刷半色调的质感。',
          },

          cta: {
            openTool: '打开工具',
            basics: '从基础开始',
            practice: '进入实践',
            tryImage: '在图片上试试',
            tryVideo: '在视频上试试',
            exploreAlgorithms: '探索算法',
          },

          preview: {
            title: '快速示例（随机设置）',
            hint: '拖动滑块',
            loading: '正在生成预览…',
            fallback: '此设备上无法显示预览。',
          },

          onboarding: {
            title: '从这里开始（2 步）',
            body:
              '如果你刚接触抖动，建议先学核心概念，再用几条简单“配方”快速上手。',
            step1: {
              kicker: '第 1 步',
              body:
                '了解定义、有序抖动（拜耳）与误差扩散（Floyd–Steinberg）——足以理解更换算法时纹理为何会变化。',
            },
            step2: {
              kicker: '第 2 步',
              body:
                '用少量配方和关键旋钮快速出效果：阈值、蛇形扫描、调色板，以及常见伪影。',
            },
          },

          whatIs: {
            title: '什么是抖动？（定义）',
            body:
              '在计算机图形中，抖动是一种用有限的颜色/灰度级去近似更多色调的方法。与其在量化后得到分段明显的渐变，不如把像素按规则分布成可控图案，让人眼在视觉上“混合”出中间色调。',
            point1: '减少渐变中的可见色带',
            point2: '让有限调色板更丰富（彩色抖动）',
            point3: '创造复古 / 像素风质感',
          },

          families: {
            title: '两大主要家族',
            ordered: {
              title: '有序抖动（拜耳矩阵）',
              body:
                '有序抖动将每个像素的亮度与重复的阈值矩阵进行比较。它非常快、结果稳定，而且“有图案”的质感常用于像素风与风格化图形。',
              cta: '查看 Bayer 4×4',
              point1: '适合想要可重复、可控的结构化纹理时。',
              point2: '常见伪影：明显的平铺/网格感（矩阵大小很重要）。',
            },
            error: {
              title: '误差扩散（Floyd–Steinberg）',
              body:
                '误差扩散把像素量化到最近的可用色调，然后把误差分配给邻近像素。它通常能得到更“自然”的纹理与更平滑的渐变。',
              cta: '查看 Floyd–Steinberg',
              point1: '适合照片和渐变；通常更善于隐藏色带。',
              point2: '常见伪影：虫纹/条纹或方向性噪点（蛇形扫描有帮助）。',
            },
            tryInTool: '在工具中尝试',
          },

          color: {
            title: '彩色抖动 vs 灰度抖动',
            body:
              '灰度抖动用黑/白（或少量灰阶）去近似更多亮度；彩色抖动用有限颜色集合去近似更多颜色。调色板的选择会强烈影响风格：小调色板更复古，大调色板更平滑。',
          },

          when: {
            title: '什么时候使用抖动',
            good: {
              title: '适合',
              1: '渐变和天空（减少色带）',
              2: '像素艺术、复古/CRT 风格',
              3: '类似印刷的半色调和点描风格',
            },
            avoid: {
              title: '不适合',
              1: '需要完美平滑的色调过渡',
              2: '细小文字需要保持极致锐利',
              3: '噪点或图案会干扰观看',
            },
          },

          faq: {
            title: '常见问题',
            q1: '有序抖动和误差扩散有什么区别？',
            a1:
              '有序抖动使用重复阈值矩阵（快、有图案、确定性强）；误差扩散把量化误差分配给邻域（渐变更平滑、更自然）。两者都常用，按你想要的纹理选择。',
            q2: '什么是 Floyd–Steinberg 抖动？',
            a2:
              'Floyd–Steinberg 是经典的误差扩散算法，使用固定权重把量化误差扩散到邻近像素。它是“默认推荐”的强力基准：平衡质量与速度，渐变表现稳定。',
            q3: '什么是拜耳矩阵？',
            a3:
              '拜耳矩阵是一种有序阈值图案（例如 4×4、8×8），用于有序抖动。它会产生可控的重复结构，纹理清晰且很适合像素风。',
          },

          next: {
            title: '下一步：动手试试',
            body:
              '选择一张包含渐变的图片，对比 Bayer 与 Floyd–Steinberg。然后尝试限制调色板，观察彩色抖动的变化。',
            cta1: '打开工具',
            cta2: '浏览算法详情',
          },

          basics: {
            seo: {
              title: '抖动基础 | 定义、拜耳矩阵与误差扩散',
              description:
                '抖动基础知识：抖动的定义、如何减少色带，以及有序抖动（拜耳）与误差扩散（Floyd–Steinberg）的区别。',
            },
            title: '基础',
            lead: '快速建立概念：抖动是什么、解决什么问题、两大算法家族各自的特点。',
            whatIs: {
              bodyTail:
                '是一种通过把像素组织成图案来模拟更多色调的技术。在图形处理中，抖动常用于量化之后（减少颜色/灰度级），以降低色带并形成可控的抖动效果。',
            },
            ditherVsDithering: {
              title: 'dither 与 dithering',
              body:
                '：两者通常指同一件事——用图案/噪点隐藏量化带来的台阶。目的不是增加真实细节，而是改变人眼对色调台阶的感知。',
            },
            bandings: {
              title: '为什么抖动能减少色带',
              body:
                '当平滑渐变被压缩到很少的等级（例如 256 → 16）时就会出现色带。抖动把缺失的中间色调分散到图案中，让过渡看起来更平滑。',
              point1: '量化减少可用色调/颜色；抖动把“台阶”隐藏起来。',
              point2: '不同算法在速度、纹理与伪影之间做取舍。',
            },
            whenToUse: {
              title: '什么时候选哪一种',
              ordered: '选择有序抖动，当…',
              ordered1: '你想要干净、可重复的图案纹理（像素画 / UI 图标）。',
              ordered2: '你需要更高速度或确定性的结果。',
              error: '选择误差扩散，当…',
              error1: '你在处理照片/渐变，希望过渡更自然。',
              error2: '你在减色后想尽量隐藏色带。',
            },
            history: {
              title: '非常简短的历史',
              body:
                '当显示或打印设备无法呈现足够多的色调时，抖动就非常重要。早期的显示器与打印机广泛依赖抖动；今天它也经常被用作一种风格化纹理。',
              body2:
                '现代工具让你在结构化的有序抖动与更“有机”的误差扩散之间自由选择，并根据速度与伪影做权衡。',
            },
            keyTerms: {
              title: '关键词（速览）',
              quantization: '量化',
              quantizationTail: '：减少可用的色调或颜色数量。',
              threshold: '阈值',
              thresholdTail: '：用于决定输出明/暗的分界点（很多算法都会用到）。',
              bayer: '拜耳矩阵',
              bayerTail: '：有序抖动使用的重复阈值矩阵。',
              palette: '调色板',
              paletteTail: '：固定的颜色集合；彩色抖动只能用这些颜色去近似原图。',
            },
            sources: {
              title: '资料与延伸阅读',
            },
            ctaHome: '返回学习',
            ctaNext: '继续到实践',
          },

          practice: {
            seo: {
              title: '抖动实践 | 设置、伪影与快速配方',
              description:
                '实用抖动技巧：3 步工作流、各个设置的作用，以及如何修复常见抖动伪影，导出高质量结果。',
            },
            title: '实践',
            lead: '一个可复制的工作流：选算法、调参数、修伪影、再以原分辨率导出。',
            workflow: {
              title: '简单的 3 步工作流',
              lead:
                '如果你不知道从哪开始，这个流程能快速得到稳定的结果，并且与图片工具中的设置一一对应。',
              step1: {
                kicker: '第 1 步',
                title: '选择算法家族',
                body:
                  '照片/渐变：先试误差扩散（Floyd–Steinberg、Sierra 等）。像素风/结构化纹理：先试有序抖动（Bayer、蓝噪）。',
              },
              step2: {
                kicker: '第 2 步',
                title: '把色调与尺度调对',
                body:
                  '先设定工作分辨率（速度 vs 细节），再通过对比度/中间调（gamma）/高光（以及可选模糊）让抖动前的色调更稳定。',
              },
              step3: {
                kicker: '第 3 步',
                title: '微调并导出',
                body:
                  '调整阈值/反相、蛇形扫描（扩散算法）、调色板与算法特定选项。满意后，以原始分辨率导出。',
              },
            },
            recipes: {
              title: '快速配方',
              photo: {
                title: '照片（自然纹理）',
                li1: '先用 Floyd–Steinberg 或 Sierra 变体，再微调阈值。',
                li2: '如果出现明显方向性条纹，开启蛇形扫描。',
                li3: '小调色板（4–16）更风格化；大调色板更平滑。',
                li4: '阴影噪点太多时，降低对比度、调整 gamma 或加入少量模糊。',
              },
              pixel: {
                title: '像素画/图标（干净结构）',
                li1: '尝试有序抖动（Bayer 4×4 或 8×8）获得可预测的图案。',
                li2: '保持小调色板（2–8 色），用阈值控制图案密度。',
                li3: '出现明显平铺时，切换矩阵大小（4×4 → 8×8 → 16×16）。',
              },
            },
            controls: {
              title: '主要控制项做什么',
              lead:
                '本列表对应图片工具中的设置。部分控制项只在特定算法下出现（例如 ASCII 字符集或自定义核）。',
              algorithm: '算法',
              algorithmTail: '：选择抖动方法（误差扩散、有序/Bayer、蓝噪等），决定纹理、伪影与性能。',
              threshold2: '：调整分界点。更低 → 更偏暗；更高 → 更偏亮。',
              invert: '反相',
              invertTail: '：明暗互换（暗 ↔ 亮），可用于负片效果或调色板反转时。',
              resolution2: '：预览/处理的工作缩放。低=更快更粗；高=更慢更清晰。导出仍可用原始分辨率。',
              contrast: '对比度',
              contrastTail: '：抖动前的对比度预处理。小改动也可能显著影响阴影/高光噪点。',
              midtones: '中间调（Gamma）',
              midtonesTail: '：调整亮度曲线（不是简单亮度滑杆），适合在不压黑/不过曝的情况下修复中间调。',
              highlights: '高光',
              highlightsTail: '：把亮部推向白色，有助于减少高光区域的颗粒/噪点。',
              blur: '模糊',
              blurTail: '：可选的抖动前模糊，用于降低高频噪点并让渐变更干净。',
              palette2: '：限制输出颜色。小调色板更风格化；大调色板更保留渐变。自定义调色板可指定精确颜色。',
              serpentine2: '：对支持的误差扩散算法，逐行交替扫描方向以减少方向性条纹。',
              serpentinePattern: '蛇形模式',
              serpentinePatternTail: '：选择蛇形扫描的具体方式（会影响方向性伪影的感觉）。',
              errorStrength: '误差扩散强度',
              errorStrengthTail: '：缩放扩散误差的力度。较低更干净；较高更锐利但可能更噪。',
              asciiRamp: 'ASCII 字符集',
              asciiRampTail: '：仅用于 ASCII Mosaic。定义从暗到亮用哪些字符表示。',
              customKernel: '自定义核 + 除数',
              customKernelTail: '：仅用于 Custom Kernel。你可以定义扩散矩阵与除数来实验新的扩散行为。',
              grid: '网格叠加',
              gridTail: '：预览辅助，不影响导出；帮助判断图案尺度与像素对齐。',
              gridSize: '网格大小',
              gridSizeTail: '：调整网格间距（像素），以匹配目标分辨率。',
              presets: '预设/随机/分享',
              presetsTail: '：保存并复用设置，随机生成灵感，并复制包含当前参数的分享链接。',
              export: '导出',
              exportTail: '：下载 PNG/JPEG/WebP（图片还支持 SVG）。可按原始分辨率重新处理以获得最佳质量。',
            },
            artifacts: {
              title: '常见伪影（以及可尝试的修复）',
              banding: '色带',
              bandingTail: '：使用误差扩散、开启蛇形扫描，并提高工作分辨率。',
              tiles: '平铺感',
              tilesTail: '：选择更大的有序矩阵或切换到误差扩散。',
              worms: '虫纹/条纹',
              wormsTail: '：开启蛇形扫描，稍微降低对比度，或换一种扩散核。',
            },
            prev: '← 基础',
            ctaExplorer: '探索算法',
            finish: '完成：打开工具',
          },
        },
      };

export default education;


