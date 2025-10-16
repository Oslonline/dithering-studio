import React from "react";
import { useTranslation } from "react-i18next";

interface UploadIntroProps { mode: 'image' | 'video'; }

const UploadIntro: React.FC<UploadIntroProps> = ({ mode }) => {
  const { t } = useTranslation();
  const isVideo = mode === 'video';
  return (
    <div className="min-panel relative space-y-3 p-4">
      <h2 className="font-anton text-xl leading-tight">{t('tool.intro.title')} — {isVideo ? t('tool.intro.video') : t('tool.intro.image')}</h2>
      <p className="text-[11px] leading-relaxed text-gray-400">{isVideo ? t('tool.intro.videoDesc') : t('tool.intro.imageDesc')}</p>
      <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
        <li>{t('tool.intro.step1')}</li>
        <li>{isVideo ? t('tool.intro.step2Video') : t('tool.intro.step2Image')}</li>
        <li>{isVideo ? t('tool.intro.step3Video') : t('tool.intro.step3Image')}</li>
        <li>{isVideo ? t('tool.intro.step4Video') : t('tool.intro.step4Image')}</li>
      </ul>
    </div>
  );
};

export default UploadIntro;
