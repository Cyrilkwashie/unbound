import { getFrameSrc } from "@/lib/frames";

type CampaignStillProps = {
  frame: number;
  alt: string;
  className?: string;
};

export const CampaignStill = ({ frame, alt, className }: CampaignStillProps) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={getFrameSrc(frame)}
      alt={alt}
      className={className}
      onError={(event) => {
        event.currentTarget.style.opacity = "0";
      }}
    />
  );
};
